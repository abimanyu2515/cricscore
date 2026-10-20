'use client'

import GuideStepperCard from '@/components/ui/GuideStepperCard'
import { Zap, Edit, List, Shield, Trophy, Target, HelpCircle, AlertTriangle, CheckCircle, XCircle, MousePointer, Touchpad, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const HowToUsePage = () => {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mb-8 p-5">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-zinc-400 hover:text-cyan-300 transition-colors font-mono text-sm"
            aria-label="Go back"
          >
            <ArrowLeft width={16} height={16} className="transition-transform group-hover:-translate-x-1" />
            <span>BACK</span>
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-2 lg:px-0">
        {/* Header */}
        <header className="mb-12 lg:mb-16 text-center">
          <h1 className="font-rajdhani font-bold text-4xl lg:text-5xl tracking-widest mb-4">
            <span className="text-cyan-300">HOW TO USE</span><span className="text-[#b9e03c]"> CRICSCORE</span>
          </h1>
          <p className="font-mono text-zinc-400 text-sm lg:text-base max-w-2xl mx-auto leading-relaxed">
            A quick reference for every core flow — PIN entry, adding players, scoring matches, viewing stats, and admin actions.
            Tap any step to expand for details, rules, and tips.
          </p>
        </header>

        {/* Step 1: PIN Entry */}
        <GuideStepperCard
          number="1"
          title="Enter Your Access PIN"
          summary="5‑digit team PIN grants 30‑day cookie access. No account creation needed."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded border border-zinc-700">
              <Zap className="text-cyan-400 mt-0.5 flex-shrink-0" width={20} height={20} />
              <div>
                <h4 className="font-sans font-semibold text-white mb-1">How it works</h4>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                  Visit the app, enter the 5‑digit team PIN on the access screen. On success, a secure cookie is set for 30 days.
                  You won't need to re‑enter the PIN unless you clear cookies or switch devices.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                <h5 className="font-mono text-xs text-cyan-400 tracking-widest mb-2">DO</h5>
                <ul className="font-mono text-xs text-zinc-300 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle width={12} height={12} className="text-green-400 flex-shrink-0" /> Use the PIN your captain shared</li>
                  <li className="flex items-center gap-2"><CheckCircle width={12} height={12} className="text-green-400 flex-shrink-0" /> Bookmark the page after first login</li>
                </ul>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                <h5 className="font-mono text-xs text-purple-400 tracking-widest mb-2">DON'T</h5>
                <ul className="font-mono text-xs text-zinc-300 space-y-1">
                  <li className="flex items-center gap-2"><XCircle width={12} height={12} className="text-red-400 flex-shrink-0" /> Share the PIN outside the team</li>
                  <li className="flex items-center gap-2"><XCircle width={12} height={12} className="text-red-400 flex-shrink-0" /> Confuse it with the 4‑digit admin PIN</li>
                </ul>
              </div>
            </div>
            <p className="font-mono text-xs text-zinc-500"><kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded">Mobile</kbd> Tap each digit box, it auto‑advances. <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded">Desktop</kbd> Type all 5 digits, press Enter.</p>
          </div>
        </GuideStepperCard>

        {/* Step 2: Add Player */}
        <GuideStepperCard
          number="2"
          title="Add a New Player"
          summary="Only admins can create players. Fill name, role, batting/bowling hand, and style."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded border border-zinc-700">
              <Edit className="text-cyan-400 mt-0.5 flex-shrink-0" width={20} height={20} />
              <div>
                <h4 className="font-sans font-semibold text-white mb-1">How it works</h4>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                  On the admin page, tap the <strong className="text-cyan-300">+ Add Player</strong>.
                  Fill the dialog: <strong>Name</strong> (required), <strong>Role</strong> (Batsman / Bowler / All‑rounder), <strong>Batting Hand</strong>, <strong>Bowling Hand</strong>, <strong>Bowling Style</strong>.
                  Tap <strong>CREATE PLAYER</strong> — the new card appears instantly.
                </p>
              </div>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
              <h5 className="font-mono text-xs text-cyan-400 tracking-widest mb-2">Role determines leaderboard tabs</h5>
              <p className="font-mono text-xs text-zinc-400">
                Batsmen show in <strong className="text-cyan-300">Batting</strong>, Bowlers in <strong className="text-purple-300">Bowling</strong>, All‑rounders in both.
                Pick the primary role — stats compute automatically from scores.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                <h5 className="font-mono text-xs text-cyan-400 tracking-widest mb-2">TIPS</h5>
                <ul className="font-mono text-xs text-zinc-300 space-y-1">
                  <li><MousePointer width={12} height={12} className="inline-block text-cyan-400 mr-1" /> Single tap the <strong>+ Add Player</strong> to open dialog</li>
                  <li><Touchpad width={12} height={12} className="inline-block text-cyan-400 mr-1" /> Long press any player card for their profile</li>
                </ul>
              </div>
            </div>
          </div>
        </GuideStepperCard>

        {/* Step 3: Add Score (Single Tap) */}
        <GuideStepperCard
          number="3"
          title="Add a Match Score (Single Tap)"
          summary="Tap any player card → enter match label, batting runs breakdown, and bowling figures. Validation runs on submit."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded border border-zinc-700">
              <Target className="text-cyan-400 mt-0.5 flex-shrink-0" width={20} height={20} />
              <div>
                <h4 className="font-sans font-semibold text-white mb-1">How it works</h4>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                  <strong className="text-cyan-300">Single tap</strong> a player card → the score entry screen opens.
                  Required: <strong>Match Label</strong> (e.g. "vs Lions, 12 Aug").
                  <strong>Batting</strong>: enter total Runs, then break down into Singles, Doubles, Triples, Fours, Sixes. The sum must equal total Runs.
                  <strong>Bowling</strong>: Overs, Maidens, Runs Conceded, Wickets. If overs &gt; 0, wickets and runs are validated.
                </p>
              </div>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700 border-yellow-500/30">
              <h5 className="font-mono text-xs text-yellow-400 tracking-widest mb-2 flex items-center gap-1"><AlertTriangle width={12} height={12} /> Validation rules</h5>
              <ul className="font-mono text-xs text-zinc-300 space-y-1">
                <li>• Match Label cannot be empty</li>
                <li>• Singles + Doubles×2 + Triples×3 + Fours×4 + Sixes×6 = Total Runs</li>
                <li>• If Overs &gt; 0, Wickets and Runs Conceded must be entered</li>
                <li>• Economy = Runs Conceded / Overs (auto‑calculated)</li>
                <li>• Strike Rate = (Runs / Balls Faced) × 100 (Balls = Singles + Doubles + Triples + Fours + Sixes)</li>
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                <h5 className="font-mono text-xs text-cyan-400 tracking-widest mb-2">BATTING FIELDS</h5>
                <ul className="font-mono text-xs text-zinc-300 space-y-1">
                  <li>Runs (total)</li>
                  <li>Singles / Doubles / Triples</li>
                  <li>Fours / Sixes</li>
                  <li>Balls Faced (auto from breakdown)</li>
                </ul>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                <h5 className="font-mono text-xs text-purple-400 tracking-widest mb-2">BOWLING FIELDS</h5>
                <ul className="font-mono text-xs text-zinc-300 space-y-1">
                  <li>Overs (e.g. 4.3)</li>
                  <li>Maidens</li>
                  <li>Runs Conceded</li>
                  <li>Wickets</li>
                </ul>
              </div>
            </div>
          </div>
        </GuideStepperCard>

        {/* Step 4: Profile & Match History (Long Press) */}
        <GuideStepperCard
          number="4"
          title="View Profile & Match History (Long Press)"
          summary="Long press any player card → see career stats, averages, strike rates, and filterable match history."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded border border-zinc-700">
              <List className="text-cyan-400 mt-0.5 flex-shrink-0" width={20} height={20} />
              <div>
                <h4 className="font-sans font-semibold text-white mb-1">How it works</h4>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                  <strong className="text-cyan-300">Long press</strong> (hold ~500ms) any player card on the home page.
                  The profile page shows: <strong>Header</strong> with name, role, batting/bowling hand/style badges.
                  <strong>Stats Grid</strong>: Total Runs, Batting Average, Strike Rate, Highest Score, Total Wickets, Bowling Average, Economy, Best Bowling.
                  <strong>Match History</strong>: every score entry as a card with date, label, runs, balls, strike rate, overs, wickets, economy.
                </p>
              </div>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
              <h5 className="font-mono text-xs text-cyan-400 tracking-widest mb-2">Filter match history</h5>
              <p className="font-mono text-xs text-zinc-400 mb-2">Tap the <strong>Filter</strong> button (top right) to select Month and Year. Defaults to all time.</p>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
              <h5 className="font-mono text-xs text-cyan-400 tracking-widest mb-2">Admin actions on match cards</h5>
              <p className="font-mono text-xs text-zinc-400">
                If you are an admin, each match card shows an <strong>Edit</strong> button (requires admin PIN re‑entry).
                You can edit any field <strong>except Match Date and Match Label</strong>. Use <strong>Delete</strong> to remove an entry for a match the player didn't play.
              </p>
            </div>
          </div>
        </GuideStepperCard>

        {/* Step 5: Overall Stats Leaderboard */}
        <GuideStepperCard
          number="5"
          title="Overall Stats Leaderboard"
          summary="Ranks all players with Batting, Bowling, and All‑rounder in two tabs. Rank 1 highlighted."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded border border-zinc-700">
              <Trophy className="text-[#b9e03c] mt-0.5 flex-shrink-0" width={20} height={20} />
              <div>
                <h4 className="font-sans font-semibold text-white mb-1">How it works</h4>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                  Navigate via <strong>OVERALL STATS</strong> in the top nav (desktop) or Sidebar (mobile).
                  Two tabs: <strong className="text-cyan-300">Batting</strong>, <strong className="text-purple-300">Bowling</strong>.
                  Table shows Rank, Player, Role, and key stats. Sticky name column on horizontal scroll.
                  Rank 1 row gets a highlight border.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700 border-cyan-500/30">
                <h5 className="font-mono text-xs text-cyan-400 tracking-widest mb-2">BATTING COLUMNS</h5>
                <ul className="font-mono text-xs text-zinc-300 space-y-1">
                  <li>Runs</li>
                  <li>Average</li>
                  <li>Strike Rate</li>
                  <li>Highest Score</li>
                  <li>Fours / Sixes</li>
                </ul>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700 border-purple-500/30">
                <h5 className="font-mono text-xs text-purple-400 tracking-widest mb-2">BOWLING COLUMNS</h5>
                <ul className="font-mono text-xs text-zinc-300 space-y-1">
                  <li>Wickets</li>
                  <li>Average</li>
                  <li>Economy</li>
                  <li>Best Bowling</li>
                  <li>Maidens</li>
                </ul>
              </div>
            </div>
          </div>
        </GuideStepperCard>

        {/* Section: Matches Page */}
        <GuideStepperCard
          number="6"
          title="Matches Page (Team Results)"
          summary="Separate from player scores — team‑level results with results, scores, overs, location, date, and match type."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded border border-zinc-700">
              <Shield className="text-[#b9e03c] mt-0.5 flex-shrink-0" width={20} height={20} />
              <div>
                <h4 className="font-sans font-semibold text-white mb-1">How it works</h4>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                  Navigate via <strong>MATCHES</strong> in the top nav or Sidebar. This page is <strong>independent</strong> from player score entries.
                  Admins can add match results via the <strong>+ Add Match</strong> button.
                  Fields: Team 1, Team 2 (free text), Scores, Overs, Result (Won/Lost/Tied), Location, Date, Type (League/Tournament/Friendly).
                </p>
              </div>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700 border-yellow-500/30">
              <h5 className="font-mono text-xs text-yellow-400 tracking-widest mb-2 flex items-center gap-1"><HelpCircle width={12} height={12} /> Important distinction</h5>
              <p className="font-mono text-xs text-zinc-400">
                Player score entries (Step 3) use a <strong>Match Label</strong> + <strong>Date</strong> typed by the scorer.
                The Matches page stores <strong>team‑level results</strong> with no foreign key to player scores.
                They are correlated only by date — not programmatically linked.
              </p>
            </div>
          </div>
        </GuideStepperCard>

        {/* Section: Admin Actions */}
        <GuideStepperCard
          number="7"
          title="Admin Actions (Separate 4‑Digit PIN)"
          summary="Admins enter a 4‑digit PIN per sensitive action — no cookie stored. Manage players, edit/delete match entries."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded border border-zinc-700">
              <Shield className="text-purple-400 mt-0.5 flex-shrink-0" width={20} height={20} />
              <div>
                <h4 className="font-sans font-semibold text-white mb-1">How it works</h4>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                  Two admin entry points: <strong>MANAGE PLAYERS</strong> in nav (opens <code>/admin</code>), and <strong>Edit</strong> buttons on match history cards.
                  Each action prompts for the 4‑digit admin PIN. <strong>No cookie is stored</strong> — PIN required every time.
                  On <code>/admin</code>: edit player name/role, delete players created by mistake.
                  On match edit: change any field except <strong>Match Date</strong> and <strong>Match Label</strong> (locked).
                  Delete a score entry if the player didn't play that match.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700 border-purple-500/30">
                <h5 className="font-mono text-xs text-purple-400 tracking-widest mb-2">ADMIN CAN</h5>
                <ul className="font-mono text-xs text-zinc-300 space-y-1">
                  <li>Edit player name / role</li>
                  <li>Delete a player (mistake entries)</li>
                  <li>Edit score entry fields (runs, overs, etc.)</li>
                  <li>Delete a score entry</li>
                </ul>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700 border-red-500/30">
                <h5 className="font-mono text-xs text-red-400 tracking-widest mb-2">ADMIN CANNOT</h5>
                <ul className="font-mono text-xs text-zinc-300 space-y-1">
                  <li>Change Match Date</li>
                  <li>Change Match Label</li>
                  <li>Access without 4‑digit PIN</li>
                  <li>See the 5‑digit user PIN</li>
                </ul>
              </div>
            </div>
          </div>
        </GuideStepperCard>

        {/* Footer */}
        <footer className="my-10 pt-8 border-t border-zinc-800 text-center">
          <p className="font-mono text-xs text-zinc-500 mb-2">CricScore — Thunderbolts Stats Tracker</p>
          <p className="font-mono text-xs text-zinc-600">Questions? Ask your captain or the admin who set up the team.</p>
        </footer>
      </main>
    </div>
  )
}

export default HowToUsePage