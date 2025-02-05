import React, { useState } from "react";
import OnboardingScreen from "./components/view/onboarding-screen";
import HomeScreen from "./components/view/home-screen";
import TransactionScreen from "./components/view/transaction-screen";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>("onboarding");

  const setScreen = (screen: ScreenName) => {
    setCurrentScreen(screen);
  };

  const screens: Record<ScreenName, JSX.Element> = {
    onboarding: <OnboardingScreen setScreen={setScreen} />,
    home: <HomeScreen setScreen={setScreen} />,
    transaction: <TransactionScreen setScreen={setScreen} />,
  };

  return <div className="relative h-screen w-full max-w-md mx-auto bg-background">{screens[currentScreen]}</div>;
};

export default App;
