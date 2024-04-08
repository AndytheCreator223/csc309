import React, {useState, useEffect, useContext} from 'react';
import SelectCalendar from '../components/SelectCalendar';
import { MeetingContext } from '../contexts/MeetingContext';
import { Link } from 'react-router-dom';
import { DayPilot } from "@daypilot/daypilot-lite-react";
import axios from "axios";

const CreateMeeting = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [deadline, setDeadline] = useState('');
    const [timeLimit, setTimeLimit] = useState(30);
    const [error, setError] = useState('');
    const [isCustomTime, setIsCustomTime] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState('');
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const { selectedSlots } = useContext(MeetingContext);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const token = localStorage.getItem("token"); // Assuming token storage for authentication
                const response = await axios.get("https://oneonone-backend.onrender.com/api/account/contacts/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setContacts(response.data); // Assuming the API returns an array of contacts
            } catch (error) {
                console.error('Failed to fetch contacts:', error);
                handleError("Failed to load contacts.");
            }
        };

        const fetchGroups = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("https://oneonone-backend.onrender.com/api/account/group/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setGroups(response.data); // Assuming the API returns an array of groups
            } catch (error) {
                console.error('Failed to fetch groups:', error);
                handleError("Failed to load groups.");
            }
        };

        fetchContacts();
        fetchGroups();
    }, []);

    useEffect(() => {
      // Set the time limit to 30 minutes when the component mounts or when certain conditions change
      setTimeLimit(30);
    }, []);

    const notifyParticipantsByEmail = async (meetingId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `https://oneonone-backend.onrender.com/api/meeting/create-meeting-notify/`,
                { meeting_id: meetingId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const message = response.data.message;
            alert('Meeting successfully created. ' + message);
            window.location.href = '/meetings';
        } catch (error) {
            console.error('Failed to notify invitees:', error);
            handleError('Failed to notify invitees');
        }
    };


    const addParticipantsToMeeting = async (meetingId, participants) => {
        const participantPromises = participants.map(participantId =>
            axios.post('https://oneonone-backend.onrender.com/api/meeting/participant/create/', {
                meeting: meetingId,
                user: participantId // Here, participantId is actually the user ID of each contact
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
        );

        try {
            await Promise.all(participantPromises);
        } catch (error) {
            console.error('Failed to add one or more participants:', error);
            handleError(`Failed to add one or more participants: ${error.response?.data.detail || 'Unknown error'}`);
        }
    };

    const postTimeSlots = async (meetingId) => {
        const promises = selectedSlots.map(async slot => {
            const start = new DayPilot.Date(slot.start);
            const end = new DayPilot.Date(slot.end);
            let current = start;

            while (current < end) {
                const priority = slot.priority === "High" ? 1 : 0;
                await axios.post('https://oneonone-backend.onrender.com/api/meeting/time-slots/create/', {
                    meeting: meetingId,
                    start_time: current.toString(),
                    priority: priority,
                }, {
                    headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
                });
                current = current.addMinutes(30); // Move to the next slot
            }
        });

        await Promise.all(promises);
    };

    const handleAddContact = () => {
        const contactToAdd = contacts.find(contact => contact.id.toString() === selectedContact);
        // Use contact_user_id for checking existing contacts to align with the group logic
        if (contactToAdd && !selectedContacts.some(c => c.contact_user_id === contactToAdd.contact_user_id)) {
            // Adapt the added contact structure to include contact_user_id and contact_username
            const newContact = {
                ...contactToAdd,
                id: contactToAdd.contact_user_id, // Ensure consistent ID usage across individual and group adds
                contact_username: contactToAdd.contact_username,
            };
            setSelectedContacts(prevContacts => [...prevContacts, newContact]);
        }
        setSelectedContact(''); // Reset dropdown after adding
    };

    const handleRemoveContact = (contactId) => {
        setSelectedContacts(prevContacts => prevContacts.filter(contact => contact.id !== contactId));
    };

    const handleTimeLimitChange = (e) => {
        if (e.target.value === "Custom") {
            setIsCustomTime(true);
            setTimeLimit('');
        } else {
            setIsCustomTime(false);
            setTimeLimit(e.target.value);
        }
    };

    const handleGroupSelection = (e) => {
        setSelectedGroup(e.target.value);
    };

    const handleAddGroupMembers = () => {
      const groupToAdd = groups.find(group => group.id.toString() === selectedGroup);
      if (groupToAdd) {
        // Use a new Set to track IDs for efficient lookup
        const existingContactIds = new Set(selectedContacts.map(contact => contact.contact_user_id));

        // Filter out members already in selectedContacts
        const newMembers = groupToAdd.members.filter(member => !existingContactIds.has(member.id));

        // Map new members to the expected structure and add them to selectedContacts
        const updatedContacts = [
          ...selectedContacts,
          ...newMembers.map(member => ({
            id: member.id, // Assuming member objects have an id field
            contact_user_id: member.id, // Adjust if your contact objects use a different field for id
            contact_username: member.username // Ensure this matches how usernames are stored/displayed in your contacts
          }))
        ];

        setSelectedContacts(updatedContacts);
      }
      setSelectedGroup(''); // Reset the selected group dropdown after adding
    };

    const handleCustomTimeChange = (e) => {
        setTimeLimit(e.target.value);
    };

    const handleError = (message) => {
        setError(message);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('message', message);
        formData.append('deadline', deadline);
        formData.append('time_limit', timeLimit);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "https://oneonone-backend.onrender.com/api/meeting/pending-meeting/create/",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status === 201) {
                const meetingId = response.data.id; // Assuming the response includes the meeting ID
                const participants = selectedContacts.map(contact => contact.contact_user_id); // Adjusted to match your data structure
                await addParticipantsToMeeting(meetingId, participants);
                await postTimeSlots(meetingId);
                await notifyParticipantsByEmail(meetingId);
            }

        } catch (err) {
              let errorMessage = "Failed to create meeting. Please try again."; // Default error message
              if (err.response && err.response.data) {
                  if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                  } else if (err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                  } else {
                    errorMessage = Object.keys(err.response.data)
                                          .map(key => {
                                            const value = err.response.data[key];
                                            // Check if the value is an array to use join; otherwise, use it directly
                                            return Array.isArray(value) ? `${key}: ${value.join(" ")}` : `${key}: ${value}`;
                                          })
                                          .join(' ');
                  }
              }
              console.error("Failed to create meeting:", err);
              handleError(errorMessage);
        }
    };

    return (
        <div className="container-fluid main-content" style={{ minHeight: '100vh' }}>
            <div className="row">
                <div className="col-md-8 mt-4">
                    <Link to={`/dashboard`} className="btn btn-primary">Back to Dashboard</Link>
                </div>
            </div>
            <div className="row">
                <div className="col-md-8">
                    <div className="datetime-selection">
                        <h2 className="big-title">Select date(s) and time</h2>
                        <SelectCalendar />
                    </div>
                </div>
                <div className="col-md-4">
                    <form onSubmit={handleSubmit}>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="appointment-summary" style={{marginBottom: "10px"}}>
                            <h3>Appointment summary</h3>
                            <label htmlFor="title"
                                   className="label-frame label-frame-yellow form-label">Title:</label>
                            <input type="text" id="title" className="form-control" value={title}
                                   onChange={(e) => setTitle(e.target.value)} required/>
                        </div>
                        <div className="deadline-request" style={{marginBottom: "10px"}}>
                            <label htmlFor="deadline"
                                   className="label-frame label-frame-purple form-label"> Deadline:</label>
                            <input type="datetime-local" id="deadline" className="form-control" value={deadline}
                                   onChange={(e) => setDeadline(e.target.value)} required/>
                        </div>
                        {/* Contacts selection dropdown */}
                        <div className="form-group">
                            <label htmlFor="contacts-dropdown">Select Contact</label>
                            <select
                                className="form-control"
                                id="contacts-dropdown"
                                value={selectedContact}
                                onChange={(e) => setSelectedContact(e.target.value)}
                            >
                                <option value="">Choose...</option>
                                {contacts.map((contact) => (
                                    <option key={contact.id} value={contact.id}>
                                        {contact.contact_username}
                                    </option>
                                ))}
                            </select>
                            <button type="button" className="btn btn-primary mt-2" onClick={handleAddContact}>Add
                            </button>
                        </div>
                        {/* Group selection dropdown */}
                        <div className="form-group">
                            <label htmlFor="groups-dropdown">Select Group</label>
                            <select
                                className="form-control"
                                id="groups-dropdown"
                                value={selectedGroup}
                                onChange={handleGroupSelection}
                            >
                                <option value="">Choose...</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                            <button type="button" className="btn btn-primary mt-2"
                                    onClick={handleAddGroupMembers}>Add
                            </button>
                        </div>
                        <div className="mt-3">
                            <h5>Selected Contacts:</h5>
                            {selectedContacts.length > 0 ? (
                                <ul className="list-group">
                                    {selectedContacts.map((contact) => (
                                        <li key={contact.id}
                                            className="list-group-item d-flex justify-content-between align-items-center">
                                            {contact.contact_username}
                                            <button type="button" className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleRemoveContact(contact.id)}>
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">No contacts selected.</p>
                            )}
                        </div>

                        <div className="mt-3">
                            <h5>Selected Slots:</h5>
                            {selectedSlots.length > 0 ? (
                                <ul className="list-group">
                                    {selectedSlots.map((slot, index) => (
                                        <li key={index}
                                            className="list-group-item d-flex justify-content-between align-items-center">
                                            {`${new DayPilot.Date(slot.start).toString("M/d/yyyy H:mm")} - ${new DayPilot.Date(slot.end).toString("M/d/yyyy H:mm")}`}
                                            <span className="badge bg-primary rounded-pill">{slot.priority}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">No slots selected.</p>
                            )}
                        </div>

                        <div className="message-for-contact" style={{marginTop: "15px", marginBottom: "15px"}}>
                            <label htmlFor="message"
                                   className="label-frame label-frame-pink form-label">Message:</label>
                            <textarea className="form-control" id="message" rows="5" value={message}
                                      onChange={(e) => setMessage(e.target.value)}
                                      placeholder="Enter your message here..."></textarea>
                        </div>
                        <div className="final-confirmation">
                            <button type="submit" className="btn btn-primary w-50 mb-5 submit-button">Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateMeeting;
