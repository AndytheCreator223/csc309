// src/pages/Signup.js
import React, { useState } from 'react';
import InitSidebar from '../components/InitSidebar';
import axios from 'axios';

const Signup = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '', // For confirming password
    first_name: '', // Assuming you want to add fields for first and last names
    last_name: ''
  });

  const [errorMessages, setErrorMessages] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    // Add validation checks here if needed

    try {
      const userDataJSON = JSON.stringify(userData);
      const response = await axios.post('http://127.0.0.1:8000/api/account/register/', userDataJSON, config);

      console.log(response.data);

      // Redirecting to Login page
      window.location.href = '/login';

    } catch (error) {
      console.error('Registration failed:', error.response.data);

      // Handle registration failure
      setErrorMessages(error.response.data)
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <InitSidebar />
        <div className="col-md-10">
          <div className="container h-100">
            <div className="row justify-content-center h-100">
              <div className="col-12 col-md-8 col-lg-6">
                <div className="login-frame">
                  <h4 className="text-center">New to 1on1?</h4>
                  <h2 className="text-center mb-4">Create a new account</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group mb-5">
                      <label htmlFor="email-input">Your Email:</label>
                      <input type="email" className="form-control" id="email-input" name="email" value={userData.email} onChange={handleChange} required />
                    </div>

                    {/* Username */}
                    <div className="form-group mb-5">
                      <label htmlFor="username">Username:</label>
                      <input type="text" className="form-control" id="username" name="username" value={userData.username} onChange={handleChange} required />
                    </div>

                    {/* First name */}
                    <div className="form-group mb-5">
                      <label htmlFor="first-name">First Name:</label>
                      <input type="text" className="form-control" id="first-name" name="first_name" value={userData.first_name} onChange={handleChange} required />
                    </div>

                    {/* Last name */}
                    <div className="form-group mb-5">
                      <label htmlFor="last-name">Last Name:</label>
                      <input type="text" className="form-control" id="last-name" name="last_name" value={userData.last_name} onChange={handleChange} required />
                    </div>

                    {/* Password */}
                    <div className="form-group mb-5">
                      <label htmlFor="password">Password:</label>
                      <input type="password" className="form-control" id="password" name="password" value={userData.password} onChange={handleChange} required />
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group mb-5">
                      <label htmlFor="confirm-password">Confirm Password:</label>
                      <input type="password" className="form-control" id="confirm-password" name="password2" value={userData.password2} onChange={handleChange} required />
                    </div>

                    {/* Error display section */}
                    {Object.keys(errorMessages).length > 0 && (
                      <div className="alert alert-danger" role="alert">
                        {Object.keys(errorMessages).map((key, index) => (
                          <p key={index}>{errorMessages[key]}</p>
                        ))}
                      </div>
                    )}

                    {/* Submit button */}
                    <div className="form-group text-center">
                      <button type="submit" className="btn btn-primary w-50">Sign up</button>
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

export default Signup;
