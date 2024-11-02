// src/pages/api/upload.ts
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { imageBase64 } = req.body;
    const azureEndpoint = process.env.AZURE_CUSTOM_VISION_URL;
    const predictionKey = process.env.AZURE_PREDICTION_KEY;

    // Verifica si las variables de entorno están configuradas correctamente
    if (!azureEndpoint || !predictionKey) {
        console.error('Azure endpoint o clave de predicción faltante');
        return res.status(500).json({ error: 'Falta la configuración de Azure en las variables de entorno' });
    }

    try {
        // Llamada al endpoint de Azure Computer Vision OCR
        const response = await axios.post(
            `${azureEndpoint}/vision/v3.2/ocr`,
            { url: imageBase64 }, // Asegúrate de que sea un string base64 correcto
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': predictionKey,
                    'Content-Type': 'application/json',
                },
            }
        );
        res.status(200).json(response.data);
    } catch (error: any) {
        console.error('Error al procesar la imagen con Azure:', error);
        if (error.response) {
            // El servidor de Azure devolvió una respuesta con un código de error
            console.error('Respuesta de error de Azure:', error.response.data);
            return res.status(error.response.status).json({ error: error.response.data });
        }
        res.status(500).json({ error: 'Error al procesar la imagen' });
    }
}
