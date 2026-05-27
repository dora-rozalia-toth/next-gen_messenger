import { createContext, useContext, useEffect, useState } from "react";

interface MessengerContextValue {
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
}

const MessengerContext = createContext<MessengerContextValue | null>(null);

export function useMessenger() {
  const ctx = useContext(MessengerContext);
  if (!ctx) throw new Error("useMessenger must be inside MessengerProvider");
  return ctx;
}

export function MessengerProvider({ children }: { children: React.ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(false);

  const openPanel = () => {
    setPanelOpen(true);
    document.dispatchEvent(new CustomEvent("messenger-panel-opening"));
  };
  const closePanel = () => setPanelOpen(false);
  const togglePanel = () => {
    setPanelOpen((v) => {
      if (!v) document.dispatchEvent(new CustomEvent("messenger-panel-opening"));
      return !v;
    });
  };

  useEffect(() => {
    const handler = () => {
      setPanelOpen((v) => {
        if (!v) document.dispatchEvent(new CustomEvent("messenger-panel-opening"));
        return !v;
      });
    };
    document.addEventListener("messenger-toggle", handler);
    return () => document.removeEventListener("messenger-toggle", handler);
  }, []);

  useEffect(() => {
    const handler = () => setPanelOpen(false);
    document.addEventListener("smart-assist-opening", handler);
    return () => document.removeEventListener("smart-assist-opening", handler);
  }, []);

  return (
    <MessengerContext.Provider value={{ panelOpen, openPanel, closePanel, togglePanel }}>
      {children}
    </MessengerContext.Provider>
  );
}
