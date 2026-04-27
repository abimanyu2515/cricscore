export default interface matchHistoryItemProps {
    date: string,
    matchLabel: string,
    batting?: string,
    bowling?:string,
    onEdit: () => void
}
