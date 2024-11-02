// src/pages/registrar.tsx
import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    cedula: string;
    direccion: string;
    telefono: string;
}

export default function RegistrarPaciente() {
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        cedula: '',
        direccion: '',
        telefono: ''
    });

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files![0];
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result;
            try {
                const response = await axios.post('/api/upload', { imageBase64: base64Image });
                const { nombre, apellido, fechaNacimiento, cedula } = response.data;

                if (nombre && apellido && fechaNacimiento && cedula) {
                    setFormData({
                        ...formData,
                        nombre,
                        apellido,
                        fechaNacimiento,
                        cedula
                    });
                    toast.success('Imagen procesada y datos extraídos exitosamente');
                } else {
                    toast.error('No se encontraron todos los datos requeridos en la imagen');
                }
            } catch (error) {
                toast.error('Error al procesar la imagen');
                console.error('Error al procesar la imagen con Azure:', error);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (!formData.nombre || !formData.apellido || !formData.fechaNacimiento || !formData.cedula) {
                toast.error("Por favor, completa todos los campos obligatorios");
                return;
            }
            await axios.post('/api/pacientes', formData);
            toast.success('Paciente registrado con éxito');
            setFormData({ nombre: '', apellido: '', fechaNacimiento: '', cedula: '', direccion: '', telefono: '' });
        } catch (error) {
            toast.error('Error al registrar el paciente');
            console.error('Error al registrar paciente:', error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <ToastContainer />
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded-lg p-8 w-full max-w-md space-y-6"
            >
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Registrar Paciente</h2>
                <div className="space-y-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600">Subir Imagen</label>
                        <input
                            type="file"
                            onChange={handleImageUpload}
                            className="border rounded-md p-2 mt-1"
                        />
                    </div>
                    {/* Campos de entrada para los datos */}
                    <input type="text" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="border rounded-md p-2 mt-1"/>
                    <input type="text" placeholder="Apellido" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} className="border rounded-md p-2 mt-1"/>
                    <input type="date" placeholder="Fecha de Nacimiento" value={formData.fechaNacimiento} onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })} className="border rounded-md p-2 mt-1"/>
                    <input type="text" placeholder="Cédula" value={formData.cedula} onChange={(e) => setFormData({ ...formData, cedula: e.target.value })} className="border rounded-md p-2 mt-1"/>
                    <input type="text" placeholder="Dirección" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} className="border rounded-md p-2 mt-1"/>
                    <input type="text" placeholder="Teléfono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="border rounded-md p-2 mt-1"/>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition-colors">
                    Registrar Paciente
                </button>
            </form>
        </div>
    );
}
