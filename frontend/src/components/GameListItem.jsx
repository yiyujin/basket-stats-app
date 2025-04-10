import { Link } from "react-router-dom";
import { ArrowForward, Stadium, EventAvailable, AutoAwesome } from '@mui/icons-material';

import IconButton from "./IconButton";
import Chip from "./Chip";

export default function GameListItem( { id, icon, color, data, team, players } ){
    return(
        <>
            { data && data.map( ( item, index ) => (
                <div key = { index } style = { { fontWeight : "600", display : "flex", width : "100%", height : "80px", alignItems : "center", borderBottom : "1px solid var(--black8)" } }>
                    
                    <div style = { { width : "440px", display : "flex", flex : 1, flexDirection : "row", alignItems : "center" } }>
                        <div style = { {  display : "flex", flexDirection : "row", gap : "8px", alignItems : "center" } }>
                            <p>{ team.properties?.Name.title[0].plain_text }</p>
                            <img className = "icon" src = { icon }/>
                        </div>
                        
                        <div style = { { width : "72px", margin : "0px 8px" } }>
                            <div style = { { backgroundColor : "var(--black4)", textAlign : "center", borderRadius : "var(--br)" }}>
                                <p className = "number">{ item.properties.score.rich_text[0]?.plain_text || "TBD" }</p>
                            </div>

                            { item.properties.result.select?.name === "win" ?
                                <Chip text = { item.properties.result.select?.name } color = { color }/>
                            : null }
                        </div>

                        <p>{ item.properties.team2.rich_text[0]?.plain_text }</p>
                    </div>

                    <div style = { { display : "flex", flexDirection : "row", alignItems : "center", gap : "16px" }}>
                        <div style = { { display : "flex", flex : "flex-end", flexDirection : "column", width : "140px" }}>
                            <div style = { { width : "110px", display : "flex", flexDirection : "row", gap : "4px", alignItems : "center" } }>
                                <AutoAwesome style = { { fontSize: "14px", color : "var(--black80)" } } />
                                <p className = "meta">16 Highlights</p>
                            </div>

                            <div style = { { width : "110px", display : "flex", flexDirection : "row", gap : "4px", alignItems : "center" } }>
                                <EventAvailable style = { { fontSize: "14px", color : "var(--black80)" } } />
                                <p className = "meta">{ item.properties.Date.date.start }</p>
                            </div>

                            <div style = { { display : "flex", flexDirection : "row", gap : "4px", alignItems : "center" } }>
                                <Stadium style = { { fontSize: "14px", color : "var(--black80)" } } />
                                <p className = "meta">{ item.properties.venue.rich_text[0]?.plain_text || "-" }</p>
                            </div>
                        </div>

                        <Link to = {`/gameitem/${item.id}`}>
                            <IconButton icon = { ArrowForward }/>
                        </Link>
                    </div>

                </div>
            ))} 
        </>
    )
}