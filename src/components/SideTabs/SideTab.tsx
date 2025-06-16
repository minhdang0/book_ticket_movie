
type Props = {
    title: string,
    children: React.ReactNode
}
const SideTab: React.FC<Props> = ({ title, children }) => {
    return (
        <>
            {title && <>{children}</>}
        </>
    )
}
export default SideTab;