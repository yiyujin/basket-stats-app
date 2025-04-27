import { Link } from "react-router-dom";

export default function PlayerListItem( { item, teamColor } ){
    return(
        <Link to = {`/player/${item.id}`}>
            <div style = { { position : "relative", overflow : "hidden", display : "flex", width : "100%", height : "180px", backgroundColor : "var(--black2)", alignItems : "flex-end", padding : "16px" } }>
                <div style = { { flex : 1, display : "flex", flexDirection : "column", gap : "8px" } }>

                <div style = { { width: "20px", borderBottom : "2px solid " + teamColor } }>
                    <p className = "number">{ item.properties.back_number.rich_text[0].plain_text }</p>
                </div>
                
                <div style={ { textTransform : "uppercase", lineHeight : "20px" } }>
                    <h2 style = { { lineHeight : "100%" }}>{ item.properties.first_name.rich_text[0].plain_text }</h2>
                    <h2>{ item.properties.last_name.rich_text[0].plain_text }</h2>
                </div>
                <p className = "meta">{ item.properties.Name.title[0].plain_text } · { item.properties.nickname.rich_text[0].plain_text } · { item.properties.position_rollup?.rollup.array[0].title[0].plain_text }</p>
                
                <img className = "player-profile" src = { item.properties.profile_picture?.rich_text[0]?.plain_text }/>

                </div>      
            </div>
            </Link>
    )
}