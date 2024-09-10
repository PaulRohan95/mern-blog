import { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {UserContext} from "./UserContext";

export default function Header() {
    const {setUserInfo,userInfo} = useContext(UserContext);
    useEffect(() => {
        fetch('https://mern-blog-2996.onrender.com/profile', {
            credentials: 'include',
        }).then(response => {
            response.json().then(userInfo => {
                setUserInfo(userInfo);
            })
        })
    }, []);


function logout() { //invalidate the token, hence the logged in state will be nullified, and the user will be logged out
    fetch('https://mern-blog-2996.onrender.com/logout', {
        credentials: 'include',
        method: 'POST',
    });
    setUserInfo(null);
}

const username = userInfo?.username;

    return(
        <header>
        <Link to="/" className="logo">Blogify</Link>
        <nav>
            {username && (
                <>
                <span>Hello, {username}</span>
                    <Link to="/create" className="createPost">Create new post</Link>
                    <a onClick={logout}>Logout</a>
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