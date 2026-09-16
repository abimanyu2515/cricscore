/**
 * Concurrent load test for the CricScore AI assistant endpoint.
 *
 * Usage:
 *   node scripts/load-test-assistant.mjs
 *   BASE_URL=https://your-app.vercel.app CONCURRENCY=10 node scripts/load-test-assistant.mjs
 *
 * Requires Node 18+ (built-in fetch). No dependencies, no cost.
 *
 * IMPORTANT: Adjust `ENDPOINT` and the request body shape (the `message`
 * field name) below to match your actual app/api/assistant/route.ts contract.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Auto-load ACCESS_PIN (and BASE_URL/CONCURRENCY) from .env.local / .env so
// `node scripts/load-test-assistant.mjs` works without manual `ACCESS_PIN=...` prefix.
// Node's fetch does NOT auto-load Next.js env files.
function loadEnvFile() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(__dirname, "..", ".env.local"),
    path.join(__dirname, "..", ".env"),
  ];
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      // strip surrounding single or double quotes (Next.js .env.local uses 'value')
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
    // only load first existing file (.env.local takes precedence)
    break;
  }
}
loadEnvFile();

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ENDPOINT = "/api/assistant";
const CONCURRENCY = Number(process.env.CONCURRENCY || 10); // 5-10 per your test
const ACCESS_PIN = process.env.ACCESS_PIN; // the 5-digit site PIN, required

// proxy.ts gates every route except /access, /admin-access, and the two
// verify endpoints behind a cricscore_access cookie. We authenticate once
// up front, then attach that cookie manually to every concurrent request
// (Node's fetch does not share a cookie jar across calls the way a browser does).
async function getAccessCookie() {
  if (!ACCESS_PIN) {
    throw new Error(
      "Set ACCESS_PIN env var to your 5-digit site PIN, e.g. ACCESS_PIN=12345 node scripts/load-test-assistant.mjs"
    );
  }
  const res = await fetch(`${BASE_URL}/api/auth/verify-access`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin: ACCESS_PIN }),
  });
  if (!res.ok) {
    throw new Error(`Failed to authenticate: ${res.status} ${await res.text()} (using PIN=${ACCESS_PIN})`);
  }
  // Node 18+ undici: headers.getSetCookie() is the reliable way; fall back to get("set-cookie")
  const rawCookies = typeof res.headers.getSetCookie === "function"
    ? res.headers.getSetCookie()
    : res.headers.get("set-cookie") ? [res.headers.get("set-cookie")] : [];
  if (!rawCookies.length) {
    throw new Error("No Set-Cookie header returned from verify-access");
  }
  // Find the cricscore_access cookie and strip attributes (Path=, HttpOnly, etc.)
  const accessCookieRaw = rawCookies.find((c) => c.startsWith("cricscore_access=")) || rawCookies[0];
  return accessCookieRaw.split(";")[0];
}

// Mix of query types spanning your three tiers, so the test exercises
// Tier 1 (precomputed), Tier 2 (query_team_data), and Tier 3 (sequential/windowed)
// tool paths rather than hammering the same cached path repeatedly.
const SAMPLE_QUERIES = [
  "Give the no of innings in which Praveen has taken a 2-wicket haul?",     
  "If Adhavh scores 55*(29) more runs, what's his new batting stats?",
  "Rank all players based on bowling economy rate (bowled minimum 3 innings).",
  "Which bowler has the best bowling figures in a match?", 
  "List the all players whose highest score is less than 10.",
  "How many innings it took Akshay to CROSS 50 career runs?",
  "How has Advaith performed in his last 4 innings?",
  "List Josiah's performance against each The Uncharted XI.",
  "Show me the top 5 run scorers leaderboard",
  "Compare Sai Karthik, Harshavardhan. Report who has performed better as a batsman, bowler and all-rounder."
];

function pickQuery(i) {
  return SAMPLE_QUERIES[i % SAMPLE_QUERIES.length];
}

async function fireQuery(userIndex, cookie) {
  const message = pickQuery(userIndex);
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ message }),
      redirect: "manual", // so a redirect back to /access shows up as a 3xx, not a silent 200
    });
    const elapsedMs = Math.round(performance.now() - start);
    const isRedirect = res.status >= 300 && res.status < 400;
    const bodyText = isRedirect ? `redirected to ${res.headers.get("location")}` : await res.text();
    return {
      userIndex,
      query: message,
      status: res.status,
      ok: res.ok && !isRedirect,
      elapsedMs,
      rateLimited: res.status === 429,
      bodyPreview: bodyText.slice(0, 150),
    };
  } catch (err) {
    const elapsedMs = Math.round(performance.now() - start);
    return {
      userIndex,
      query: message,
      status: "ERROR",
      ok: false,
      elapsedMs,
      rateLimited: false,
      bodyPreview: String(err),
    };
  }
}

async function main() {
  console.log(`Authenticating against ${BASE_URL} ...`);
  const cookie = await getAccessCookie();
  console.log(`Got access cookie. Firing ${CONCURRENCY} concurrent requests at ${BASE_URL}${ENDPOINT}\n`);

  const start = performance.now();
  const results = await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, i) => fireQuery(i, cookie))
  );
  const totalElapsed = Math.round(performance.now() - start);

  results.forEach((r) => {
    const tag = r.ok ? "OK " : r.rateLimited ? "429" : !r.ok ? "500" : 'ERR';
    console.log(
      `[${tag}] user ${r.userIndex} | ${r.elapsedMs}ms | "${r.query}"` +
        (r.ok ? "" : ` -> ${r.bodyPreview}`)
    );
  });

  const succeeded = results.filter((r) => r.ok).length;
  const rateLimited = results.filter((r) => r.rateLimited).length;
  const failed = results.length - succeeded - rateLimited;
  const avgMs = Math.round(
    results.reduce((sum, r) => sum + r.elapsedMs, 0) / results.length
  );
  const maxMs = Math.max(...results.map((r) => r.elapsedMs));

  console.log("\n--- Summary ---");
  console.log(`Total wall time for batch: ${totalElapsed}ms`);
  console.log(`Succeeded: ${succeeded} / ${results.length}`);
  console.log(`Rate limited (429): ${rateLimited}`);
  console.log(`Other failures: ${failed}`);
  console.log(`Avg response time: ${avgMs}ms | Slowest: ${maxMs}ms`);
}

main();
