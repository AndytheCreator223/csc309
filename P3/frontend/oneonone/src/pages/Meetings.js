import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from "../components/Sidebar";

const Meetings = () => {
    const [pendingMeetings, setPendingMeetings] = useState([]);
    const [finalizedMeetings, setFinalizedMeetings] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMeetings().then(r => console.log('Meetings fetched'));
    }, []);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch pending meetings
            const pendingResponse = await axios.get('http://127.0.0.1:8000/api/meeting/pending-meeting/list/', config);
            setPendingMeetings(pendingResponse.data);

            // Fetch finalized meetings
            const finalizedResponse = await axios.get('http://127.0.0.1:8000/api/meeting/finalized-meeting/list/', config);
            setFinalizedMeetings(finalizedResponse.data);
        } catch (err) {
            setError('Failed to fetch meetings data');
            console.error(err);
        }
    };

    const handleNotify = async (meetingId) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://127.0.0.1:8000/api/meeting/pending-meeting/notify/', { meeting_id: meetingId }, config);
            alert('Notification sent to all non-responding participants.');
        } catch (err) {
            setError('Failed to send notification');
            console.error(err);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <Sidebar />
                <div className="col-md-10 main-content">
                    <div className="row">
                        <div className="col-md-6">
                            <h3>Pending Meetings 被邀请的人咩有入口捏</h3>
                            <div className="list-group">
                                {pendingMeetings.map(meeting => (
                                    <div key={meeting.id} className="list-group-item list-group-item-action flex-column align-items-start mb-2 rounded">
                                        <div className="d-flex w-100 justify-content-between">
                                            <Link to={`/modify-meeting/${meeting.id}`} className="me-auto" style={{ color: 'inherit', textDecoration: 'none' }}>
                                                <h5 className="mb-1 font-weight-bold">{meeting.title}</h5>
                                                <p className="ddl">Deadline: {new Date(meeting.deadline).toLocaleString()}</p>
                                                {meeting.participants.map(participant => (
                                                    <p key={participant.user.id} className="mb-1">{participant.user.first_name} {participant.user.last_name}: {participant.response ? 'Responded' : 'Not Responded'}</p>
                                                ))}
                                            </Link>
                                            {new Date(meeting.deadline) < new Date() ? (
                                                <Link to={`/finalize/${meeting.id}`} className="btn btn-primary" style={{ height: '3em' }}>Finalize</Link>
                                            ) : (
                                                <button type="button" className="btn btn-warning" onClick={() => handleNotify(meeting.id)} style={{ height: '3em' }}>Notify</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h3>Finalized Meetings</h3>
                            <div className="list-group">
                                {finalizedMeetings.map((meeting, index) => (
                                    <div key={index} className="list-group-item flex-column align-items-start mb-2 rounded">
                                        <h5 className="mb-1 font-weight-bold">{meeting.title}</h5>
                                        <ul className="list-unstyled">
                                            <li>Time: {new Date(meeting.time).toLocaleString()}</li>
                                            <li>Duration: {meeting.time_limit}min</li>
                                            <li>Participant: {meeting.participant.first_name} {meeting.participant.last_name}</li>
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default Meetings;
