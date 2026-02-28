import { createContext, useContext, useState } from "react";

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [showSettings, setShowSettings] = useState(false);  //settings button

  return (
    <SettingsContext.Provider value={{ showSettings, setShowSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  /*
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  */
  return ctx;
};