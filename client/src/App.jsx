import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import EventPage from "./pages/EventPage.jsx";
import TaskPage from "./pages/TaskPage.jsx";
import VolunteerDashboard from "./pages/VolunteerDashboard.jsx";
import VolunteersPage from "./pages/VolunteersPage.jsx";
import { getStoredUser } from "./utils/authStorage.js";

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeRedirect />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="volunteer" element={<VolunteerDashboard />} />
        <Route path="events" element={<EventPage />} />
        <Route path="tasks" element={<TaskPage />} />
        <Route path="volunteers" element={<VolunteersPage />} />
      </Route>
    </Routes>
  );
}

function HomeRedirect() {
  const user = getStoredUser();
  return <Navigate to={user.role === "admin" ? "/admin" : "/volunteer"} replace />;
}
