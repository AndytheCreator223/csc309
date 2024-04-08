import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

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
        "https://oneonone-backend.onrender.com/api/account/notifications/",
        config
      );
      setNotifications(response.data);
      setError("");
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
        `https://oneonone-backend.onrender.com/api/account/notifications/${notificationId}/`,
        config
      );

      setSelectedNotification(response.data); // Store the detailed notification data
      console.log(selectedNotification)
      fetchNotifications(); // Refresh to get the updated 'is_seen' status for all notifications
      setError("");
    } catch (err) {
      console.error("Failed to fetch notification details", err);
      setError("Failed to load notification details.");
    }
  };

  const markAllAsSeen = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post(
        "https://oneonone-backend.onrender.com/api/account/notifications/mark-all-seen/",
        {}, // No data needed for this request
        config
      );
      fetchNotifications(); // Refresh notifications to reflect the changes
      setError("");
    } catch (err) {
      console.error("Failed to mark all notifications as seen", err);
      setError("Failed to mark all notifications as seen");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(
        `https://oneonone-backend.onrender.com/api/account/notifications/delete/${notificationId}/`,
        config
      );
      // After deletion, refresh the notifications list
      fetchNotifications();
      setError("");
    } catch (err) {
      console.error("Failed to delete notification", err);
      setError("Failed to delete notification.");
    }
  };

  const deleteReadNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post(
        "https://oneonone-backend.onrender.com/api/account/notifications/delete-read/",
        {}, // No data needed for this request
        config
      );
      fetchNotifications(); // Refresh notifications to reflect the changes
      setError("");
    } catch (err) {
      console.error("Failed to delete read notifications", err);
      setError("Failed to delete read notifications.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />
        <div className="col-md-10 main-content pt-4">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Notifications</h2>
            <div>
              <button onClick={markAllAsSeen} className="btn btn-primary me-2">Read All Notifications</button>
              <button onClick={deleteReadNotifications} className="btn btn-danger">Delete All Read Notifications</button>
            </div>
          </div>
          {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-block mb-3 mt-3 card ${notification.is_seen ? "bg-light" : "bg-warning"}`}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <div className="card-body" onClick={() => fetchNotificationById(notification.id)}>
                <h5 className="card-title font-weight-bold">{notification.title}</h5>
                <p className="card-text">{notification.message}</p>
              </div>
              {notification.is_seen && (
                <button
                  className="btn btn-danger"
                  style={{ position: "absolute", top: "10px", right: "10px" }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the notification's onClick
                    deleteNotification(notification.id);
                  }}
                >
                  Delete
                </button>
              )}
            {selectedNotification && selectedNotification.id === notification.id && (
              <div className="card-footer">{selectedNotification.content}</div>
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
