import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import axios from 'axios';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface Paciente {
    _id: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    cedula: string;
    direccion?: string;
    telefono?: string;
}

interface Cita {
    _id?: string;
    paciente: Paciente; // Aseguramos que paciente esté presente
    fecha: string;
    hora: string;
    notas?: string;
}

const Pacientes = () => {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [citas, setCitas] = useState<Cita[]>([]);
    const [showCitaDialog, setShowCitaDialog] = useState(false);
    const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
    const [newCita, setNewCita] = useState({ fecha: '', notas: '' });
    const [hour, setHour] = useState("12");
    const [minute, setMinute] = useState("00");
    const [period, setPeriod] = useState("AM");
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');

    useEffect(() => {
        fetchPacientes();
        fetchCitas();
    }, []);

    const fetchPacientes = async () => {
        try {
            const response = await axios.get('/api/pacientes');
            setPacientes(response.data);
        } catch (error) {
            console.error('Error fetching pacientes:', error);
        }
    };

    const fetchCitas = async () => {
        try {
            const response = await axios.get('/api/citas');
            const citasWithPaciente = response.data.map((cita: Cita) => ({
                ...cita,
                paciente: cita.paciente ? cita.paciente : { nombre: 'Desconocido', apellido: '' }
            }));
            setCitas(citasWithPaciente);
        } catch (error) {
            console.error('Error fetching citas:', error);
        }
    };

    const addCita = async () => {
        if (selectedPaciente && newCita.fecha) {
            const formattedTime = `${hour}:${minute} ${period}`;
            const cita = { ...newCita, hora: formattedTime, pacienteId: selectedPaciente._id };
            try {
                const response = await axios.post('/api/citas', cita);
                setCitas([...citas, response.data]);
                setShowCitaDialog(false);
                setNewCita({ fecha: '', notas: '' });
                setSelectedPaciente(null);
            } catch (error) {
                console.error('Error adding cita:', error);
            }
        }
    };

    const openCitaDialog = (paciente: Paciente) => {
        setSelectedPaciente(paciente);
        setShowCitaDialog(true);
    };

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-4">
            <h4 className="m-0 text-gray-800 dark:text-gray-200">Lista de Pacientes</h4>
            <div className="flex gap-2">
                <Button icon="pi pi-file-excel" onClick={() => exportExcel()} className="p-button-rounded p-button-success" />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={(e) => setGlobalFilterValue(e.target.value)} placeholder="Buscar..." />
                </span>
            </div>
        </div>
    );

    const exportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Pacientes');
        worksheet.columns = [
            { header: 'Nombre', key: 'nombre', width: 20 },
            { header: 'Apellido', key: 'apellido', width: 20 },
            { header: 'Fecha de Nacimiento', key: 'fechaNacimiento', width: 20 },
            { header: 'Cédula', key: 'cedula', width: 15 },
            { header: 'Dirección', key: 'direccion', width: 30 },
            { header: 'Teléfono', key: 'telefono', width: 15 },
        ];
        pacientes.forEach(paciente => worksheet.addRow({ ...paciente }));
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'Pacientes.xlsx');
    };

    // Componente para mostrar las citas en columnas por día de la semana
   // Dentro del componente Pacientes
const DayColumn = ({ day }: { day: string }) => {
    const filteredCitas = citas.filter(cita => 
        new Date(cita.fecha).toLocaleDateString('es-ES', { weekday: 'long' }) === day
    );

    return (
        <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
            <h4 className="text-center mb-4 font-bold text-gray-800 dark:text-gray-200">{day}</h4>
            {filteredCitas.length > 0 ? (
                filteredCitas.map(cita => (
                    <div key={cita._id} className="p-2 mb-2 rounded-lg bg-blue-200 text-gray-800 dark:bg-blue-900 dark:text-gray-200">
                        {cita.pacienteId ? (
                            <>
                                <p><strong>Paciente:</strong> {cita.pacienteId.nombre} {cita.pacienteId.apellido}</p>
                                <p className="text-yellow-600 dark:text-yellow-300"><strong>Hora:</strong> {cita.hora}</p>
                                <p><strong>Notas:</strong> {cita.notas || 'No hay notas'}</p>
                            </>
                        ) : (
                            <p className="text-red-500">Datos de paciente no disponibles</p>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500">Sin citas</p>
            )}
        </div>
    );
};


    return (
        <DndProvider backend={HTML5Backend}>
            <div className="card p-4 mt-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
                <DataTable value={pacientes} paginator header={renderHeader()} rows={10} dataKey="_id">
                    <Column field="nombre" header="Nombre" sortable />
                    <Column field="apellido" header="Apellido" sortable />
                    <Column field="cedula" header="Cédula" sortable />
                    <Column field="fechaNacimiento" header="Fecha de Nacimiento" body={(rowData) => new Date(rowData.fechaNacimiento).toLocaleDateString()} sortable />
                    <Column field="telefono" header="Teléfono" sortable />
                    <Column field="direccion" header="Dirección" sortable />
                    <Column header="Cita" body={(rowData) => <Button label="Cita" onClick={() => openCitaDialog(rowData)} />} />
                </DataTable>

                <Dialog visible={showCitaDialog} onHide={() => setShowCitaDialog(false)} header="Agregar Cita" style={{ width: '400px' }}>
                    <div className="p-field">
                        <label>Fecha</label>
                        <Calendar value={newCita.fecha} onChange={(e) => setNewCita({ ...newCita, fecha: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div className="p-field">
                        <label>Hora</label>
                        <div className="flex gap-2">
                            <select value={hour} onChange={(e) => setHour(e.target.value)} className="border border-gray-300 rounded px-2 py-1">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                    <option key={h} value={h < 10 ? `0${h}` : h}>{h < 10 ? `0${h}` : h}</option>
                                ))}
                            </select>
                            <select value={minute} onChange={(e) => setMinute(e.target.value)} className="border border-gray-300 rounded px-2 py-1">
                                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                                    <option key={m} value={m < 10 ? `0${m}` : m}>{m < 10 ? `0${m}` : m}</option>
                                ))}
                            </select>
                            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border border-gray-300 rounded px-2 py-1">
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-field">
                        <label>Notas</label>
                        <InputText value={newCita.notas} onChange={(e) => setNewCita({ ...newCita, notas: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <Button label="Guardar" onClick={addCita} className="mt-4 p-button-success" style={{ width: '100%' }} />
                </Dialog>

                {/* Pizarra semanal para mostrar citas por día */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-7 gap-4">
                    {['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map(day => (
                        <DayColumn key={day} day={day} />
                    ))}
                </div>
            </div>
        </DndProvider>
    );
};

export default Pacientes;
