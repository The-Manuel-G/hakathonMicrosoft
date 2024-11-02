// src/pages/api/pacientes.ts
import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../lib/mongodb';
import Paciente, { IPaciente } from '../../models/Paciente';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectToDatabase();

        if (req.method === 'POST') {
            const { nombre, apellido, fechaNacimiento, cedula, direccion, telefono } = req.body;
            
            // Validar si el paciente ya existe usando la cédula
            const existingPaciente = await Paciente.findOne({ cedula });
            if (existingPaciente) {
                return res.status(409).json({ message: "El paciente con esta cédula ya existe" });
            }

            // Crear y guardar un nuevo paciente
            const newPaciente: IPaciente = new Paciente({
                nombre,
                apellido,
                fechaNacimiento,
                cedula,
                direccion,
                telefono,
            });
            await newPaciente.save();
            return res.status(201).json(newPaciente);
        } 
        
        if (req.method === 'GET') {
            const pacientes = await Paciente.find();
            return res.status(200).json(pacientes);
        }
        
        return res.status(405).json({ message: "Método no permitido" });
        
    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}
