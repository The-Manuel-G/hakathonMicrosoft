# src/analysis.py
from fastapi import APIRouter, File, UploadFile
import torch
from torchvision import transforms, models
from PIL import Image
from io import BytesIO

router = APIRouter()

# Configuración del dispositivo y carga del modelo
device = torch.device("cpu")
model = models.resnet152()
model.fc = torch.nn.Linear(model.fc.in_features, 3)
model.load_state_dict(torch.load("lung-cancer.pth", map_location=device))
model.to(device)
model.eval()

# Preprocesamiento de la imagen
def preprocess_image(image_data):
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    img = Image.open(BytesIO(image_data)).convert("RGB")
    img_tensor = preprocess(img).unsqueeze(0)
    return img_tensor

# Endpoint para analizar la imagen
@router.post("/predict")
async def analyze_image(file: UploadFile = File(...)):
    img_tensor = preprocess_image(await file.read())
    img_tensor = img_tensor.to(device)
    
    # Realiza la predicción con el modelo
    with torch.no_grad():
        output = model(img_tensor)
        pred_label = torch.argmax(output, dim=1).item()
    
    # Etiquetas de clases con términos clínicos específicos
    class_names = {
        0: "Adenocarcinoma de Pulmón",       # Para 'lung_aca'
        1: "Tejido Pulmonar Normal",         # Para 'lung_n'
        2: "Carcinoma de Células Escamosas"  # Para 'lung_scc'
    }
    
    # Obtener la etiqueta de la clase predicha
    prediction = class_names.get(pred_label, "Clase desconocida")
    
    return {"prediction": prediction}
