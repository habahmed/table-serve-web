import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user authentication here, e.g. localStorage.clear()
    localStorage.clear();

    // Redirect to login page
    navigate("/login");
  }, [navigate]);

  return null; // no UI needed here
};

export default Logout;
