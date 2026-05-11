import React from "react";

export default function StatCard({ label, value }) {
  return (
    <section className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}
