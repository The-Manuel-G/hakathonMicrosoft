// src/contexts/ThemeProvider.tsx
import React, { createContext, useState, ReactNode } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"} min-h-screen`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
