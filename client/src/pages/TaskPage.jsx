import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import { getStoredUser } from "../utils/authStorage.js";

const blankTask = {
  title: "",
  description: "",
  event: "",
  volunteer: ""
};

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [form, setForm] = useState(blankTask);
  const user = getStoredUser();
  const isAdmin = user.role === "admin";

  function loadTasks() {
    api.get("/tasks").then(({ data }) => setTasks(data));
  }

  useEffect(() => {
    loadTasks();
    api.get("/events").then(({ data }) => setEvents(data));
    if (isAdmin) api.get("/volunteers?status=approved").then(({ data }) => setVolunteers(data));
  }, [isAdmin]);

  async function createTask(event) {
    event.preventDefault();
    await api.post("/tasks", form);
    setForm(blankTask);
    loadTasks();
  }

  async function updateStatus(task, status) {
    await api.put(`/tasks/${task._id}`, { status });
    loadTasks();
  }

  return (
    <section className="content-area split-layout">
      <div>
        <div className="section-heading">
          <p className="eyebrow">Tasks</p>
          <h2>{isAdmin ? "Assignments" : "Your assignments"}</h2>
        </div>
        <div className="list">
          {tasks.map((task) => (
            <article key={task._id} className="list-row">
              <div>
                <strong>{task.title}</strong>
                <span>{task.event?.title} · {task.volunteer?.name || "You"}</span>
                <p>{task.description}</p>
              </div>
              <select value={task.status} onChange={(event) => updateStatus(task, event.target.value)}>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </article>
          ))}
        </div>
      </div>
      {isAdmin && (
        <form className="tool-panel" onSubmit={createTask}>
          <h3>Assign task</h3>
          <input placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <select value={form.event} onChange={(event) => setForm({ ...form, event: event.target.value })} required>
            <option value="">Select event</option>
            {events.map((eventItem) => (
              <option key={eventItem._id} value={eventItem._id}>{eventItem.title}</option>
            ))}
          </select>
          <select value={form.volunteer} onChange={(event) => setForm({ ...form, volunteer: event.target.value })} required>
            <option value="">Select volunteer</option>
            {volunteers.map((volunteer) => (
              <option key={volunteer._id} value={volunteer._id}>{volunteer.name}</option>
            ))}
          </select>
          <button className="primary-button" type="submit">Assign</button>
        </form>
      )}
    </section>
  );
}
