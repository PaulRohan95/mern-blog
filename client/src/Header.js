import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


export default function Header() {
    const [username, setUsername] = useState(null);
    useEffect(() => {
        fetch('http://localhost:4000/profile', {
            credentials: 'include',
        }).then(response => {
            response.json().then(userInfo => {
                setUsername(userInfo.username);
            })
        })
    }, []);


function logout() { //invalidate the token, hence the logged in state will be nullified, and the user will be logged out
    fetch('http://localhost:4000/logout', {
        credentials: 'include',
        method: 'POST',
    });
    setUsername(null);
}

    return(
        <header>
        <Link to="/" className="logo">Blogify</Link>
        <nav>
            {username && (
                <>
                    <Link to="/create">Create new post</Link>
                    <a href="#" onClick={logout}>Logout</a>
                </>
            )}
            {!username && (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
      </header>
    )
};