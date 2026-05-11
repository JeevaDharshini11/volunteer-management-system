import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import { getStoredUser } from "../utils/authStorage.js";

const blankEvent = {
  title: "",
  description: "",
  date: "",
  location: "",
  requiredVolunteers: 1
};

export default function EventPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(blankEvent);
  const user = getStoredUser();
  const isAdmin = user.role === "admin";

  function loadEvents() {
    api.get("/events").then(({ data }) => setEvents(data));
  }

  useEffect(loadEvents, []);

  async function createEvent(event) {
    event.preventDefault();
    await api.post("/events", form);
    setForm(blankEvent);
    loadEvents();
  }

  async function toggleRegistration(eventItem) {
    const registered = eventItem.registeredVolunteers.some((volunteer) => volunteer._id === user._id);
    await api.post(`/events/${eventItem._id}/${registered ? "cancel" : "register"}`);
    loadEvents();
  }

  return (
    <section className="content-area split-layout">
      <div>
        <div className="section-heading">
          <p className="eyebrow">Events</p>
          <h2>Upcoming opportunities</h2>
        </div>
        <div className="list">
          {events.map((eventItem) => {
            const registered = eventItem.registeredVolunteers.some((volunteer) => volunteer._id === user._id);
            return (
              <article key={eventItem._id} className="list-row event-row">
                <div>
                  <strong>{eventItem.title}</strong>
                  <span>{new Date(eventItem.date).toLocaleString()} · {eventItem.location}</span>
                  <p>{eventItem.description}</p>
                </div>
                {!isAdmin && (
                  <button className={registered ? "ghost-button compact" : "primary-button compact"} onClick={() => toggleRegistration(eventItem)} type="button">
                    {registered ? "Cancel" : "Register"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
      {isAdmin && (
        <form className="tool-panel" onSubmit={createEvent}>
          <h3>Create event</h3>
          <input placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
          <input type="datetime-local" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
          <input placeholder="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} required />
          <input min="1" type="number" value={form.requiredVolunteers} onChange={(event) => setForm({ ...form, requiredVolunteers: event.target.value })} required />
          <button className="primary-button" type="submit">Create</button>
        </form>
      )}
    </section>
  );
}
