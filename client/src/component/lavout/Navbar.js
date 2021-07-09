import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <div>
            <nav className="navbar bg-dark">
                <Link>
                    <Link to="/"><i className="fas fa-code"></i> DevConnector</Link>
                </Link>
                <ul>
                    <Link to="/">Developers</Link>
                    <Link to="/register">Register</Link>
                    <Link to="/login">Login</Link>
                </ul>
            </nav>
        </div>
    )
}

export default Navbar
