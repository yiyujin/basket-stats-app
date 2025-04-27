import React from "react";
import { Link } from "react-router-dom";
import { ArrowForward, Stadium, EventAvailable, AutoAwesome, ElectricBolt } from '@mui/icons-material';

import IconButton from "./IconButton";

export default function GameListItem({ id, icon, color, data, team, players, highlightsLen }) {
    return (
        <Link to = {`/gameitem/${data.id}`} state = { { team : team, players : players } }>
            <div className = "gameListItem" style={{ fontWeight: "600", display: "flex", width: "100%", height: "56px", alignItems: "center", borderBottom: "1px solid var(--black8)", padding : "0px 16px" }}>
                
                <div style={{ width: "440px", display: "flex", flex: 1, flexDirection: "row", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "row", gap: "8px", alignItems: "center" }}>
                        <p>{team.properties?.Name.title[0].plain_text}</p>
                        { icon ? <img className="icon" src={icon} alt="Team icon" /> : null }
                    </div>
                    
                    <div style={{ width : "52px", margin: "0px 16px", padding : "2px", backgroundColor: "var(--pt0)", color : "white", textAlign: "center", borderRadius: "var(--br)"}}>
                        <p className="number">{data.properties.score.rich_text[0]?.plain_text || "-"}</p>
                    </div>

                    <p>{data.properties.team2.rich_text[0]?.plain_text}</p>
                </div>

                    { highlightsLen !== 0 && 
                        <div style={{ width: "110px", display: "flex", flexDirection: "row", gap: "4px", alignItems: "center", paddingRight :  "" }}>
                            <ElectricBolt style={{ fontSize: "14px", color: "black" }} />
                            <p className = "meta2" style = { { color : "black" } }>{ highlightsLen } Highlights</p>
                        </div>
                    }            
                    <IconButton icon = { ArrowForward }/>
            </div>
        </Link>
    );
}