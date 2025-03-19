import { Link } from "react-router-dom"

export default function Nav(){
    const links = [
        { href: "/", label: "Basket Stats", color : "red" },
        { href: "/game", label: "Start Game", color : "lime"  },
        { href: "/login", label: "Login", color : "red" },
        { href: "/about", label: "About", color : "red" },
        { href: "/releasenotes", label: "Release Notes", color : "red" },
    ];

    return(
        <div className = "nav">
            { links.map( ( item, index ) => (
                <Link key = { index } to = { item.href }>
                    <p>{ item.label }</p>
                </Link>
            ))}
        </div>
    )
}