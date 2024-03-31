import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from "../components/Sidebar";
import profilePic from "./selva.jpg";

const Account = () => {
    const [profile, setProfile] = useState({
        id: '',
        username: '',
        email: '',
        first_name: '',
        last_name: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                const response = await axios.get('http://127.0.0.1:8000/api/account/profile/', config);
                setProfile(response.data);
            } catch (err) {
                console.error('Failed to fetch profile', err);
                setError('Failed to load profile data.');
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
            };
            const response = await axios.patch('http://127.0.0.1:8000/api/account/profile/', profile, config);
            setProfile(response.data);
            console.log('Profile updated successfully');
            setError('');
        } catch (err) {
            console.error('Failed to update profile', err);
            setError('Failed to update profile.');
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <Sidebar />
                <div className="col-md-10">
                    <div className="container h-100">
                        <div className="row justify-content-center h-100">
                            <div className="col-12 col-md-8 col-lg-6">
                                <div className="account">
                                    <form onSubmit={handleUpdate} enctype="multipart/form-data">
                                        <div className="form-group-pic text-center">
                                            <img src={profilePic} alt="Profile" width="100" height="100" className="profile-pic" />
                                        </div>
                                        <div className="form-group mb-4">
                                            <label htmlFor="first_name">First Name:</label>
                                            <input type="text" className="form-control" id="first_name" name="first_name" value={profile.first_name} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group mb-4">
                                            <label htmlFor="last_name">Last Name:</label>
                                            <input type="text" className="form-control" id="last_name" name="last_name" value={profile.last_name} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group mb-4">
                                            <label htmlFor="email">Email:</label>
                                            <input type="email" className="form-control" id="email" name="email" value={profile.email} onChange={handleChange} required />
                                        </div>
                                        {error && <div className="alert alert-danger">{error}</div>}

                                        <div>
                                            <p>咩有修改密码捏</p>
                                        </div>
                                        <div className="form-group text-center mt-5">
                                            <button type="submit" className="btn btn-primary w-50">Update</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
