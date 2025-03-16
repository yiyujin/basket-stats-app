import { Link } from "react-router-dom";
import { ArrowForward, Stadium, EventAvailable, SportsBasketball } from '@mui/icons-material';

import IconButton from "./IconButton";
import Chip from "./Chip";

export default function GameListItem( { id, team, icon, color, data } ){
    return(
        <>
            { data && data.map( ( item, index ) => (
                <div key = { index } style = { { fontFamily : "var(--font-Barlow)", fontWeight : "600", display : "flex", width : "100%", height : "80px", alignItems : "center", backgroundColor : "var(--black4)", marginBottom : "16px"} }>
                    
                    <div style = { { flex : 1, display : "flex", flexDirection : "row", alignItems : "center", padding : "16px", gap : "40px" } }>
                    
                        {/* SCORE */}
                        <div style = { { width : "440px", display : "flex", flexDirection : "row", gap : "8px", alignItems : "center" } }>
                            
                            { item.properties.team_opponent ? <p>{ team }</p> : "Team B" }
                            <img className = "icon" src = { icon }/>

                            <div style = { { width : "72px", margin : "0px 8px" } }>
                                <div style = { { backgroundColor : "var(--black8)", textAlign : "center" }}>
                                    <p className = "number">{ item.properties.score.rich_text[0]?.plain_text || "TBD" }</p>
                                </div>

                                { item.properties.result.select?.name === "win" ?
                                    <Chip text = { item.properties.result.select?.name } color = { color }/>
                                : null }
                            </div>
                                
                            
                            <SportsBasketball style = { { fontSize : "24px" }}/>
                            { item.properties.team_opponent ? <p>{ item.properties.team_opponent.rich_text[0]?.plain_text }</p> : "Team B" }

                        </div>

                        {/* DATE */}
                        <div style = { { display : "flex", flexDirection : "row", gap : "4px", alignItems : "center" } }>
                            <EventAvailable style = { { fontSize: '12px' } }/>
                            <p className = "meta">{ item.properties.Date.date.start }</p>
                        </div>


                        {/* VENUE */}
                        <div style = { { display : "flex", flexDirection : "row", gap : "4px", alignItems : "center" } }>
                            <Stadium style = { { fontSize: '12px' } }/>
                            <p className = "meta">{ item.properties.venue.rich_text[0]?.plain_text || "-" }</p>
                        </div>

                    </div>    

                    <Link to = {`/game`}>
                        <IconButton icon = { ArrowForward }/>
                    </Link>  

                </div>
            ))} 
        </>
    )
}