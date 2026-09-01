export default interface PlayerCardProps {
    playerName: string;
    role: string;
    batting_hand?: string | null;
    bowling_hand?: string | null;
    bowling_style?: string | null;
    totalRuns: number;
    totalWickets: number;
}