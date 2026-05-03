export default interface matchHistoryItemProps {
    id?: string,
    date: string,
    matchLabel: string,
    batting?: string,
    bowling?:string,
    onEdit: () => void
}
