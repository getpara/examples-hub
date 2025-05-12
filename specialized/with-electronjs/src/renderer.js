import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ParaWeb, Environment, ParaModal } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import "./index.css";

const PARA_API_KEY = "YOUR_API_KEY";
const PARA_ENVIRONMENT = Environment.BETA;

const para = new ParaWeb(PARA_ENVIRONMENT, PARA_API_KEY);

const ParaApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const loggedIn = await para.isFullyLoggedIn();
    setIsLoggedIn(loggedIn);
  };

  const handleOpenModal = () => setIsOpen(true);

  const handleCloseModal = () => {
    setIsOpen(false);
    checkLoginStatus();
  };

  const handleLogout = async () => {
    await para.logout();
    setIsLoggedIn(false);
  };

  return (
    <div className="container">
      <h1 className="title">Welcome to Para Demo</h1>
      {isLoggedIn ? (
        <div>
          <p className="text">You are successfully logged in!</p>
          <button
            onClick={handleLogout}
            className="button">
            Log Out
          </button>
        </div>
      ) : (
        <div>
          <p className="text">Click the button below to sign in with Para.</p>
          <button
            onClick={handleOpenModal}
            className="button">
            Sign in with Para
          </button>
        </div>
      )}
      <ParaModal
        para={para}
        isOpen={isOpen}
        onClose={handleCloseModal}
        appName="Para Demo App"
      />
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<ParaApp />);
