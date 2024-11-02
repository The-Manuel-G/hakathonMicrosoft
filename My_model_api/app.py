from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Importa CORS middleware
from images import router as images_router
from analysis import router as analysis_router
from documents import router as documents_router
from analyze_health_card import router as health_card_router 
from documen_Analitc import router as documen_Analitc_router 
app = FastAPI()

# Configuración de CORS para permitir el acceso desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes; ajusta según tus necesidades
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos HTTP
    allow_headers=["*"],  # Permitir todos los encabezados
)





# Incluir los routers para cada conjunto de endpoints
app.include_router(images_router, prefix="/images", tags=["Images"])
app.include_router(analysis_router, prefix="/analysis", tags=["Analysis"])
app.include_router(documents_router, prefix="/documents", tags=["Documents"])
app.include_router(health_card_router, prefix="/health-card", tags=["Health Card"])  # Añadir el router de la tarjeta de salud
app.include_router( documen_Analitc_router , prefix="/doc-intel", tags=["Document Intelligence"])  