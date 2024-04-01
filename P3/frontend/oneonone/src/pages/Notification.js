import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar"; // Adjust the import path as necessary

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(
        "http://127.0.0.1:8000/api/account/notifications/",
        config
      );
      setNotifications(response.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setError("Failed to load notifications.");
    }
  };

  const fetchNotificationById = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(
        `http://127.0.0.1:8000/api/account/notifications/${notificationId}/`,
        config
      );

      setSelectedNotification(response.data); // Store the detailed notification data
      fetchNotifications(); // Refresh to get the updated 'is_seen' status for all notifications
    } catch (err) {
      console.error("Failed to fetch notification details", err);
      setError("Failed to load notification details.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar /> 
        <div className="col-md-10 main-content pt-4">
          <h2>Notifications</h2>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => fetchNotificationById(notification.id)}
                className={`notification-block mb-3 mt-3 card ${
                  notification.is_seen ? "green-color" : "bg-light"
                }`}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body">
                  <h5 className="card-title font-weight-bold">
                    {notification.title}
                  </h5>
                  <p className="card-text">{notification.message}</p>
                </div>
                {selectedNotification &&
                  selectedNotification.id === notification.id && (
                    <div className="card-footer">
                      {selectedNotification.content}
                    </div>
                  )}
              </div>
            ))
          ) : (
            <p>No active notifications</p>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
