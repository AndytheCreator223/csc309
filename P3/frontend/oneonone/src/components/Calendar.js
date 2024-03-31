import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment-timezone";

const Calendar = () => {
    const [meetings, setMeetings] = useState([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('isoWeek'));

    useEffect(() => {
        fetchMeetings().then(r => console.log("Meetings fetched"));
    }, [currentWeekStart]);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const response = await axios.get('http://127.0.0.1:8000/api/meeting/finalized-meeting/list/', config);
            const adjustedMeetings = response.data.map(meeting => ({
                ...meeting,
                time: moment(meeting.time).local().format(), // Adjust to local timezone
            }));
            setMeetings(adjustedMeetings);
        } catch (error) {
            console.error("Failed to fetch meetings", error);
        }
    };

    const navigateWeeks = (direction) => {
        const newWeekStart = currentWeekStart.clone().add(direction, 'weeks');
        setCurrentWeekStart(newWeekStart);
    };

    const days = Array.from({ length: 7 }, (_, index) => currentWeekStart.clone().add(index, 'days'));
    const timeSlots = Array.from({ length: 24 }, (_, index) => moment().startOf('day').add(9 * 60 + 30 * index, 'minutes'));

    return (
        <div className="calendar-container">
            <div className="calendar-header mb-3">
                <h4>{currentWeekStart.format('MMMM YYYY')}</h4>
                <p>无法显示time limit， 无法显示past meetings</p>
            </div>
            <button onClick={() => navigateWeeks(-1)}>Previous Week</button>
            <button onClick={() => navigateWeeks(1)}>Next Week</button>
            <table className="calendar-table">
                <thead>
                <tr>
                    <th>Time</th>
                    {days.map(day => (
                        <th key={day.format()}>{day.format('MM/DD ddd')}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {timeSlots.map((slot, index) => (
                    <tr key={index}>
                        <td>{slot.format('h:mm A')}</td>
                        {days.map(day => (
                            <td key={day.format()}>
                                {meetings.filter(meeting => {
                                    const meetingTime = moment(meeting.time);
                                    return day.isSame(meetingTime, 'day') && slot.hour() === meetingTime.hour() && slot.minute() === meetingTime.minute();
                                }).map(meeting => (
                                    <div key={`${meeting.id}-${day.format('YYYY-MM-DD')}`} className="meeting-slot">
                                        {meeting.title} with {meeting.participant.first_name}
                                    </div>
                                ))}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Calendar;