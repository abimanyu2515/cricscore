export default interface DateMatchRowProps {
    date: string,
    onDateChange: (date: string) => void,
    matchLabel: string,
    onMatchLabelChange: (matchLabel: string) => void
}