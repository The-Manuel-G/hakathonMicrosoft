# src/analysis.py
from fastapi import APIRouter, File, UploadFile, HTTPException
import torch
from torchvision import transforms, models
from PIL import Image
from io import BytesIO
from typing import Optional

device = torch.device("cpu")
model = models.resnet152()
model.fc = torch.nn.Linear(model.fc.in_features, 3)
model.load_state_dict(torch.load("lung-cancer.pth", map_location=device))
model.to(device)
model.eval()

router = APIRouter()

def preprocess_image(image_data):
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    img = Image.open(BytesIO(image_data)).convert("RGB")
    img_tensor = preprocess(img).unsqueeze(0)
    return img_tensor

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...), save_to_blob: Optional[bool] = False, paciente_id: Optional[str] = None, nombre: Optional[str] = None):
    img_tensor = preprocess_image(await file.read())
    img_tensor = img_tensor.to(device)
    
    with torch.no_grad():
        output = model(img_tensor)
        pred_label = torch.argmax(output, dim=1).item()
    
    class_names = {0: "lung_aca", 1: "lung_n", 2: "lung_scc"}
    prediction = class_names.get(pred_label, "Clase desconocida")
    
    if save_to_blob and paciente_id and nombre:
        from azure.storage.blob import BlobServiceClient
        CONNECT_STRING_BLOB = os.getenv("CONNECT_STRING_BLOB")
        blob_service_client = BlobServiceClient.from_connection_string(CONNECT_STRING_BLOB)
        container_name = 'images'
        filename = f"{nombre}_{paciente_id[:4]}.png"

        try:
            blob_client = blob_service_client.get_blob_client(container=container_name, blob=filename)
            with file.file as data:
                blob_client.upload_blob(data)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error saving image: {str(e)}")
    
    return {"prediction": prediction, "saved": save_to_blob}
