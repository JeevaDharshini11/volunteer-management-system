import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import StatCard from "../components/StatCard.jsx";
import { getStoredUser } from "../utils/authStorage.js";

export default function VolunteerDashboard() {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/events"), api.get("/tasks")]).then(([eventsResponse, tasksResponse]) => {
      const user = getStoredUser();
      setEvents(eventsResponse.data.filter((event) => event.registeredVolunteers.some((volunteer) => volunteer._id === user._id)));
      setTasks(tasksResponse.data);
    });
  }, []);

  return (
    <section className="content-area">
      <div className="section-heading">
        <p className="eyebrow">Dashboard</p>
        <h2>Your volunteering plan</h2>
      </div>
      <div className="stat-grid">
        <StatCard label="Registered events" value={events.length} />
        <StatCard label="Assigned tasks" value={tasks.length} />
        <StatCard label="Completed tasks" value={tasks.filter((task) => task.status === "completed").length} />
      </div>
      <div className="list">
        {tasks.map((task) => (
          <article key={task._id} className="list-row">
            <div>
              <strong>{task.title}</strong>
              <span>{task.event?.title}</span>
            </div>
            <span className="status">{task.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
