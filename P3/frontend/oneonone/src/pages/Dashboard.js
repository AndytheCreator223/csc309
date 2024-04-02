import React, {useEffect, useState} from "react";
import Sidebar from "../components/Sidebar";
import DashboardCalendar from "../components/DashboardCalendar";
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

                // Sort by time in descending order and take the first five
                const recentMeetings = finalizedResponse.data
                    .sort((a, b) => new Date(b.time) - new Date(a.time))
                    .slice(0, 5)
                    .map(meeting => ({
                        ...meeting,
                        time: new Date(meeting.time).toLocaleString(),
                    }));

                setFinalizedMeetings(recentMeetings);

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
                        <div className="big-box">
                            <div className="mt-3 mb-3">
                                <h2>Dashboard</h2>
                                <DashboardCalendar/>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="schedule mb-3">
                            <div className="row">
                                {finalizedMeetings.map(meeting => (
                                    <div key={meeting.title} className="event col mb-3 mt-3">
                                        <h3>{meeting.title}</h3>
                                        <p>{meeting.time}</p>
                                        <p>Duration: {meeting.time_limit} minutes</p>
                                        <p>Participant: {meeting.participant.first_name} {meeting.participant.last_name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="pending-meetings">
                            <div className="row">
                                {pendingMeetings.map((meeting, index) => (
                                    <div key={index}
                                         className={`col meeting mb-3 mt-3 ${meeting.has_passed_deadline ? 'gold-color' : 'green-color'}`}>
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