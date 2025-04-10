import { Link } from "react-router-dom"

export default function Nav(){
    const links = [
        { href: "/", label: "Team Stamps", beta : 0},
        // { href: "/game", label: "Start Game", color : "lime" },
        // { href: "/login", label: "Login", color : "red" },
        { href: "/about", label: "About", beta : 0},
        { href: "/releasenotes", label: "Release Notes", beta : 0},
        // { href: "/collective", label: "Collective", color : "red" },

        { href: "/liftcounter", label: "Lift Counter", beta : 1 },
    ];

    return(
        <div className = "nav">
            { links.map( ( item, index ) => (
                <Link key = { index } to = { item.href } style = { { display : "flex", gap : "4px"} }>
                    <p>{ item.label }</p>
                    { item.beta === 1 ? <span style = { { backgroundColor : "var(--white40)", padding : "0px 8px", borderRadius : "var(--br)", fontSize : "var(--font-size-teeny)", alignSelf : "center", border : "1px solid var(--white24)"} }>beta</span> : null }
                </Link>
            ))}
        </div>
    )
}