import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

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
      setError("Failed to load contacts.");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

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
      setError("");
      fetchContacts();
    } catch (err) {
      console.error("Failed to add contact:", err);
      setError("Failed to add contact. Please check the username.");
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
      console.error("Failed to delete contact:", err);
      setError("Failed to delete contact.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />
        <div className="col-md-10">
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
                  </strong>{" "}
                  - {contact.contact_email}
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

          {error && <div className="alert alert-danger">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default Contacts;
