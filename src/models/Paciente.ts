import mongoose, { Document, Model, Schema } from 'mongoose';

interface IPaciente extends Document {
    nombre: string;
    apellido: string;
    fechaNacimiento: Date;
    cedula: string;
    direccion?: string; // Opcional si no es obligatorio
    telefono?: string;  // Opcional si no es obligatorio
}

const PacienteSchema: Schema<IPaciente> = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    cedula: { type: String, required: true, unique: true },
    direccion: { type: String, default: '' }, // Valor predeterminado si no se proporciona
    telefono: { type: String, default: '' },  // Valor predeterminado si no se proporciona
});

// Define o reutiliza el modelo 'Paciente'
const Paciente: Model<IPaciente> = mongoose.models.Paciente || mongoose.model<IPaciente>('Paciente', PacienteSchema);

export default Paciente;
export type { IPaciente };
