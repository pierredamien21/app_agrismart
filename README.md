# AgriSmart : diagnostic des maladies du maïs et du manioc

Application web qui identifie la maladie d'une feuille de maïs ou de manioc à partir d'une photo, puis affiche le diagnostic et les probabilités de chaque classe.

## Le problème

Au Togo comme dans le reste de l'Afrique de l'Ouest, le maïs et le manioc sont des cultures de base. Une maladie foliaire repérée tard peut coûter une récolte, et un agriculteur n'a pas toujours un agronome à portée de main pour la reconnaître.

## Ce que reconnaît le modèle

| Culture | Classes |
|---|---|
| Maïs | feuille saine, brûlure (blight), rouille, cercosporiose |
| Manioc | feuille saine, mosaïque (CMD), bactériose (CBB), acarien vert (CGM), striure brune (CBSD) |

Chaque culture a son propre réseau de neurones convolutif (Keras), qui prend une image redimensionnée en 160 × 160 pixels.

## Architecture

```
frontend/  React + Vite : choix de la culture, envoi de la photo, affichage du résultat (français / anglais)
backend/   FastAPI : charge les deux modèles au démarrage et expose la prédiction
           ├── mais.keras
           └── manioc.keras
```

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/health` | Indique si les modèles sont chargés |
| GET | `/crops` | Liste les cultures et leurs classes |
| POST | `/predict/{crop}` | Reçoit une image et renvoie la classe prédite et les probabilités |

## Installation

Prérequis : Python 3.11 et Node.js 20.

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
```

## Projet lié

[smartagri](https://github.com/pierredamien21/smartagri) est la première version de l'outil, sous forme d'application Streamlit, avec des conseils de traitement et de prévention pour chaque maladie.

## Stack

Python · TensorFlow / Keras · FastAPI · Pillow · React · Vite

## Limites

- Les performances des modèles (précision par classe, jeu de test) ne sont pas encore documentées dans ce dépôt.
- Le diagnostic reste une aide : il ne remplace pas l'avis d'un agronome.
