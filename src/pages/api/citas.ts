// src/pages/api/citas.ts
import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../lib/mongodb';
import Cita, { ICita } from '../../models/Cita';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDatabase();

    try {
        if (req.method === 'POST') {
            const { pacienteId, fecha, hora, notas } = req.body;

            const newCita: ICita = new Cita({
                pacienteId,
                fecha,
                hora,
                notas,
            });

            await newCita.save();
            return res.status(201).json(newCita);
        } 
        
        if (req.method === 'GET') {
            // Poblar los datos de paciente en cada cita
            const citas = await Cita.find().populate('pacienteId');
            return res.status(200).json(citas);
        }
        
        return res.status(405).json({ message: "Método no permitido" });
    } catch (error) {
        console.error("Error en la API de citas:", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}
