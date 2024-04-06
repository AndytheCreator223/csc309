import React from 'react';
import { useParams } from 'react-router-dom';

function InvitedMeeting() {
  const { meeting_id, user_id } = useParams();

  // You can now use meeting_id and user_id as needed in your component
  console.log(meeting_id, user_id);

  return (
    <div>
      {/* Render your component based on meeting_id and user_id */}
      <h1>Invited Meeting</h1>
      <p>Meeting ID: {meeting_id}</p>
      <p>User ID: {user_id}</p>
    </div>
  );
}

export default InvitedMeeting;
