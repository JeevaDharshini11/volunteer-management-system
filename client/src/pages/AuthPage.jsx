import React, { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "volunteer",
  skills: "",
  availability: "",
  experience: ""
};

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      const payload =
        mode === "register"
          ? {
              ...form,
              skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
              availability: form.availability.split(",").map((item) => item.trim()).filter(Boolean)
            }
          : { email: form.email, password: form.password };
      const { data } = await api.post(`/auth/${mode}`, payload);
      localStorage.setItem("volunteer_token", data.token);
      localStorage.setItem("volunteer_user", JSON.stringify(data.user));
      navigate(data.user.role === "admin" ? "/admin" : "/volunteer");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to complete request");
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <div className="brand-mark">
          <HeartHandshake size={28} />
        </div>
        <h1>Volunteer Management System</h1>
        <form onSubmit={submit}>
          <div className="segmented">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
              Login
            </button>
            <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">
              Register
            </button>
          </div>

          {mode === "register" && (
            <>
              <input placeholder="Full name" value={form.name} onChange={(event) => update("name", event.target.value)} required />
              <input placeholder="Phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            </>
          )}
          <input placeholder="Email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
          <input placeholder="Password" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required />
          {mode === "register" && (
            <>
              <select value={form.role} onChange={(event) => update("role", event.target.value)}>
                <option value="volunteer">Volunteer</option>
                <option value="admin">Admin</option>
              </select>
              <input placeholder="Skills, comma separated" value={form.skills} onChange={(event) => update("skills", event.target.value)} />
              <input placeholder="Availability, comma separated" value={form.availability} onChange={(event) => update("availability", event.target.value)} />
              <textarea placeholder="Experience" value={form.experience} onChange={(event) => update("experience", event.target.value)} />
            </>
          )}
          {error && <p className="error">{error}</p>}
          <button className="primary-button" type="submit">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
