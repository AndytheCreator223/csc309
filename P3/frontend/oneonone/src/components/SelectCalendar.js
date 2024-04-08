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
    const { selectedSlots, setSelectedSlots } = useContext(MeetingContext);
    const [events, setEvents] = useState([]);
    const [startDate, setStartDate] = useState(new DayPilot.Date().firstDayOfWeek());

    useEffect(() => {
        const fetchFinalizedMeetings = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                const response = await axios.get('https://oneonone-backend.onrender.com/api/meeting/finalized-meeting/list/', config);
                const events = response.data.map(meeting => {
                    let start = new DayPilot.Date(new Date(meeting.time), true);
                    let end = start.addMinutes(meeting.time_limit);

                    return {
                        id: meeting.id,
                        text: meeting.title,
                        start: start.toString(),
                        end: end.toString(),
                        backgroundColor: "#AAAAAA",
                        readOnly: true,
                    };
                });
                setEvents(events);
            } catch (error) {
                console.error('Failed to fetch finalized meetings', error);
            }
        };
        fetchFinalizedMeetings().then(() => {
            console.log('Finalized meetings fetched successfully');
        });
    }, []);

    useEffect(() => {
        // Merge events and selectedSlots into one array for rendering
        calendarRef.current.control.update({
            events: [...events, ...selectedSlots]
        });
    }, [events, selectedSlots]);

    const handleTimeRangeSelected = async (args) => {
        const dp = calendarRef.current.control;
        dp.clearSelection();

        const now = new DayPilot.Date();
        if (args.start < now) {
            alert("Cannot select a time slot in the past.");
            return;
        }

        const overlap = events.some(event => args.start < new DayPilot.Date(event.end) && args.end > new DayPilot.Date(event.start));
        if (overlap) {
            alert("Selected slot overlaps with an existing meeting");
            return;
        }

        const overlapSelected = selectedSlots.some(slot => args.start < new DayPilot.Date(slot.end) && args.end > new DayPilot.Date(slot.start));
        if (overlapSelected) {
            alert("Selected slot overlaps with another selected slot.");
            return;
        }

        const form = [
            {name: "Priority", id: "priority", options: [{id: "High", name: "High"}, {id: "Low", name: "Low"}], type: "select"}
        ];
        const modal = await DayPilot.Modal.form(form);

        if (!modal.result) {
            return;
        }

        const prioritySelected = modal.result.priority ? modal.result.priority : "High";

        const newSlot = {
            start: args.start.toString(),
            end: args.end.toString(),
            text: "Selected Slot",
            backColor: prioritySelected === "High" ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 0, 255, 0.5)",
            priority: prioritySelected,
            id: DayPilot.guid(),
        };

        setSelectedSlots(prev => [...prev, newSlot]);
    };

    const handleEventClick = async (args) => {
        if (args.e.data.readOnly) {
            alert("Cannot edit finalized meeting");
            return;
        }

        const e = args.e;
        const form = [
            {name: "Priority", id: "priority", options: [{id: "High", name: "High"}, {id: "Low", name: "Low"}], type: "select", value: e.data.priority}
        ];
        const modal = await DayPilot.Modal.form(form);

        if (!modal.result) {
            return;
        }

        const prioritySelected = modal.result.priority ? modal.result.priority : "High";

        const updatedSlots = selectedSlots.map(slot => {
            if (slot.id === e.data.id) {
                return {...slot,
                    priority: prioritySelected,
                    backColor: prioritySelected === "High" ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 0, 255, 0.5)"};
            }
            return slot;
        });

        setSelectedSlots(updatedSlots);
    };

    const handleEventDelete = async (args) => {
        if (args.e.data.readOnly) {
            alert("Cannot delete finalized meeting");
            return;
        }
        const dp = calendarRef.current.control;
        dp.events.remove(args.e);
        setSelectedSlots(selectedSlots.filter(slot => slot.id !== args.e.data.id));
    }

    const calendarConfig = {
        viewType: "Week",
        durationBarVisible: true,
        timeRangeSelectedHandling: "Enabled",
        onTimeRangeSelected: handleTimeRangeSelected,
        eventMoveHandling: "Disabled",
        eventResizeHandling: "Disabled",
        onEventClick: handleEventClick,
        eventDeleteHandling: "Enabled",
        onEventDelete: handleEventDelete,
        startDate: startDate,
        contextMenu: new DayPilot.Menu({
            items: [
                {text: "Delete", onClick: args => args.source.remove()},
                {text: "Edit Priority", onClick: args => handleEventClick(args)}
            ]
        }),
    };

    return (
        <div style={styles.wrap}>
            <div style={styles.left}>
                <DayPilotNavigator
                    selectMode={"Week"}
                    showMonths={3}
                    skipMonths={3}
                    startDate={startDate}
                    onTimeRangeSelected={args => {
                        setStartDate(args.day);
                    }}
                />
            </div>
            <div style={styles.main}>
                <DayPilotCalendar {...calendarConfig} ref={calendarRef}/>
            </div>
        </div>
    );
}

export default SelectCalendar;
