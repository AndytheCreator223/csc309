import React, { useState } from 'react';
import SelectCalendar from '../components/SelectCalendar';
import { MeetingProvider } from '../contexts/MeetingContext';
import { Link } from 'react-router-dom';
import axios from "axios";

const CreateMeeting = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [deadline, setDeadline] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [error, setError] = useState('');
    const [isCustomTime, setIsCustomTime] = useState(false);

    const handleTimeLimitChange = (e) => {
        if (e.target.value === "Custom") {
            setIsCustomTime(true);
            setTimeLimit('');
        } else {
            setIsCustomTime(false);
            setTimeLimit(e.target.value);
        }
    };

    const handleCustomTimeChange = (e) => {
        setTimeLimit(e.target.value);
    };

    const handleError = (message) => {
        setError(message);
        setTimeout(() => {
            setError(''); // Clear the error after 5 seconds
        }, 10000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('message', message);
        formData.append('deadline', deadline);
        formData.append('time_limit', timeLimit);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://127.0.0.1:8000/api/meeting/pending-meeting/create/",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status === 201) {
                setTitle('');
                setMessage('');
                setDeadline('');
                setTimeLimit('');
                alert('Meeting successfully created');
                window.location.href = '/meetings';
            }

        } catch (err) {
              let errorMessage = "Failed to create meeting. Please try again."; // Default error message
              if (err.response && err.response.data) {
                  if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                  } else if (err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                  } else {
                    errorMessage = Object.keys(err.response.data)
                                          .map(key => {
                                            const value = err.response.data[key];
                                            // Check if the value is an array to use join; otherwise, use it directly
                                            return Array.isArray(value) ? `${key}: ${value.join(" ")}` : `${key}: ${value}`;
                                          })
                                          .join(' ');
                  }
              }
              console.error("Failed to create meeting:", err);
              handleError(errorMessage);
        }
    };

    return (
        <MeetingProvider>
            <div className="container-fluid main-content" style={{ minHeight: '100vh' }}>
                <div className="row">
                    <div className="col-md-8 mt-4">
                        <Link to={`/dashboard`} className="btn btn-primary">Back to Dashboard</Link>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-8">
                        <div className="datetime-selection">
                            <h2 className="big-title">Select date(s) and time</h2>
                            <SelectCalendar />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <form onSubmit={handleSubmit}>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="appointment-summary" style={{ marginBottom: "10px" }}>
                                <h3>Appointment summary</h3>
                                <label htmlFor="title" className="label-frame label-frame-yellow form-label">Title:</label>
                                <input type="text" id="title" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </div>
                            <div className="deadline-request" style={{ marginBottom: "10px" }}>
                                <label htmlFor="deadline" className="label-frame label-frame-purple form-label"> Deadline:</label>
                                <input type="datetime-local" id="deadline" className="form-control" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
                            </div>
                            <div className="appointment-length" style={{ marginBottom: "10px" }}>
                                <label htmlFor="time" className="label-frame label-frame-dblue form-label"> Appointment length:</label>
                                <div>
                                    <select className="form-control" style={{ marginBottom: "10px" }} onChange={handleTimeLimitChange} value={isCustomTime ? "Custom" : timeLimit}>
                                        <option value="" disabled selected>Select your option</option>
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="90">1 hour 30 minutes</option>
                                        <option value="120">2 hours</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                    {isCustomTime && (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={timeLimit}
                                            onChange={handleCustomTimeChange}
                                            placeholder="Time in minutes (Must be divisible by 30)"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="message-for-contact" style={{ marginBottom: "15px" }}>
                                <label htmlFor="message" className="label-frame label-frame-pink form-label">Message:</label>
                                <textarea className="form-control" id="message" rows="5" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter your message here..."></textarea>
                            </div>
                            <div className="final-confirmation">
                                <button type="submit" className="btn btn-primary w-50 mb-5 submit-button">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MeetingProvider>
    );
};

export default CreateMeeting;
