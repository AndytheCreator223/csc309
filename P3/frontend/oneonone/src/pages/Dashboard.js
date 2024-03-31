import React, {useEffect, useState} from "react";
import Sidebar from "../components/Sidebar";
import Calendar from "../components/Calendar";
import axios from "axios";

const Dashboard = () => {
    const [finalizedMeetings, setFinalizedMeetings] = useState([]);
    const [pendingMeetings, setPendingMeetings] = useState([]);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                const finalizedResponse = await axios.get('http://127.0.0.1:8000/api/meeting/finalized-meeting/list/', config);
                const adjustedMeetings = finalizedResponse.data.map(meeting => ({
                    ...meeting,
                    time: new Date(meeting.time).toLocaleString(),
                }));
                setFinalizedMeetings(adjustedMeetings);

                const pendingResponse = await axios.get('http://127.0.0.1:8000/api/meeting/pending-meeting/list/', config);
                setPendingMeetings(pendingResponse.data);
            } catch (error) {
                console.error("Failed to fetch meetings", error);
            }
        };
        fetchMeetings().then(r => console.log("Meetings fetched"));
    }, []);

    return (
        <div className="container-fluid">
            <div className="row">
                <Sidebar/>
                <div className="col-md-10 main-content">
                    <div className="row flex-nowrap mb-3">
                        <div className="col-md-9 col-12 d-flex flex-column">
                            <div className="big-box">
                                <Calendar/>
                            </div>
                        </div>

                        <div className="col-md-3 d-flex flex-column">
                            <div className="schedule h-100">
                                <div className="schedule-title">Schedule</div>
                                <div className={"event-container"}>
                                    {finalizedMeetings.map(meeting => (
                                    <div key={meeting.title} className="event mb-3 mt-3">
                                        <h3>{meeting.title}</h3>
                                        <p>{meeting.time}</p>
                                        <p>Duration: {meeting.time_limit} minutes</p>
                                        <p>Participant: {meeting.participant.first_name} {meeting.participant.last_name}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="pending-meetings">
                            <div className="row">
                                {pendingMeetings.map((meeting, index) => (
                                    <div key={index} className={`col meeting mb-3 mt-3 ${meeting.has_passed_deadline ? 'red-color' : 'gold-color'}`}>
                                        <h5>{meeting.title}</h5>
                                        <p className="ddl">Deadline: {new Date(meeting.deadline).toLocaleString()}</p>
                                        <ul>
                                            {meeting.participants.map(participant => (
                                                <li key={participant.user.id}>
                                                    {participant.user.first_name} {participant.user.last_name}: {participant.response ? "Responded" : "Not Responded"}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;