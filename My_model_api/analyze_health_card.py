import os
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv
from io import BytesIO
import logging

# Cargar las variables de entorno
load_dotenv()

# Configuración del logger para capturar errores y actividad
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Obtener los valores de las variables de entorno
endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")
key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY")

# Validar configuración
if not endpoint or not key:
    raise ValueError("Azure Form Recognizer endpoint or key is not set in the environment variables.")

# Configuración del cliente Azure Form Recognizer
document_analysis_client = DocumentAnalysisClient(endpoint=endpoint, credential=AzureKeyCredential(key))

# Crear el router para los endpoints de análisis de documentos
router = APIRouter()

# Función para extraer datos de los campos de documentos
def extract_document_field(doc_field):
    if doc_field.value_type == "string":
        return doc_field.value
    elif doc_field.value_type == "currency":
        return doc_field.content
    elif doc_field.value_type == "address":
        return f"{doc_field.value.house_number}, {doc_field.value.road}, {doc_field.value.city}, " \
               f"{doc_field.value.state}, {doc_field.value.postal_code}"
    elif doc_field.value_type == "date":
        return doc_field.value
    elif doc_field.value_type == "dictionary":
        return {key: extract_document_field(value) for key, value in doc_field.value.items()}
    elif doc_field.value_type == "list":
        return [extract_document_field(item) for item in doc_field.value]
    else:
        return doc_field.content

# Endpoint para analizar la tarjeta de salud
@router.post("/analyze-health-card/")
async def analyze_health_card(file: UploadFile = File(...)):
    try:
        # Leer archivo de imagen
        image_data = await file.read()
        
        # Analizar documento con el cliente de Azure Form Recognizer
        poller = document_analysis_client.begin_analyze_document(
            "prebuilt-healthInsuranceCard.us", document=BytesIO(image_data)
        )
        result = poller.result()
        
        # Extraer y estructurar los datos
        documents = []
        for doc in result.documents:
            doc_fields = {key: extract_document_field(value) for key, value in doc.fields.items()}
            documents.append(doc_fields)
        
        # Retornar resultados como JSON
        return JSONResponse(content={"documents": documents})
    
    except Exception as e:
        logger.error(f"Error al analizar la tarjeta de salud: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al analizar la tarjeta de salud: {str(e)}")

