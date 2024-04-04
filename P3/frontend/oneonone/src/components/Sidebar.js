import React, {useEffect, useState} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import profilePic from "./selva.jpg";

const Sidebar = () => {
    const [user, setUser] = useState({firstName: 'Loading...'});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                const response  = await axios.get('http://127.0.0.1:8000/api/account/profile/', config);
                setUser({
                    ...user,
                    firstName: response.data.first_name,
                });
            } catch (error) {
                console.error("Error fetching profile: ", error);
                navigate('/login');
            }
        };
        fetchProfile().then(r => console.log("Profile fetched"));
    }, []);

    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="col-md-2 d-none d-md-block sidebar">
            <div className="logo-dashboard">
                <h1>1on1</h1>
            </div>
            <div className="sidebar-header">
                <img src={profilePic} alt="Profile" width="100" height="100"/>
                <p>Welcome, {user.firstName}</p>
            </div>
            <ul className="nav flex-column">
                <li className="nav-item">
                    <Link to="/create-meeting"
                          className={`nav-link new-meeting-btn green-color ${isActive('/create-meeting') ? 'active' : ''}`}>
                        New Meeting
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                        Dashboard
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/notifications" className={`nav-link ${isActive('/notifications') ? 'active' : ''}`}>
                        Notifications
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/meetings" className={`nav-link ${isActive('/meetings') ? 'active' : ''}`}>
                        Meetings
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/account" className={`nav-link ${isActive('/account') ? 'active' : ''}`}>
                        Account
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/contacts" className={`nav-link ${isActive('/contacts') ? 'active' : ''}`}>
                        Contacts
                    </Link>
                </li>
                <li className="nav-item">
                    <button onClick={handleLogout} className={"logout-button"}>
                        Log Out
                    </button>
                </li>
            </ul>

            <footer className="sidebar-footer">
                <p>Copyright &copy; 2024 by 1on1</p>
            </footer>
        </nav>
    );
};

export default Sidebar;