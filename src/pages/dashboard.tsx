// src/pages/dashboard.tsx
import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = ({ language }: { language: string }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("/api/citas");
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(language === "es" ? "No hay conexión con la base de datos" : "No connection to the database");
      }
    }
    fetchData();
  }, [language]);

  const chartData = {
    labels: data.map((cita) => new Date(cita.fecha).toLocaleDateString()),
    datasets: [
      {
        label: language === "es" ? "Número de Citas" : "Number of Appointments",
        data: data.map((cita) => cita.count),
        backgroundColor: "#4A90E2",
      },
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-8">{language === "es" ? "Panel de Control de Citas" : "Appointments Dashboard"}</h1>
      <div className="w-full max-w-4xl">
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default Dashboard;
