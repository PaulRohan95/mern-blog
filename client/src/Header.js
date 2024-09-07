import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import {UserContext} from "./UserContext";

export default function Header() {
    const {setUserInfo,userInfo} = useContext(UserContext);
    useEffect(() => {
        fetch('http://localhost:4000/profile', {
            credentials: 'include',
        }).then(response => {
            response.json().then(userInfo => {
                setUserInfo(userInfo);
            })
        })
    }, []);


function logout() { //invalidate the token, hence the logged in state will be nullified, and the user will be logged out
    fetch('http://localhost:4000/logout', {
        credentials: 'include',
        method: 'POST',
    });
    userInfo(null);
}

const username = userInfo?.username;

    return(
        <header>
        <Link to="/" className="logo">Blogify</Link>
        <nav>
            {username && (
                <>
                    <Link to="/create">Create new post</Link>
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