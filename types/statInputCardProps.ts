export default interface statInputCardProps {
    title: "BATTING" | "BOWLING",
    accentColor: "cyan" | "purple",
    fields: {
        label: string,
        value: string,
        onChange: (value: string) => void,
        type?: "number" | "select",
        options?: string[]
    }[]
}
