import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import StatCard from "../components/StatCard.jsx";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get("/reports/summary").then(({ data }) => setSummary(data));
  }, []);

  return (
    <section className="content-area">
      <div className="section-heading">
        <p className="eyebrow">Overview</p>
        <h2>Organization activity</h2>
      </div>
      <div className="stat-grid">
        <StatCard label="Total volunteers" value={summary?.totalVolunteers ?? 0} />
        <StatCard label="Pending approvals" value={summary?.pendingVolunteers ?? 0} />
        <StatCard label="Active events" value={summary?.activeEvents ?? 0} />
        <StatCard label="Completed tasks" value={summary?.completedTasks ?? 0} />
      </div>
    </section>
  );
}
