import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar'; // Adjust this path as needed
import profilePic from './selva.jpg'; // Ensure you have the correct path

const AccountUpdate = () => {
  const [profile, setProfile] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    new_password: '',
    confirm_password: '',
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
        setProfile(prevState => ({
          ...prevState,
          username: response.data.username,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email
        }));
      } catch (err) {
        setError('Failed to fetch profile.');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
  
    let formData = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
    };
  
    if (profile.new_password && profile.confirm_password) {
      if (profile.new_password !== profile.confirm_password) {
        setError('Passwords do not match. Please make sure your new password and confirmation password are identical.');
        return;
      }
      formData.password = profile.new_password;
      formData.password2 = profile.confirm_password;
    }
  
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch('http://127.0.0.1:8000/api/account/profile/', formData, config);
  
      window.alert("Profile updated");
      setError('');
    } catch (err) {
      console.error('Failed to update profile:', err);
  
      // Construct a more detailed error message
      let errorMessage = 'Failed to update profile. Please check your inputs.';
      if (err.response && err.response.data) {
        errorMessage += ' Details: ';
        const errors = err.response.data;
        for (const key in errors) {
          errorMessage += `${key}: ${errors[key].join(' ')}`;
        }
      } else {
        errorMessage += ' Ensure your password meets the complexity requirements.';
      }
  
      setError(errorMessage);
    }
  };
  


  return (
    <div className="container-fluid ">
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
                    {/* Existing Fields */}
                    <div className="form-group mb-4">
                      <label htmlFor="username">Username:</label>
                    <div className="form-control-plaintext" id="username" readOnly>
                      {profile.username}
                    </div>
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
                    <div className="form-group mb-4">
                      <label htmlFor="new_password">New Password:</label>
                      <input type="password" className="form-control" id="new_password" name="new_password" value={profile.new_password} onChange={handleChange} />
                    </div>
                    <div className="form-group mb-4">
                      <label htmlFor="confirm_password">Confirm New Password:</label>
                      <input type="password" className="form-control" id="confirm_password" name="confirm_password" value={profile.confirm_password} onChange={handleChange} />
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
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

export default AccountUpdate;
