from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from azure.storage.blob import BlobServiceClient, ContentSettings
from dotenv import load_dotenv
import os
import logging

load_dotenv()
CONNECT_STRING_BLOB = os.getenv("CONNECT_STRING_BLOB")
if not CONNECT_STRING_BLOB:
    raise ValueError("Environment variable CONNECT_STRING_BLOB not found.")

blob_service_client = BlobServiceClient.from_connection_string(CONNECT_STRING_BLOB)
router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def build_filename(nombre: str, paciente_id: str, extension: str = "png") -> str:
    """Construye el nombre del archivo en función del nombre y ID del paciente."""
    return f"{nombre}_{paciente_id[:4]}.{extension}"

@router.post("/upload_image")
async def upload_image(
    nombre: str = Form(...),  # Recibir el nombre como formulario
    paciente_id: str = Form(...),  # Recibir el ID del paciente como formulario
    file: UploadFile = File(...)  # Recibir el archivo
):
    """
    Endpoint para subir una imagen de un paciente al contenedor de Azure Blob Storage.
    """
    if not nombre or not paciente_id:
        raise HTTPException(status_code=400, detail="Nombre y ID del paciente son necesarios.")
    
    container_name = 'images'
    filename = build_filename(nombre, paciente_id)

    try:
        # Obtener cliente para el blob de destino en Azure
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=filename)
        
        # Configura las propiedades de contenido para imágenes
        content_settings = ContentSettings(content_type=file.content_type)

        # Subir el archivo al contenedor especificado
        with file.file as data:
            blob_client.upload_blob(data, overwrite=True, content_settings=content_settings)

        logging.info(f"Imagen '{filename}' subida correctamente al contenedor '{container_name}'.")
        return {"filename": filename, "message": "Imagen subida exitosamente."}

    except Exception as e:
        logger.error(f"Error al subir la imagen: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error subiendo la imagen: {str(e)}")
