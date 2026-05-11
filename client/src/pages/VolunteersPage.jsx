import React, { useEffect, useState } from "react";
import api from "../api/client.js";

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [filters, setFilters] = useState({ skill: "", availability: "", status: "" });

  function loadVolunteers() {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    api.get(`/volunteers?${params.toString()}`).then(({ data }) => setVolunteers(data));
  }

  useEffect(loadVolunteers, []);

  async function updateStatus(volunteer, status) {
    await api.put(`/volunteers/${volunteer._id}/status`, { status });
    loadVolunteers();
  }

  return (
    <section className="content-area">
      <div className="section-heading">
        <p className="eyebrow">People</p>
        <h2>Volunteer directory</h2>
      </div>
      <div className="filters">
        <input placeholder="Skill" value={filters.skill} onChange={(event) => setFilters({ ...filters, skill: event.target.value })} />
        <input placeholder="Availability" value={filters.availability} onChange={(event) => setFilters({ ...filters, availability: event.target.value })} />
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="">Any status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="primary-button compact" onClick={loadVolunteers} type="button">Search</button>
      </div>
      <div className="list">
        {volunteers.map((volunteer) => (
          <article key={volunteer._id} className="list-row">
            <div>
              <strong>{volunteer.name}</strong>
              <span>{volunteer.email} · {volunteer.phone || "No phone"}</span>
              <p>{volunteer.skills?.join(", ") || "No skills listed"}</p>
            </div>
            <select value={volunteer.status} onChange={(event) => updateStatus(volunteer, event.target.value)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </article>
        ))}
      </div>
    </section>
  );
}
