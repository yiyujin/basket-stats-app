import { Link } from "react-router-dom";
import { ArrowForward, Stadium, EventAvailable, SportsBasketball } from '@mui/icons-material';

import IconButton from "./IconButton";
import Chip from "./Chip";

export default function GameListItem( { id, icon, color, data } ){
    return(
        <>
            { data && data.map( ( item, index ) => (
                <div key = { index } style = { { display : "flex", width : "100%", height : "80px", alignItems : "center", backgroundColor : "var(--black4)", padding : "8px", marginBottom : "16px"} }>
                    
                    <div style = { { flex : 1, display : "flex", flexDirection : "row", alignItems : "center" } }>
                    
                        {/* SCORE */}
                        <div style = { { display : "flex", flexDirection : "row", gap : "4px",alignItems : "center", marginRight : "40px" } }>
                            
                            <div className = "icon-container">
                                <img className = "icon" src = { icon }/>
                            </div>

                            <div>
                                <div style = { { backgroundColor : "var(--black8)", padding : "0px 16px"}}>
                                    <p className = "number">{ item.properties.score.rich_text[0]?.plain_text || "TBD" }</p>
                                </div>

                                { item.properties.result.select?.name === "win" ?
                                    <Chip text = { item.properties.result.select?.name } color = { color }/>
                                : null }
                            </div>

                            <div className = "icon-container">
                                <IconButton icon = { SportsBasketball }/>
                            </div>
                        </div>

                        {/* DATE */}
                        <div style = { { display : "flex", flexDirection : "row", gap : "4px", marginRight : "40px", alignItems : "center" } }>
                            <EventAvailable style = { { fontSize: '12px' } }/>
                            <p className = "meta">{ item.properties.Date.date.start }</p>
                        </div>


                        {/* VENUE */}
                        <div style = { { display : "flex", flexDirection : "row", gap : "4px", alignItems : "center" } }>
                            <Stadium style = { { fontSize: '12px' } }/>
                            <p className = "meta">{ item.properties.venue.rich_text[0]?.plain_text || "TBD" }</p>
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