"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const Joyride = dynamic<any>(() => import("react-joyride").then(mod => mod.Joyride), { ssr: false });

export function OnboardingTour() {
  const [run, setRun] = useState(false);
  const { theme } = useTheme();

  const steps = [
    {
      target: "body",
      content: "Welcome to your Dineo Dashboard! Let's take a quick tour to get your QR menu up and running.",
      placement: "center" as const,
    },
    {
      target: "#tour-restaurant",
      content: "First things first, make sure your restaurant details and logo are set up here.",
      placement: "right" as const,
    },
    {
      target: "#tour-categories",
      content: "Next, create Categories for your menu (e.g., Starters, Mains, Drinks).",
      placement: "right" as const,
    },
    {
      target: "#tour-menu",
      content: "Then, add your delicious Menu Items to those categories.",
      placement: "right" as const,
    },
    {
      target: "#tour-qr-code",
      content: "Once your menu is ready, come here to download your beautiful QR Code poster!",
      placement: "right" as const,
    },
    {
      target: "#tour-qr-kit",
      content: "Want professional physical NFC standees for your tables? Request a QR Kit here.",
      placement: "right" as const,
    },
  ];

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem("dineo_tour_completed");
    
    if (!hasCompletedTour) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses = ["finished", "skipped"];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem("dineo_tour_completed", "true");
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#f97316",
          textColor: theme === "dark" ? "#f8fafc" : "#0f172a",
          backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
          arrowColor: theme === "dark" ? "#1e293b" : "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
        buttonNext: {
          borderRadius: "8px",
          fontWeight: 600,
          padding: "8px 16px",
        },
        buttonBack: {
          marginRight: "10px",
          color: theme === "dark" ? "#94a3b8" : "#64748b",
        },
        buttonSkip: {
          color: theme === "dark" ? "#94a3b8" : "#64748b",
          fontWeight: 500,
        },
      }}
    />
  );
}
