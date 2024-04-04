import React from 'react';
import SelectCalendar from '../components/SelectCalendar';
import { MeetingProvider } from '../contexts/MeetingContext';

const CreateMeeting = () => {
    return (
        <MeetingProvider>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-8 mt-4">
                        <a href="dashboard.html" className="btn btn-primary">Back to Dashboard</a>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-8">
                        <div className="datetime-selection">
                            <h2 className="big-title">Select date(s) and time</h2>
                            <SelectCalendar/>
                        </div>
                    </div>
                </div>
            </div>
        </MeetingProvider>
    );
};

export default CreateMeeting;