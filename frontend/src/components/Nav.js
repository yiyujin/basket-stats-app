import { Link } from "react-router-dom"

export default function Nav(){
    const links = [
        { href: "/login", label: "Basket Stats", color : "red" },
        { href: "/player", label: "Player Dashboard", color : "red"  },
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