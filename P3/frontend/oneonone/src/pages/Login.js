import React, { useState } from "react";
import InitSidebar from "../components/InitSidebar";
import axios from "axios";

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: "",
        password: ""
    });

    const [errorMessages, setErrorMessages] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prevState => ({ ...prevState, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        // Add validation checks here if needed

        try {
            const credentialsJSON = JSON.stringify(credentials);
            // const response = await axios.post('http://127.0.0.1:8000/api/token/', credentialsJSON, config);
            const response = await axios.post('https://oneonone-backend.onrender.com/api/token/', credentialsJSON, config);
            console.log(response.data);

            // Store the token in local storage
            localStorage.setItem('token', response.data.access);

            // Redirecting to Dashboard page
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Login failed:', error.response.data);

            // Handle login error (show error message)
            setErrorMessages(error.response.data);
        }
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <InitSidebar/>
                <div className="col-md-10">
                    <div className="container h-100">
                        <div className="row justify-content-center h-100">
                            <div className="col-12 col-md-8 col-lg-6">
                                <div className="login-frame">
                                    <h2 className="text-center mb-4">Login to your account</h2>
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group mb-5">
                                            <label htmlFor="username-input">Your Username:</label>
                                            <input type="text" className="form-control" id="username-input"
                                                   name="username" value={credentials.username} onChange={handleChange}
                                                   required/>
                                        </div>
                                        <div className="form-group mb-5">
                                            <label htmlFor="password">Password:</label>
                                            <input type="password" className="form-control" id="password"
                                                   name="password" value={credentials.password} onChange={handleChange}
                                                   required/>
                                        </div>

                                        {/* Display error messages */}
                                        {Object.keys(errorMessages).length > 0 && (
                                            <div className="alert alert-danger" role="alert">
                                                {Object.keys(errorMessages).map((key, index) => (
                                                    <p key={index}>{errorMessages[key]}</p>
                                                ))}
                                            </div>
                                        )}

                                        <div className="form-group text-center">
                                            <button type="submit" className="btn btn-primary w-50">Login</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;