"""
AgriSmart — Backend FastAPI
Sert les deux modèles Keras pour la détection de maladies.

Structure attendue :
    agrismart_backend/
    ├── main.py
    ├── cnn_best.keras          ← Manioc
    └── cnn_simple_best.keras   ← Maïs

Lancement :
    pip install fastapi uvicorn tensorflow pillow python-multipart
    uvicorn main:app --reload --port 8000
"""

import os, io, logging
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import tensorflow as tf

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agrismart")

IMG_SIZE = (160, 160)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CROPS = {
    "mais": {
        "model_file": "mais.keras",
        "classes":    ["sain", "blight", "rouille", "cercosporiose"],
        "accuracy":   "93.2%",
    },
    "manioc": {
        "model_file": "manioc.keras",
        "classes":    ["sain", "cmd", "cbb", "cgm", "cbsd"],
        "accuracy":   "~72%",
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# CHARGEMENT MODÈLES
# ─────────────────────────────────────────────────────────────────────────────
models: Dict[str, tf.keras.Model] = {}

def load_all_models():
    for crop, info in CROPS.items():
        path = os.path.join(BASE_DIR, info["model_file"])
        if not os.path.exists(path):
            raise FileNotFoundError(
                f"Modèle introuvable : {path}\n"
                f"Placez '{info['model_file']}' dans le dossier agrismart_backend/"
            )
        logger.info(f"Chargement modèle {crop} : {path}")
        models[crop] = tf.keras.models.load_model(path)
        logger.info(f"✅ Modèle {crop} chargé")

# ─────────────────────────────────────────────────────────────────────────────
# APP FASTAPI
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AgriSmart API",
    description="API de détection de maladies des cultures par deep learning — D-CLIC / OIF",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # En prod : remplacer par l'URL du frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    load_all_models()
    logger.info("🌿 AgriSmart API démarrée — modèles prêts")

# ─────────────────────────────────────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────
class PredictionResult(BaseModel):
    crop:        str
    predicted:   str
    confidence:  float
    probabilities: Dict[str, float]

class HealthResponse(BaseModel):
    status:  str
    models:  Dict[str, str]
    version: str

# ─────────────────────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/", response_model=HealthResponse)
def root():
    return {
        "status":  "ok",
        "models":  {k: v["accuracy"] for k, v in CROPS.items()},
        "version": "1.0.0"
    }

@app.get("/health", response_model=HealthResponse)
def health():
    loaded = {k: ("✅ chargé" if k in models else "❌ absent") for k in CROPS}
    return {"status": "ok", "models": loaded, "version": "1.0.0"}

@app.post("/predict/{crop}", response_model=PredictionResult)
async def predict(crop: str, file: UploadFile = File(...)):
    # Validation culture
    if crop not in CROPS:
        raise HTTPException(status_code=400, detail=f"Culture inconnue : '{crop}'. Valeurs : {list(CROPS.keys())}")
    if crop not in models:
        raise HTTPException(status_code=503, detail=f"Modèle '{crop}' non chargé.")

    # Validation fichier
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=415, detail="Format non supporté. Utilisez JPG ou PNG.")

    # Lecture image
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Impossible de lire l'image : {e}")

    # Prétraitement
    img   = image.resize(IMG_SIZE)
    arr   = np.expand_dims(np.array(img, dtype=np.float32) / 255.0, axis=0)

    # Inférence
    preds = models[crop].predict(arr, verbose=0)[0]
    preds = np.clip(preds, 0, 1)
    if preds.sum() > 0:
        preds = preds / preds.sum()

    classes   = CROPS[crop]["classes"]
    pred_idx  = int(np.argmax(preds))

    logger.info(f"Prédiction {crop} → {classes[pred_idx]} ({preds[pred_idx]*100:.1f}%)")

    return PredictionResult(
        crop         = crop,
        predicted    = classes[pred_idx],
        confidence   = float(preds[pred_idx]),
        probabilities= {cls: float(p) for cls, p in zip(classes, preds)}
    )

@app.get("/crops")
def get_crops():
    return {
        crop: {
            "classes":  info["classes"],
            "accuracy": info["accuracy"],
        }
        for crop, info in CROPS.items()
    }