import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Onboarding from "../pages/Onboarding.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import MapView from "../pages/MapView.jsx";
import Itinerary from "../pages/Itinerary.jsx";
import Attractions from "../pages/Attractions.jsx";
import Tournament from "../pages/Tournament.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/attractions" element={<Attractions />} />
        <Route path="/tournament" element={<Tournament />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
