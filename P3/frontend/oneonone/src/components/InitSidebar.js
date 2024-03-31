import React from "react";
import { Link, useLocation } from "react-router-dom";

const InitSidebar = () => {
    const location = useLocation();

    return (
        <nav className="col-md-2 d-none d-md-block sidebar">
            <div className="logo">
                <h1>1on1</h1>
            </div>
            <ul className="nav flex-column">
                <li className="nav-item">
                    <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                        Login
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/signup" className={`nav-link ${location.pathname === '/signup' ? 'active' : ''}`}>
                        Sign up
                    </Link>
                </li>
            </ul>

            <footer className="sidebar-footer">
                <p>Copyright &#169; 2024 by 1on1</p>
            </footer>
        </nav>
    );
};

export default InitSidebar;