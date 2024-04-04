import React, { useState, useRef, useEffect, useContext } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import axios from "axios";
import "./Calendar.css";
import { MeetingContext } from "../contexts/MeetingContext";

const styles = {
    wrap: {
        display: "flex"
    },
    left: {
        marginRight: "10px"
    },
    main: {
        flexGrow: "1"
    }
};

const SelectCalendar = () => {
    const calendarRef = useRef()
    const { setSelectedSlots } = useContext(MeetingContext);

    const [calendarConfig, setCalendarConfig] = useState({
        viewType: "Week",
        durationBarVisible: false,
        timeRangeSelectedHandling: "Enabled",
        onTimeRangeSelected: args => {
            setSelectedSlots({
                start: args.start.toString(),
                end: args.end.toString(),
            });
            calendarRef.current.control.clearSelection();
        },
        startDate: new DayPilot.Date().firstDayOfWeek(),
    });

    useEffect(() => {
        const fetchFinalizedMeetings = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                const response = await axios.get('http://127.0.0.1:8000/api/meeting/finalized-meeting/list/', config);
                const events = response.data.map(meeting => {
                    let start = new DayPilot.Date(new Date(meeting.time), true);
                    let end = start.addMinutes(meeting.time_limit);

                    return {
                        id: meeting.id,
                        text: meeting.title,
                        start: start.toString(),
                        end: end.toString(),
                        backgroundColor: "#AAAAAA",
                    };
                });
                calendarRef.current.control.update({events: events});
            } catch (error) {
                console.error('Failed to fetch finalized meetings', error);
            }
        };
        fetchFinalizedMeetings().then(() => {
            console.log('Finalized meetings fetched successfully');
        });
    }, []);

    return (
        <div style={styles.wrap}>
            <div style={styles.left}>
                <DayPilotNavigator
                    selectMode={"Week"}
                    showMonths={3}
                    skipMonths={3}
                    startDate={new DayPilot.Date()}
                    selectionDay={new DayPilot.Date()}
                    onTimeRangeSelected={args => {
                        calendarRef.current.control.update({
                            startDate: args.day,
                        });
                    }}
                />
            </div>
            <div style={styles.main}>
                <DayPilotCalendar
                    {...calendarConfig}
                    ref={calendarRef}
                />
            </div>
        </div>
    );
}

export default SelectCalendar;
