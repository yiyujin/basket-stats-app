import { Link } from "react-router-dom";
import { ArrowForward, Stadium, EventAvailable, SportsBasketball, Videocam, CenterFocusStrong } from '@mui/icons-material';

import IconButton from "./IconButton";
import Chip from "./Chip";

export default function GameListItem( { id, icon, color, data, team, players } ){
    return(
        <>
            { data && data.map( ( item, index ) => (
                <div key = { index } style = { { fontFamily : "var(--font-Barlow)", fontWeight : "600", display : "flex", width : "100%", height : "80px", alignItems : "center", backgroundColor : "var(--black4)", marginBottom : "16px"} }>
                    
                    <div style = { { flex : 1, display : "flex", flexDirection : "row", alignItems : "center", padding : "16px", gap : "40px" } }>
                    
                        {/* SCORE */}
                        <div style = { { width : "440px", display : "flex", flexDirection : "row", gap : "8px", alignItems : "center" } }>
                            
       
                            <div style = { {  display : "flex", flexDirection : "row", gap : "8px", alignItems : "center" } }>
                                <p>{ team.properties?.Name.title[0].plain_text }</p>
                                <img className = "icon" src = { icon }/>
                            </div>
                            

                            <div style = { { width : "72px", margin : "0px 8px" } }>
                                <div style = { { backgroundColor : "var(--black8)", textAlign : "center" }}>
                                    <p className = "number">{ item.properties.score.rich_text[0]?.plain_text || "TBD" }</p>
                                </div>

                                { item.properties.result.select?.name === "win" ?
                                    <Chip text = { item.properties.result.select?.name } color = { color }/>
                                : null }
                            </div>

                                                        
                            { item.properties.team_opponent?.rich_text?.length > 0 ? (
                                <div  style = { {  display : "flex", flexDirection : "row", gap : "8px", alignItems : "center" } }>
                                    <SportsBasketball style = { { fontSize : "20px" }}/>
                                    <p>{ item.properties.team_opponent.rich_text[0]?.plain_text }</p>
                                </div>
                            ) : (
                                <div  style = { {  display : "flex", flexDirection : "row", gap : "8px", alignItems : "center" } }>
                                    <img className = "icon" src = { icon }/>
                                    <p>{ team.properties?.Name.title[0].plain_text }</p>
                                </div>
                            )}
                            
                        </div>

                        {/* HIGHLIGHTS */}
                        <div style = { { display : "flex", flexDirection : "row", gap : "4px", alignItems : "center" } }>
                            <Videocam style = { { fontSize: '16px' } }/>
                            <p className = "meta">16 Highlights</p>
                        </div>

                        {/* DATE */}
                        <div style = { { display : "flex", flexDirection : "row", gap : "4px", alignItems : "center" } }>
                            <EventAvailable style = { { fontSize: '16px' } }/>
                            <p className = "meta">{ item.properties.Date.date.start }</p>
                        </div>


                        {/* VENUE */}
                        <div style = { { display : "flex", flexDirection : "row", gap : "4px", alignItems : "center" } }>
                            <Stadium style = { { fontSize: '16px' } }/>
                            <p className = "meta">{ item.properties.venue.rich_text[0]?.plain_text || "-" }</p>
                        </div>

                    </div>    

                    <Link to = {``}>
                        <IconButton icon = { ArrowForward }/>
                    </Link>

                </div>
            ))} 
        </>
    )
}