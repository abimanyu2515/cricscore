export const BATTING_HAND_OPTIONS = ['Right', 'Left'] as const
export type BattingHand = typeof BATTING_HAND_OPTIONS[number]

export const BOWLING_HAND_OPTIONS = ['Right', 'Left'] as const
export type BowlingHand = typeof BOWLING_HAND_OPTIONS[number]

export const BOWLING_STYLE_OPTIONS = ['Fast', 'Fast-medium', 'Medium-fast', 'Medium', 'Off spin', 'Leg spin'] as const
export type BowlingStyle = typeof BOWLING_STYLE_OPTIONS[number]

export type PlayerStyle = {
  batting_hand?: string | null
  bowling_hand?: string | null
  bowling_style?: string | null
  role?: string | null
}

export function normalizeBattingHand(v: unknown): BattingHand {
  return v === 'Left' ? 'Left' : 'Right'
}

export function normalizeBowlingHand(v: unknown): BowlingHand {
  return v === 'Left' ? 'Left' : 'Right'
}

export function normalizeBowlingStyle(v: unknown): BowlingStyle {
  if (typeof v === 'string' && (BOWLING_STYLE_OPTIONS as readonly string[]).includes(v)) {
    return v as BowlingStyle
  }
  return 'Medium'
}

export function formatPlayerStyle(player: PlayerStyle): string {
  const battingHand = normalizeBattingHand(player.batting_hand)
  const bowlingHand = normalizeBowlingHand(player.bowling_hand)
  const bowlingStyle = normalizeBowlingStyle(player.bowling_style)

  const battingLabel = `${battingHand}-hand bat`
  const bowlingLabel = `${bowlingHand}-arm ${bowlingStyle}`

  // Show both batting and bowling for all roles per spec; if role explicitly Batsman/Bowler
  // we still show combined as "batting • bowling" to fulfill display requirement.
  // Keeping logic extensible if product wants role-specific filtering later.
  return `${battingLabel} • ${bowlingLabel}`
}

export function getBattingLabel(hand: string | null | undefined): string {
  const h = normalizeBattingHand(hand)
  return `${h}-hand bat`
}

export function getBowlingLabel(hand: string | null | undefined, style: string | null | undefined): string {
  const h = normalizeBowlingHand(hand)
  const s = normalizeBowlingStyle(style)
  return `${h}-arm ${s}`
}
