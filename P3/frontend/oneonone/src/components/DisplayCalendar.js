import React, { useState, useRef, useEffect } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import axios from "axios";
import "./Calendar.css";

const styles = {
  wrap: {
    display: "flex",
  },
  main: {
    flexGrow: "1"
  }
};

const DisplayCalendar = () => {
  const calendarRef = useRef()
  const now = new DayPilot.Date();

  const [calendarConfig, setCalendarConfig] = useState({
    viewType: "Week",
    durationBarVisible: true,
    timeRangeSelectedHandling: "Disabled",
      eventClickHandling: "Disabled",
      eventMoveHandling: "Disabled",
    startDate: now.firstDayOfWeek(),
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
      <DayPilotNavigator
        selectMode={"Week"}
        showMonths={2}
        skipMonths={2}
        startDate={now}
        selectionDay={now}
        onTimeRangeSelected={ args => {
          calendarRef.current.control.update({
            startDate: args.day
          });
        }}
      />
      <div style={styles.main}>
        <DayPilotCalendar
          {...calendarConfig}
          ref={calendarRef}
        />
      </div>
    </div>
  );
}

export default DisplayCalendar;