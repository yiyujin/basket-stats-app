export default function Chip( { text, color }){
    const hexToRgba = (hex, opacity) => {
        const bigint = parseInt(hex.replace('#', ''), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    return(
        <div>
            {/* <img width = "16px" src = { process.env.PUBLIC_URL + './fire.gif' } alt = "icon"/> */}

            <div style = { { display : "flex", justifyContent : "center", backgroundColor : hexToRgba(color, 0.16), color : color, border : `1px solid ${hexToRgba(color, 0.16)}`} }>
                <p className = "chip" style = { { padding : "0px 16px" } }>{ text }</p>
            </div>
        </div>
    )
}