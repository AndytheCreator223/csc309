import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MeetingProvider } from '../contexts/MeetingContext';
import axios from 'axios';
import SelectCalendar from "../components/SelectCalendar";

const FinalizeMeeting = () => {
    const { meeting_id } = useParams();
    const [meetingDetails, setMeetingDetails] = useState(null);
    const [error, setError] = useState('');
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        const fetchMeetingDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `http://127.0.0.1:8000/api/meeting/pending-meeting/detail/${meeting_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setMeetingDetails(response.data);
            } catch (error) {
                console.error('Failed to fetch meeting details:', error);
                setError("Failed to load meeting details.");
            }
        };

        const fetchParticipants = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `http://127.0.0.1:8000/api/meeting/participant/list/${meeting_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setParticipants(response.data.participants);
            } catch (error) {
                console.error('Failed to fetch participants:', error);
                setError("Failed to load participants.");
            }
        };

        fetchMeetingDetails();
        fetchParticipants();
    }, [meeting_id]);

    const handleParticipantClick = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://127.0.0.1:8000/api/meeting/participant/detail/${meeting_id}/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response.data);
        } catch (error) {
            console.error('Failed to fetch participant response:', error);
            setError("Failed to load participant response.");
        }
    };

    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const handleGetSuggestedMeetingsOrder = async (meetingId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://127.0.0.1:8000/api/meeting/suggested-meeting/get-order/${meetingId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response.data);
        } catch (error) {
            console.error('Failed to get suggested meeting:', error);
            setError("Failed to load suggested meeting.");
        }
    };

    const handleGetSuggestedMeetingsPriority = async (meetingId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://127.0.0.1:8000/api/meeting/suggested-meeting/get-priority/${meetingId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response.data);
        } catch (error) {
            console.error('Failed to get suggested meeting:', error);
            setError("Failed to load suggested meeting.");
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
         window.location.href = '/meetings';
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
                        <h2 className="big-title">Meeting Details</h2>
                        <SelectCalendar disabled />
                    </div>
                </div>
                <div className="col-md-4">
                    <div>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="appointment-summary mb-3">
                            <h3>Appointment summary</h3>
                            <label className="label-frame label-frame-yellow form-label">Title:</label>
                            <p className="bg-light p-2 rounded">{meetingDetails?.title || 'N/A'}</p>
                        </div>
                        <div className="deadline-request mb-3">
                            <label className="label-frame label-frame-purple form-label">Deadline:</label>
                            <p className="bg-light p-2 rounded">{formatDateForInput(meetingDetails?.deadline) || 'N/A'}</p>
                        </div>
                        <div className="time-limit-display mb-3">
                            <label className="label-frame label-frame-dblue form-label">Time Limit:</label>
                            <p className="bg-light p-2 rounded">{meetingDetails?.time_limit} minutes</p>
                        </div>
                        <div className="meeting-message-display mb-3">
                            <label className="label-frame label-frame-pink form-label">Meeting Message:</label>
                            <p className="bg-light p-2 rounded">{meetingDetails?.message || 'No additional message provided.'}</p>
                        </div>
                        <div className="suggested-meetings-actions mb-3">
                            <button
                                className="btn btn-info me-2"
                                style={{ marginBottom: '5px' }}
                                onClick={() => handleGetSuggestedMeetingsOrder(meeting_id)}
                            >
                                Display Suggested Meeting based on respondents' Order
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={() => handleGetSuggestedMeetingsPriority(meeting_id)}
                            >
                                Display Suggested Meeting based on respondents' Preferences
                            </button>
                        </div>
                        <div className="participant-list mb-3">
                            <h5>Responded Participants</h5>
                            <ul className="list-group">
                                {participants.filter(p => p.response).map((participant) => (
                                    <li key={participant.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span>{participant.first_name} {participant.last_name}</span>
                                        <button className="btn btn-outline-primary btn-sm" onClick={() => handleParticipantClick(participant.id)}>View</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="participant-list mb-3">
                            <h5>Non-Responded Participants</h5>
                            <ul className="list-group">
                                {participants.filter(p => !p.response).map((participant) => (
                                    <li key={participant.id} className="list-group-item">
                                        {participant.first_name} {participant.last_name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="final-confirmation">
                            <button type="submit" className="btn btn-primary w-50 mb-5 submit-button">Finalize Meeting</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </MeetingProvider>
    );
};

export default FinalizeMeeting;
