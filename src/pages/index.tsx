// src/pages/index.tsx
import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrar los elementos necesarios para Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Home = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [language, setLanguage] = useState("es");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("/api/citas");
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(
          language === "es"
            ? "No hay conexión con la base de datos. Intenta nuevamente más tarde."
            : "No connection to the database. Please try again later."
        );
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setPrediction(null);
    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPrediction(response.data.result);
    } catch (error) {
      console.error("Error analyzing document:", error);
      setPrediction(
        language === "es" ? "Error al analizar el documento" : "Error analyzing the document"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {language === "es" ? "Panel de Control de Citas" : "Appointments Dashboard"}
          </h1>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-200 dark:bg-gray-800 rounded px-2 py-1 text-gray-800 dark:text-gray-200"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sección del Gráfico */}
          <div className="flex-1 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              {language === "es" ? "Estadísticas de Citas" : "Appointments Statistics"}
            </h2>
            <div className="w-full h-64">
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
            {error && (
              <div className="mt-4 bg-red-100 text-red-800 p-4 rounded text-center">
                {error}
              </div>
            )}
          </div>

          {/* Sección de Carga y Análisis de Imágenes */}
          <div className="flex-1 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">
              {language === "es" ? "Análisis de Documentos" : "Document Analysis"}
            </h2>
            <label className="w-full text-center cursor-pointer">
              <span className="block mb-2 text-lg font-medium">
                {language === "es" ? "Subir Imagen" : "Upload Image"}
              </span>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="relative border-2 border-dashed rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-40 object-cover rounded-md"
                  />
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-12">
                    {language === "es" ? "Ninguna imagen seleccionada" : "No image selected"}
                  </div>
                )}
              </div>
            </label>

            {/* Barra de progreso circular */}
            {loading && (
              <div className="loader mt-4">
                <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}

            {/* Resultado de la Predicción */}
            {prediction && (
              <p className="text-lg font-semibold text-green-600 text-center mt-4">
                {language === "es" ? `Resultado: ${prediction}` : `Result: ${prediction}`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
