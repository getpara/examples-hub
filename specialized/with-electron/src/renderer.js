import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Capsule, { Environment, CapsuleModal, ConstructorOpts, WalletType } from "@usecapsule/react-sdk";
import "@usecapsule/react-sdk/styles.css";
import "./index.css"; // Make sure to create this file for your styles

// Step 1: Set up your Capsule API key and environment
const CAPSULE_API_KEY = "YOUR_API_KEY";
const CAPSULE_ENVIRONMENT = Environment.BETA;

// Step 2: Define constructor options
const constructorOpts = {
  emailPrimaryColor: "#ff6700",
  githubUrl: "https://github.com/your-github",
  linkedinUrl: "https://www.linkedin.com/company/your-company",
  xUrl: "https://x.com/your-x-handle",
  homepageUrl: "https://your-homepage.com",
  supportUrl: "https://your-support-page.com",
  supportedWalletTypes: [WalletType.SOLANA],
};

// Step 3: Initialize the Capsule client with constructor options
const capsule = new Capsule(CAPSULE_ENVIRONMENT, CAPSULE_API_KEY, constructorOpts);

// Step 4: Create the CapsuleApp component
const CapsuleApp = () => {
  // Step 5: Set up state for modal visibility and user login status
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Step 6: Check user's login status on component mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const loggedIn = await capsule.isFullyLoggedIn();
    setIsLoggedIn(loggedIn);
  };

  // Step 7: Handle modal opening
  const handleOpenModal = () => setIsOpen(true);

  // Step 8: Handle modal closing
  const handleCloseModal = () => {
    setIsOpen(false);
    // Optionally, check login status again here
    checkLoginStatus();
  };

  // Step 9: Handle user logout
  const handleLogout = async () => {
    await capsule.logout();
    setIsLoggedIn(false);
  };

  // Step 10: Render the component
  return (
    <div className="container">
      <h1 className="title">Welcome to Capsule Demo</h1>
      {isLoggedIn ? (
        <div>
          <p className="text">You are successfully logged in!</p>
          <button onClick={handleLogout} className="button">
            Log Out
          </button>
        </div>
      ) : (
        <div>
          <p className="text">Click the button below to sign in with Capsule.</p>
          <button onClick={handleOpenModal} className="button">
            Sign in with Capsule
          </button>
        </div>
      )}
      <CapsuleModal capsule={capsule} isOpen={isOpen} onClose={handleCloseModal} appName="Capsule Demo App" />
    </div>
  );
};

// Step 11: Set up the root renderer
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<CapsuleApp />);
