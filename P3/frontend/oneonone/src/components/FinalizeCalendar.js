import React, { useEffect, useRef, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";

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

const FinalizeCalendar = ({ selectedSlots }) => {
    const calendarRef = useRef();
    const [startDate, setStartDate] = useState(new DayPilot.Date().firstDayOfWeek());

    useEffect(() => {
        // Convert selectedSlots into a uniform format
        const events = selectedSlots.flatMap(slot => {
            // Determine if slot is from participant response or suggested schedule
            if (slot.start_time) {
                // Participant response format
                return [{
                    start: slot.start_time,
                    end: new DayPilot.Date(slot.start_time).addMinutes(30).toString(),
                    id: DayPilot.guid(),
                    text: "Participant Slot",
                    backColor: slot.priority === 0 ? "#ffcccc" : "#ccccff", // Adjust color mapping as necessary
                }];
            } else if (slot.time) {
                // Suggested schedule format
                return [{
                    start: slot.time,
                    end: new DayPilot.Date(slot.time).addMinutes(30).toString(),
                    id: DayPilot.guid(),
                    text: "Suggested Slot",
                    backColor: "#cce5ff", // Use a different color for suggested slots
                }];
            }
            return [];
        });

        calendarRef.current.control.update({
            startDate: startDate,
            events: events,
        });
    }, [selectedSlots, startDate]);

    const calendarConfig = {
        viewType: "Week",
        durationBarVisible: false,
        timeRangeSelectedHandling: "Disabled",
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
                        // Optionally, you can force the calendar to re-render based on new startDate
                        // This might be necessary if your calendar doesn't automatically react to startDate change
                        calendarRef.current.control.update({startDate: args.day});
                    }}
                />
            </div>
            <div style={styles.main}>
                <DayPilotCalendar {...calendarConfig} ref={calendarRef}/>
            </div>
        </div>
    );
};

export default FinalizeCalendar;
