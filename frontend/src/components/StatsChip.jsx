export default function StatsChip( { head, body }){
    return(
        <div style = { { backgroundColor : "var(--black4)", borderRadius : "var(--br)", padding : "24px" } }>
            <p>{ head }</p>
            <h1 className = "number" style = { { fontSize : "var(--font-size-huge)"} }>{ body }</h1>
        </div>
    )
}