export default function TeamDivider( { text, length }){
    return(
        <div style = { { display : "flex", flexDirection : "row" }}>
            <h2 style = { { flex : 1 } }>{ text } ({ length })</h2>

            <select style = { { marginBottom : "8px" } }>
                <option value = "Most Played Games">Most Played</option>
                <option value = "Test">Test</option>
            </select>
        </div>
    )
}