// src/models/Cita.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

interface ICita extends Document {
    pacienteId: mongoose.Types.ObjectId;
    fecha: Date;
    hora: string;
    notas?: string;
}

const CitaSchema: Schema<ICita> = new mongoose.Schema({
    pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
    fecha: { type: Date, required: true },
    hora: { type: String, required: true },
    notas: { type: String, default: '' }, 
});

const Cita: Model<ICita> = mongoose.models.Cita || mongoose.model<ICita>('Cita', CitaSchema);

export default Cita;
export type { ICita };
