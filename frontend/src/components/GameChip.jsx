export default function GameChip( { item, reverse, seekToTime } ) {
    const timestamp = item.time;
    const player = item.goaler;
    const timeInSeconds = item.timeInSeconds;

    const content = reverse ? (
        <div style = { { width: "100%", display: "flex", flexDirection : "column", alignItems: "flex-end", paddingBottom : "4px" } }>
            <div onClick = { () => seekToTime(timeInSeconds)} style = { { display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: "8px", padding: "2px 8px", borderRadius: "4px", backgroundColor: "var(--black4)", fontWeight: "600", color: "var(--pt0)", border: "none", cursor: "pointer" } }>
                <p>{ timestamp }</p>
                <img width = "12px" src = "https://www.premierleague.com/resources/rebrand/v7.153.55/i/elements/icons/ball-small.svg" alt = "ball" />
            </div>
            <span style = { { fontSize: "var(--font-size-tiny)" } }>{ player }</span>
        </div>
    ) : (
        <div style = { { width: "100%", display: "flex", flexDirection : "column", alignItems: "flex-start", paddingBottom : "4px" } }>
            <div onClick = { () => seekToTime(timeInSeconds)}  style = { { display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: "8px", padding: "2px 8px", borderRadius: "4px", backgroundColor: "var(--black4)", fontWeight: "600", color: "var(--pt0)", border: "none", cursor: "pointer" } }>
                <img width = "12px" src = "https://www.premierleague.com/resources/rebrand/v7.153.55/i/elements/icons/ball-small.svg" alt = "ball" />
                <p>{ timestamp }</p>
            </div>
            <span style = { { fontSize: "var(--font-size-tiny)" } }>{ player }</span>
        </div>
    );

    return (
        <>
            { content }
        </>
    );
}