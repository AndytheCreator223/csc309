import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from "../components/Sidebar";

const Meetings = () => {
    const [pendingMeetings, setPendingMeetings] = useState([]);
    const [finalizedMeetings, setFinalizedMeetings] = useState([]);
    const [error, setError] = useState('');
    const [viewType, setViewType] = useState('owned'); // 'owned' or 'participated'


    const fetchMeetings = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let pendingUrl = 'https://oneonone-backend.onrender.com/api/meeting/pending-meeting/list/';
            if (viewType === 'participated') {
                pendingUrl = 'https://oneonone-backend.onrender.com/api/meeting/pending-meeting/participant-meetings/'; // URL for participated meetings
            }

            // Fetch pending meetings based on viewType
            const pendingResponse = await axios.get(pendingUrl, config);

            // Adjust how pendingMeetings is set based on viewType
            let modifiedPendingMeetings = pendingResponse.data;

            // For participated meetings, we no longer need to find the current user's response
            // since the backend ensures only the current user's participant info is included.
            if (viewType === 'participated') {
                modifiedPendingMeetings = modifiedPendingMeetings.map(meeting => {
                    if (meeting.participants.length > 0) {
                        // Assume the backend sends only one participant object, which is the current user
                        const responseStatus = meeting.participants[0].response ? 'Responded' : 'Not Responded';
                        return { ...meeting, your_response: responseStatus };
                    }
                    return meeting;
                });
            }

            setPendingMeetings(modifiedPendingMeetings);
            const finalizedResponse = await axios.get('https://oneonone-backend.onrender.com/api/meeting/finalized-meeting/list/', config);
            setFinalizedMeetings(finalizedResponse.data);
        } catch (err) {
            setError('Failed to fetch meetings data');
            console.error(err);
        }
    }, [viewType]); // Include viewType or any other dependencies of fetchMeetings here

    useEffect(() => {
        fetchMeetings().then(() => console.log('Meetings fetched'));
    }, [fetchMeetings]); // Now fetchMeetings is a dependency of useEffect


    const handleNotify = async (meetingId) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('https://oneonone-backend.onrender.com/api/meeting/pending-meeting/notify/', { meeting_id: meetingId }, config);
            alert('Notification sent to all non-responding participants.');
        } catch (err) {
            setError('Failed to send notification');
            console.error(err);
        }
    };

    const handleDelete = async (meetingId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://oneonone-backend.onrender.com/api/meeting/pending-meeting/delete/${meetingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchMeetings(); // Re-fetch meetings to update the list
        } catch (err) {
            console.error('Failed to delete meeting:', err);
            setError('Failed to delete meeting');
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <Sidebar />
                <div className="col-md-10 main-content">
                    <div className="row">
                    <div className="col-md-6">
                        <div className="d-flex justify-content-between mb-4">
                            <h3>Pending Meetings</h3>
                            <div>
                                <button className={`btn ${viewType === 'owned' ? 'btn-primary' : 'btn-outline-primary'} me-2`} onClick={() => { setViewType('owned'); }}>Owned</button>
                                <button className={`btn ${viewType === 'participated' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setViewType('participated'); }}>Participated</button>
                            </div>
                        </div>
                        <div className="list-group">
                            {pendingMeetings.map(meeting => (
                                <div key={meeting.id} className="list-group-item list-group-item-action flex-column align-items-start mb-2 rounded">
                                    <div className="d-flex w-100 justify-content-between">
                                        {viewType === 'owned' ? (
                                            <div className="me-auto" style={{ color: 'inherit', textDecoration: 'none' }}>
                                                <h5 className="mb-1 font-weight-bold">{meeting.title}</h5>
                                                <p className="ddl">Deadline: {new Date(meeting.deadline).toLocaleString()}</p>
                                                {meeting.participants.map(participant => (
                                                    <p key={participant.user.id} className="mb-1">{participant.user.first_name} {participant.user.last_name}: {participant.response ? 'Responded' : 'Not Responded'}</p>
                                                ))}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="me-auto">
                                                    <h5 className="mb-1 font-weight-bold">{meeting.title}</h5>
                                                    <p className="ddl mb-1">Deadline: {new Date(meeting.deadline).toLocaleString()}</p>
                                                    {/* Display the response status directly from the meeting.your_response */}
                                                    <p className="mb-1">Your Status: {meeting.your_response}</p>
                                                </div>
                                            </>
                                        )}
                                        {viewType === 'participated' && new Date(meeting.deadline) > new Date() && (
                                            <Link to={`/invited-meeting/${meeting.id}`} className="btn btn-primary" style={{ height: '3em', alignSelf: 'center' }}>Respond</Link>
                                        )}
                                        {viewType === 'owned' && (
                                            new Date(meeting.deadline) < new Date() ? (
                                                <Link to={`/finalize-meeting/${meeting.id}`} className="btn btn-primary" style={{ height: '3em' }}>Finalize</Link>
                                            ) : (
                                                <>
                                                    <button type="button" className="btn btn-warning" onClick={() => handleNotify(meeting.id)} style={{ height: '3em', marginRight: '5px' }}>Notify</button>
                                                    <div className="d-flex justify-content-between">
                                                        <Link to={`/change-meeting/${meeting.id}`} className="btn btn-secondary" style={{ height: '3em', marginRight: '5px' }}><p  style={{marginTop: '5px' }}>Edit</p></Link>
                                                        <button type="button" className="btn btn-danger" onClick={() => handleDelete(meeting.id)} style={{ height: '3em' }}>Delete</button>
                                                    </div>
                                                </>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                        <div className="col-md-6">
                            <div className="d-flex justify-content-between mb-4">
                                <h3>Finalized Meetings</h3>
                            </div>
                            <div className="list-group">
                                {finalizedMeetings.map((meeting, index) => (
                                    <div key={index} className="list-group-item flex-column align-items-start mb-2 rounded">
                                        <h5 className="mb-1 font-weight-bold">{meeting.title}</h5>
                                        <ul className="list-unstyled">
                                            <li>Time: {new Date(meeting.time).toLocaleString()}</li>
                                            <li>Duration: {meeting.time_limit}min</li>
                                            <li>Participants: {meeting.owner.first_name} {meeting.owner.last_name}, {meeting.participant.first_name} {meeting.participant.last_name}</li>
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
