import React, { createContext, useState } from 'react';

export const MeetingContext = createContext();

export const MeetingProvider = ({ children }) => {
    const [selectedSlots, setSelectedSlots] = useState([]);

    return (
        <MeetingContext.Provider value={{ selectedSlots, setSelectedSlots }}>
            {children}
        </MeetingContext.Provider>
    );
};