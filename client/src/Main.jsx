import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Profile from "./Profile.jsx";
import Requirements from "./Requirements.jsx";
import Previews from "./Previews.jsx";
import Preview from "./Preview.jsx";
import NotFound from "./NotFound.jsx";
import "./style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/previews" element={<Previews />} />
          <Route path="/preview/:id" element={<Preview />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);
