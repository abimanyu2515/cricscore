import { supabase } from "./supabase";

export interface RosterEntry {
  id: string;
  name: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — players are added rarely

let cache: { data: RosterEntry[]; expiresAt: number } | null = null;

/**
 * Returns the full player roster (id + name only), cached in memory.
 * Refetches from Supabase only when the cache is empty or stale.
 */
export async function getPlayerRoster(): Promise<RosterEntry[]> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  const { data, error } = await supabase
    .from("players")
    .select("id, name")
    .order("name");

  if (error) {
    // If Supabase is briefly unavailable, prefer serving a stale cache
    // over failing the whole assistant turn, if one exists.
    if (cache) return cache.data;
    throw new Error(`Failed to fetch player roster: ${error.message}`);
  }

  cache = { data: data ?? [], expiresAt: Date.now() + CACHE_TTL_MS };
  return cache.data;
}

/**
 * Call this after any player create/edit/delete so the assistant sees
 * the change immediately instead of waiting up to CACHE_TTL_MS.
 */
export function invalidatePlayerRosterCache(): void {
  cache = null;
}