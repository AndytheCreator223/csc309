import React, {useState, useEffect, useRef, useContext} from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import axios from "axios";
import {MeetingContext} from "../contexts/MeetingContext";

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
    const calendarRef = useRef();
    const [timeSlots, setTimeSlots] = useState([]);
    const { selectedSlots, setSelectedSlots } = useContext(MeetingContext);
    const [events, setEvents] = useState([]);
    const [startDate, setStartDate] = useState(new DayPilot.Date().firstDayOfWeek());

    useEffect(() => {
        const fetchTimeSlots = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                const response = await axios.get(`https://oneonone-backend.onrender.com/api/meeting/pending-meeting/detail/${meetingId}`, config);
                const timeSlots = response.data.time_slots.map(slot => {
                    const start = new DayPilot.Date(new Date(slot.start_time), true);
                    const end = start.addMinutes(30);
                    const priority = slot.priority ===0 ? "Low" : "High";
                    return {
                        ...slot,
                        start: start.toString(),
                        end: end.toString(),
                        priority: priority,
                    };

                });
                setTimeSlots(timeSlots);
            } catch (error) {
                console.error('Failed to fetch time slots:', error);
            }
        };
        fetchTimeSlots().then(() => {
            console.log('Time slots fetched successfully');
        });
    }, [meetingId]);

    useEffect(() => {
        // Merge events and selectedSlots into one array for rendering
        calendarRef.current.control.update({
            events: [...events, ...selectedSlots]
        });
    }, [events, selectedSlots]);

    const handleTimeRangeSelected = async (args) => {
        const dp = calendarRef.current.control;
        dp.clearSelection();

        // Sort timeSlots by start time to ensure order
        const sortedTimeSlots = timeSlots.sort((a, b) => {
            const startA = new DayPilot.Date(a.start_time);
            const startB = new DayPilot.Date(b.start_time);
            return startA.getTime() - startB.getTime();
        });

        let ownerTimeRanges = [];
        sortedTimeSlots.forEach(slot => {
            const slotStart = new DayPilot.Date(slot.start_time);
            const slotEnd = slotStart.addMinutes(30); // Each slot is 30 minutes.

            if (ownerTimeRanges.length > 0) {
                let lastRange = ownerTimeRanges[ownerTimeRanges.length - 1];
                // Check if we can extend the end of the last range
                if (slotStart.equals(lastRange.end)) {
                    lastRange.end = slotEnd;
                }
                // Check if we can extend the start of the last range
                else if (slotEnd.equals(lastRange.start)) {
                    lastRange.start = slotStart;
                }
                // If not contiguous, push as a new range
                else {
                    ownerTimeRanges.push({ start: slotStart, end: slotEnd });
                }
            } else {
                // First slot, creating the first range
                ownerTimeRanges.push({ start: slotStart, end: slotEnd });
            }
        });

        // Check if the selected time range is within any of the constructed owner time ranges
        const withinOwnerTimeSlot = ownerTimeRanges.some(range => args.start >= range.start && args.end <= range.end);
        if (!withinOwnerTimeSlot) {
            alert("Selected slot is not within the owner-provided time slots.");
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
        onBeforeCellRender: args => {
            timeSlots.forEach(slot => {
                const slotStart = new DayPilot.Date(slot.start_time);
                const slotEnd = slotStart.addMinutes(30); // Assuming each time slot is 30 minutes

                if (args.cell.start >= slotStart && args.cell.start < slotEnd) {
                    args.cell.properties.backColor = slot.priority === "Low" ? "#ffcccc" : "#ccccff"; // Low priority: light red, High priority: light blue
                }
            });
        },
        startDate: startDate,
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
};

export default InvitedCalendar;
