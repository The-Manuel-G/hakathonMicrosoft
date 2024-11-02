// src/components/Sidebar.tsx
import { useContext } from "react";
import { GiRobotLeg } from "react-icons/gi";
import { FaUserMd, FaHome, FaChartPie, FaRobot } from "react-icons/fa";
import { AiOutlineLeft } from "react-icons/ai";
import { MdLogout } from "react-icons/md";
import Link from "next/link";
import { ThemeContext } from "../contexts/ThemeProvider";
import { useLanguage } from "../contexts/LanguageContext";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface LinkItem {
  label: string;
  icon: JSX.Element;
  to: string;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const themeContext = useContext(ThemeContext);
  const { language, setLanguage } = useLanguage();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    themeContext?.setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-gray-800 h-screen flex flex-col justify-between p-4 fixed`}>
      <button onClick={toggleSidebar} className="text-white text-2xl hover:text-gray-400 mb-4">
        <AiOutlineLeft className={`${sidebarOpen ? "" : "rotate-180"} transition-transform`} />
      </button>
      <div className="flex items-center space-x-2 mb-8">
        {sidebarOpen && <h2 className="text-white text-lg font-bold"></h2>}
      </div>
      <div className="flex-grow space-y-4">
        {linksArray.map(({ icon, label, to }) => (
          <Link href={to} key={label} className="flex items-center space-x-3 text-white p-2 rounded-md hover:bg-gray-700">
            <div className="text-xl">{icon}</div>
            {sidebarOpen && <span className="text-sm">{label}</span>}
          </Link>
        ))}
      </div>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-gray-800 text-white mt-4 p-2 rounded-md"
      >
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>
      <button onClick={toggleTheme} className="text-white mt-4">
        {themeContext?.theme === "light" ? "🌞" : "🌜"}
      </button>
    </div>
  );
}

// Nuevo array de links con los cambios solicitados
const linksArray: LinkItem[] = [
  { label: "Home", icon: <FaHome />, to: "/" },
  { label: "Pacientes", icon: <GiRobotLeg />, to: "/pacientes" },
  { label: "Reportes", icon: <FaChartPie />, to: "/reportes" },
  { label: "Chat Bot", icon: <FaRobot />, to: "/chatbot" },
  { label: "Análisis", icon: <FaUserMd />, to: "/analisis" },
];
