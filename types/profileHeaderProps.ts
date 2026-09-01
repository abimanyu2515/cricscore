export default interface profileHeaderProps {
    name: string,
    role: string,
    batting_hand?: string | null,
    bowling_hand?: string | null,
    bowling_style?: string | null,
    onBack: () => void
}