// ai-ticket-frontend/src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Navbar from "./components/navbar.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CheckAuth from "./components/check-auth.jsx";
import AuthRedirector from "./components/AuthRedirector.jsx"; // NEW: Import AuthRedirector
import Tickets from "./pages/tickets.jsx";
import TicketDetailsPage from "./pages/ticket.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Admin from "./pages/admin.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <Navbar /> {/* <<< RENDER NAVBAR HERE */}
      <Routes>
        <Route
          path="/"
          element={<AuthRedirector />} // This is correct for the initial redirector
        />
        <Route
          path="/tickets" // This is where the main app content lives
          element={
            <CheckAuth protectedRoute={true}>
              <Tickets />
            </CheckAuth>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <CheckAuth protectedRoute={true}>
              <TicketDetailsPage />
            </CheckAuth>
          }
        />
        <Route
          path="/login"
          element={
            <CheckAuth protectedRoute={false}>
              <Login />
            </CheckAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <CheckAuth protectedRoute={false}>
              <Signup />
            </CheckAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <CheckAuth protectedRoute={true}>
              <Admin />
            </CheckAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);