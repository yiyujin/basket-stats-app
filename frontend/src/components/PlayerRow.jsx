import { Link } from "react-router-dom"

export default function PlayerRow( { head, body, link } ) {
    return(
        <div style = { { display : "flex", flexDirection : "row", justifyContent : "space-between", width : "100%", padding : "24px", border : "1px solid var(--black8)", borderRadius : "var(--br)" }}>
            <p>{ head }</p>
            { link ?
                <Link to = { link }><p style = { { fontWeight : "600", fontSize : "var(--font-size-medium)" } }>{ body }</p></Link> :
                <p style = { { fontWeight : "600", fontSize : "var(--font-size-medium)" } }>{ body }</p>
            }
      </div>
    )
}