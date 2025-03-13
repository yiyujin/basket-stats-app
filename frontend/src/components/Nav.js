import { Link } from "react-router-dom"

export default function Nav(){
    const links = [
        { href: "/", label: "Basket Stats", color : "red" },
        { href: "/login", label: "Login", color : "red" },
        { href: "/player", label: "Player", color : "red"  },
        { href: "/team", label: "Team", color : "lime"  },
        { href: "/game", label: "Start Game", color : "lime"  },
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