import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupToAdd, setGroupToAdd] = useState("");
  const [selectedUserToAdd, setSelectedUserToAdd] = useState({});
  const [username, setUsername] = useState("");
  const [errorContacts, setErrorContacts] = useState("");
  const [errorGroups, setErrorGroups] = useState("");
  const [newGroupName, setNewGroupName] = useState("");


  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        "http://127.0.0.1:8000/api/account/contacts/",
        config
      );
      setContacts(response.data);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setErrorContacts("Failed to load contacts.");
    }
  };

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve the stored token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Use the token for authorization
        },
      };
      // Send the GET request to the backend endpoint
      const response = await axios.get(
        "http://127.0.0.1:8000/api/account/group/",
        config
      );
      setGroups(response.data); // Update the state with the fetched groups
    } catch (err) {
      // Handle errors, such as displaying a message to the user
      console.error("Failed to fetch groups:", err);
      setErrorGroups("Failed to load groups.");
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchGroups();
  }, []);

  const handleError = (setError, message) => {
    setError(message);
    setTimeout(() => {
      setError(""); // Clear the error after 5 seconds
    }, 10000);
  };

  const handleAddGroup = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const data = { name: groupToAdd };
      const response = await axios.post(
        "http://127.0.0.1:8000/api/account/group/create/",
        data,
        config
      );
      if (response.status === 201) {
        setGroupToAdd(""); // Clear the input field
        fetchGroups(); // Fetch groups again to refresh the list
      }
    } catch (err) {
      let errorMessage = "Failed to add group. Please try again."; // Default error message
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
                                    return Array.isArray(value) ? `${value.join(" ")}` : `${value}`;
                                  })
                                  .join(", ");
          }
      }
      console.error("Failed to add group:", err);
      handleError(setErrorGroups, errorMessage);
      }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const url = `http://127.0.0.1:8000/api/account/group/${groupId}/delete/`;
      await axios.delete(url, config);
      setGroups((currentGroups) =>
        currentGroups.filter((group) => group.id !== groupId)
      );
      // Optionally, you can fetch all groups again to refresh the list
    } catch (err) {
      let errorMessage = "Failed to delete group. Please try again."; // Default error message
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
                                    return Array.isArray(value) ? `${value.join(" ")}` : `${value}`;
                                  })
                                  .join(", ");
          }
      }
      console.error("Failed to delete group:", err);
      handleError(setErrorGroups, errorMessage);
    }
  };

 const handleAddMemberToGroup = async (event, groupId) => {
  event.preventDefault();
  const selectedUser = selectedUserToAdd[groupId];
  if (!selectedUser) {
    console.error("No user selected to add to the group.");
    return; // Stop the function if no user is selected
  }
  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const data = { username: selectedUser };

  try {
    await axios.post(
      `http://127.0.0.1:8000/api/account/group/${groupId}/add/${selectedUser}/`, // Adjust URL as needed
      data,
      config
    );
    fetchGroups(); // Re-fetch groups or update state to include the new member in the group
    setSelectedUserToAdd({ ...selectedUserToAdd, [groupId]: "" }); // Reset selected user for the group after adding
  } catch (err) {
      let errorMessage = "Failed to add member to group. Please try again."; // Default error message
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
                                    return Array.isArray(value) ? `${value.join(" ")}` : `${value}`;
                                  })
                                  .join(", ");
          }
      }
      console.error("Failed to add member to group:", err);
      handleError(setErrorGroups, errorMessage);
  }
};

  const handleRemoveMemberFromGroup = async (groupId, username) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const url = `http://127.0.0.1:8000/api/account/group/${groupId}/remove/${encodeURIComponent(
        username
      )}/`;
      await axios.post(url, {}, config); // Note the change here from axios.delete to axios.post
      fetchGroups(); // Re-fetch groups to update the UI
    } catch (err) {
      let errorMessage = "Failed to remove member. Please try again."; // Default error message
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
                                    return Array.isArray(value) ? `${value.join(" ")}` : `${value}`;
                                  })
                                  .join(", ");
          }
      }
      console.error("Failed to remove member from group:", err);
      handleError(setErrorGroups, errorMessage);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const data = { username };
      await axios.post(
        "http://127.0.0.1:8000/api/account/contacts/add/",
        data,
        config
      );
      setUsername("");
      setErrorContacts("");
      fetchContacts();
    } catch (err) {
      let errorMessage = "Failed to add contact. Please check the username."; // Default error message
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
                                    return Array.isArray(value) ? `${value.join(" ")}` : `${value}`;
                                  })
                                  .join(", ");
          }
      }
      console.error("Failed to add contact:", err);
      handleError(setErrorContacts, errorMessage);
    }
  };

  const handleChangeGroupName = async (groupId) => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const data = { name: newGroupName[groupId] }; // Use group ID to get specific new name

    try {
      await axios.patch(`http://127.0.0.1:8000/api/account/group/${groupId}/change-name/`, data, config);
      setGroups(groups.map(group => {
        if (group.id === groupId) {
          return { ...group, name: newGroupName[groupId] };
        }
        return group;
      }));
      setNewGroupName({ ...newGroupName, [groupId]: "" }); // Reset the specific input field
    } catch (err) {
      let errorMessage = "Failed to change group name."; // Default error message
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
                                    return Array.isArray(value) ? `${value.join(" ")}` : `${value}`;
                                  })
                                  .join(", ");
          }
      }
      console.error("Failed to change group name:", err);
      handleError(setErrorGroups, errorMessage);
    }
  };


  const handleDeleteContact = async (contactUsername) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(
        `http://127.0.0.1:8000/api/account/contacts/delete/${contactUsername}/`,
        config
      );
      fetchContacts();
    } catch (err) {
      let errorMessage = "Failed to delete contact."; // Default error message
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
                                    return Array.isArray(value) ? `${value.join(" ")}` : `${value}`;
                                  })
                                  .join(", ");
          }
      }
      console.error("Failed to delete contact:", err);
      handleError(setErrorContacts, errorMessage);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />

        {/* Contact JSX */}
        <div className="col-md-5 main-content" >
          <h3 className="mt-3 mb-3">Add Contact</h3>
          <form className="input-group mb-3" onSubmit={handleAddContact}>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
            <div className="input-group-append">
              <button className="btn btn-outline-primary" type="submit">
                Add Contact
              </button>
            </div>
          </form>

          <h3 className="mt-3 mb-3">Contacts</h3>
          <div className="list-group">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>
                    {contact.contact_first_name} {contact.contact_last_name}
                  </strong>
                  <br />
                  <span>Email: {contact.contact_email}</span>
                  <br />
                  <span>Username: {contact.contact_username}</span> {/* Display the username with @ prefix */}
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteContact(contact.contact_username)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          {errorContacts && (
            <div className="alert alert-danger">{errorContacts}</div>
          )}
        </div>

        {/* Group JSX */}
        <div className="col-md-5 main-content">
          <h3 className="mt-3 mb-3">Add Group</h3>
          <form className="input-group mb-3" onSubmit={handleAddGroup}>
            <input
              type="text"
              className="form-control"
              value={groupToAdd}
              onChange={(e) => setGroupToAdd(e.target.value)}
              placeholder="Enter group name"
              required
            />
            <div className="input-group-append">
              <button className="btn btn-outline-primary" type="submit">
                Create Group
              </button>
            </div>
          </form>
          <h3 className="mt-3 mb-3">Groups</h3>
          <div className="list-group">
            {groups.map((group) => (
              <div
                key={group.id}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="d-flex w-100 justify-content-between mb-2">
                    <h5 style={{ fontWeight: "bold", color: "#333" }}>{group.name}</h5>
                  </div>
                  <form className="d-flex align-items-center" onSubmit={(e) => {
                    e.preventDefault();
                    handleChangeGroupName(group.id);
                  }} style={{ gap: "10px", marginBottom: "10px" }}> {/* Added gap for spacing */}
                    <input
                      type="text"
                      placeholder="New group name"
                      className="form-control form-control-sm" // Use form-control-sm for smaller input
                      style={{ maxWidth: "200px" }} // Limit input width
                      value={newGroupName[group.id] || ""}
                      onChange={(e) => setNewGroupName({ ...newGroupName, [group.id]: e.target.value })}
                    />
                    <button type="submit" className="btn btn-primary btn-sm">Edit</button>
                  </form>
                  <ul className="list-unstyled">
                    {group.members.map((member) => (
                      <li
                        key={member.id}
                        className="d-flex justify-content-between align-items-center mb-2"
                      >
                        <span className="flex-grow-1">{member.username}</span>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveMemberFromGroup(group.id, member.username)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="btn btn-warning btn-sm my-2"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    Delete Group
                  </button>
                  <form onSubmit={(e) => handleAddMemberToGroup(e, group.id)}>
                    <select
                      value={selectedUserToAdd[group.id] || ""}
                      onChange={(e) => setSelectedUserToAdd({ ...selectedUserToAdd, [group.id]: e.target.value })}
                      required
                    >
                      <option value="">Select User</option>
                      {contacts.map((contact) => (
                          <option key={contact.contact_username} value={contact.contact_username}>
                            {contact.contact_username}
                          </option>
                      ))}
                    </select>
                    <button type="submit" style={{ marginLeft: "5px" }}>Add Member</button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {errorGroups && (
            <div className="alert alert-danger">{errorGroups}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contacts;
