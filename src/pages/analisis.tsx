import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primeicons/primeicons.css";

interface Paciente {
    _id: string;
    nombre: string;
}

const Analisis = () => {
    const [prediction, setPrediction] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
    const [guardarImagen, setGuardarImagen] = useState(false);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        // Fetch list of patients
        async function fetchPacientes() {
            try {
                const response = await axios.get("/api/pacientes");
                setPacientes(response.data);
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        }
        fetchPacientes();
    }, []);

    const handleFileUpload = async (event: any) => {
        const file = event.files?.[0];
        if (!file) {
            toast.current?.show({ severity: "warn", summary: "Warning", detail: "Please select a file.", life: 3000 });
            return;
        }

        setSelectedFile(file);
        setPreviewImage(URL.createObjectURL(file));
        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setPrediction(null);

        try {
            const response = await axios.post("http://127.0.0.1:8000/analysis/predict", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setPrediction(response.data.prediction);
            setGuardarImagen(true);
            toast.current?.show({ severity: "success", summary: "Success", detail: "Image analyzed successfully.", life: 3000 });
        } catch (error) {
            console.error("Error analyzing image:", error);
            setPrediction("Error analyzing the image");
            toast.current?.show({ severity: "error", summary: "Error", detail: "Image analysis failed.", life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const handleGuardarImagen = async () => {
        if (!selectedPaciente || !selectedFile) {
            toast.current?.show({ severity: "warn", summary: "Warning", detail: "Please select a file and a patient.", life: 3000 });
            return;
        }
    
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("nombre", selectedPaciente.nombre);
        formData.append("paciente_id", selectedPaciente._id);
    
        setLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:8000/images/upload_image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.current?.show({ severity: "success", summary: "Image Saved", detail: response.data.message, life: 3000 });
        } catch (error) {
            console.error("Error saving image:", error);
            toast.current?.show({ severity: "error", summary: "Error", detail: "Image save failed.", life: 3000 });
        } finally {
            setLoading(false);
            setGuardarImagen(false);
        }
    };
    
    return (
        <div className="flex flex-col items-center min-h-screen p-8 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Toast ref={toast} />
            <div className="w-full max-w-4xl space-y-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Image Analysis</h1>
                </header>

                <div className="flex-1 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex flex-col items-center">
                    <h2 className="text-2xl font-semibold mb-4">Upload and Analyze Image</h2>

                    <FileUpload
                        mode="basic"
                        name="file"
                        accept="image/*"
                        maxFileSize={1000000}
                        auto
                        customUpload
                        uploadHandler={handleFileUpload}
                        chooseLabel="Select Image"
                        className="mb-4"
                    />

                    {previewImage && (
                        <img src={previewImage} alt="Selected" className="w-full h-40 object-cover rounded-md mb-4" />
                    )}

                    {loading && (
                        <div className="flex justify-center items-center mt-4">
                            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="5" />
                        </div>
                    )}

                    {prediction && <p className="text-lg font-semibold text-green-600 text-center mt-4">{`Result: ${prediction}`}</p>}

                    {guardarImagen && (
                        <div className="mt-4 w-full">
                            <h3 className="text-xl font-semibold mb-2">Do you want to save the image?</h3>
                            <Dropdown
                                value={selectedPaciente}
                                onChange={(e) => setSelectedPaciente(e.value)}
                                options={pacientes}
                                optionLabel="nombre"
                                placeholder="Select a patient"
                                className="w-full mb-4"
                            />
                            <Button
                                label="Save Image"
                                icon="pi pi-save"
                                className="p-button-success w-full"
                                onClick={handleGuardarImagen}
                                disabled={!selectedPaciente || loading}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analisis;
