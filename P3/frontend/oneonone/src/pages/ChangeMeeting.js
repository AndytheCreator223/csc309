import React, {useState, useEffect, useContext} from 'react';
import { useParams, Link } from 'react-router-dom';
import { MeetingContext } from '../contexts/MeetingContext';
import axios from 'axios';
import SelectCalendar from "../components/SelectCalendar";
import { DayPilot } from "@daypilot/daypilot-lite-react";

const ChangeMeeting = () => {
    const { meeting_id} = useParams();
    const [meetingDetails, setMeetingDetails] = useState(null);
    const [error, setError] = useState('');
    const [participants, setParticipants] = useState([]);
    const { selectedSlots } = useContext(MeetingContext);

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

    const postTimeSlots = async (meetingId) => {
        const promises = selectedSlots.map(async slot => {
            const start = new DayPilot.Date(slot.start);
            const end = new DayPilot.Date(slot.end);
            let current = start;

            while (current < end) {
                const priority = slot.priority === "High" ? 1 : 0;
                await axios.post('http://127.0.0.1:8000/api/meeting/time-slots/create/', {
                    meeting: meetingId,
                    start_time: current.toString(),
                    priority: priority,
                }, {
                    headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
                });
                current = current.addMinutes(30); // Move to the next slot
            }
        });

        await Promise.all(promises);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            // Call the API to delete existing time slots for the meeting
            await axios.delete(
                `http://127.0.0.1:8000/api/meeting/time-slots/delete/${meeting_id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            await postTimeSlots(meeting_id);
            window.location.href = '/meetings';
        } catch (error) {
            console.error('Failed to delete time slots:', error);
            setError("Failed to delete existing time slots.");
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


    return (
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
                            <div className="participant-list mb-3">
                                <h5>Participants</h5>
                                <ul className="list-group">
                                    {participants.map((participant) => (
                                        <li key={participant.id} className="list-group-item">
                                            {participant.first_name} {participant.last_name} - {participant.response ? 'Responded' : 'Not Responded'}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-3">
                                <h5>Selected Slots:</h5>
                                {selectedSlots.length > 0 ? (
                                    <ul className="list-group">
                                        {selectedSlots.map((slot, index) => (
                                            <li key={index}
                                                className="list-group-item d-flex justify-content-between align-items-center">
                                                {`${new DayPilot.Date(slot.start).toString("M/d/yyyy H:mm")} - ${new DayPilot.Date(slot.end).toString("M/d/yyyy H:mm")}`}
                                                <span className="badge bg-primary rounded-pill">{slot.priority}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted">No slots selected.</p>
                                )}
                            </div>

                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="final-confirmation mt-3">
                                <button type="submit" className="btn btn-primary w-50 mb-5 submit-button">Submit
                                    Response
                                </button>
                            </div>
                        </form>
                    </div>
            </div>
        </div>
    );
};

export default ChangeMeeting;
