export default function TeamDivider( { text, length }){
    return(
        <div style = { { display : "flex", flexDirection : "row", paddingTop : "72px", paddingBottom : "8px", borderBottom : "2px solid var(--black8)" }}>
            <h3 style = { { flex : 1 } }>{ text } ({ length })</h3>

            <select style = { { marginBottom : "8px" } }>
                <option value = "Most Played Games">Most Played</option>
                <option value = "Test">Test</option>
            </select>
        </div>
    )
}