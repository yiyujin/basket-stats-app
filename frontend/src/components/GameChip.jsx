import { Link } from "react-router-dom";

export default function GameChip( { item, reverse, seekToTime } ) {
    const timestamp = item.time;
    const player = item.goaler;
    const player_id = item.player_id;
    const timeInSeconds = item.timeInSeconds;

    console.log(item.player_id);

    const content = reverse ? (
        <div style = { { width: "100%", display: "flex", flexDirection : "column", alignItems: "flex-end", paddingBottom : "4px" } }>
            <div onClick = { () => seekToTime(timeInSeconds)} style = { { display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: "8px", padding: "2px 8px", borderRadius: "4px", backgroundColor: "var(--black4)", color: "var(--pt0)", border: "none", cursor: "pointer" } }>
                <p className = "number">{ timestamp }</p>
                <img width = "12px" src = "https://www.premierleague.com/resources/rebrand/v7.153.55/i/elements/icons/ball-small.svg" alt = "ball" />
            </div>
            <Link to = { `/player/${player_id}`} ><p className = "meta2">{ player }</p></Link>
        </div>
    ) : (
        <div style = { { width: "100%", display: "flex", flexDirection : "column", alignItems: "flex-start", paddingBottom : "4px" } }>
            <div onClick = { () => seekToTime(timeInSeconds)}  style = { { display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: "8px", padding: "2px 8px", borderRadius: "4px", backgroundColor: "var(--black4)", color: "var(--pt0)", border: "none", cursor: "pointer" } }>
                <img width = "12px" src = "https://www.premierleague.com/resources/rebrand/v7.153.55/i/elements/icons/ball-small.svg" alt = "ball" />
                <p className = "number">{ timestamp }</p>
            </div>
            <p className = "meta2">{ player }</p>
        </div>
    );

    return (
        <>
            { content }
        </>
    );
}