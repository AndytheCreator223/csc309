import React, { useState, useEffect } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import axios from "axios";

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

const InvitedCalendar = ({ meetingId }) => {
    const [timeSlots, setTimeSlots] = useState([]);

    useEffect(() => {
        // Replace '0' with `${meetingId}` to make the URL dynamic
        const fetchTimeSlots = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                const response = await axios.get(`http://127.0.0.1:8000/api/meeting/pending-meeting/detail/${meetingId}/`, config);
                setTimeSlots(response.data.time_slot);
            } catch (error) {
                console.error('Failed to fetch time slots:', error);
            }
        };
        fetchTimeSlots().then(() => {
            console.log('Time slots fetched successfully');
        });
    }, [meetingId]);

    const calendarConfig = {
        viewType: "Week",
        onBeforeCellRender: args => {
            timeSlots.forEach(slot => {
                const slotStart = new DayPilot.Date(slot.start_time);
                const slotEnd = slotStart.addMinutes(30); // Assuming each time slot is 30 minutes

                if (args.cell.start >= slotStart && args.cell.start < slotEnd) {
                    args.cell.properties.backColor = slot.priority === 0 ? "#ffcccc" : "#ccccff"; // Low priority: light red, High priority: light blue
                }
            });
        },
        startDate: new DayPilot.Date().firstDayOfWeek(),
    };

    return (
        <div style={styles.wrap}>
            <div style={styles.left}>
                <DayPilotNavigator
                    selectMode={"Week"}
                    showMonths={3}
                    skipMonths={3}
                    startDate={new DayPilot.Date()}
                    selectionDay={new DayPilot.Date()}
                />
            </div>
            <div style={styles.main}>
                <DayPilotCalendar {...calendarConfig}/>
            </div>
        </div>
    );
};

export default InvitedCalendar;
