import { useState, useRef, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const API_URL = ""
const LANG = {
  FR: {
    nav_diag: "Diagnostic", nav_about: "À propos", nav_cta: "Commencer",
    hero_badge: "IA Agricole · D-CLIC / OIF",
    hero_title_1: "Détectez les maladies",
    hero_title_2: "de vos cultures",
    hero_title_3: "en 2 secondes.",
    hero_sub: "AgriSmart analyse la photo d'une feuille et identifie instantanément la maladie — même sans connexion internet.",
    hero_cta: "Faire un diagnostic",
    hero_scroll: "Découvrir",
    stat_1_val: "93.2%", stat_1_lbl: "Précision Maïs",
    stat_2_val: "~72%",  stat_2_lbl: "Précision Manioc",
    stat_3_val: "9",     stat_3_lbl: "Maladies détectées",
    stat_4_val: "<1MB",  stat_4_lbl: "Modèle mobile",
    diag_title: "Diagnostic IA",
    diag_sub: "Choisissez votre culture puis uploadez la photo d'une feuille.",
    crop_mais: "Maïs", crop_manioc: "Manioc",
    mais_desc: "4 maladies · 93.2%", manioc_desc: "5 maladies · ~72%",
    upload_title: "Photo de la feuille",
    upload_hint: "Glissez-déposez ou cliquez · JPG, PNG",
    tip: "💡 Lumière naturelle, fond neutre, feuille centrée à 20-30 cm",
    analyze: "Analyser la feuille",
    analyzing: "Analyse en cours…",
    result_title: "Résultat",
    confidence: "Confiance",
    severity: "Sévérité",
    treatment: "Traitement",
    prevention: "Prévention",
    distribution: "Distribution des probabilités",
    new_diag: "Nouveau diagnostic",
    about_badge: "Notre mission",
    about_title: "L'IA au service de l'agriculture africaine",
    about_p1: "AgriSmart est né d'un constat simple : les agriculteurs d'Afrique de l'Ouest n'ont pas accès aux mêmes outils de diagnostic que leurs homologues des pays développés. Un agronome qualifié peut coûter des semaines et des centaines de dollars. Nous avons voulu changer ça.",
    about_p2: "Développé dans le cadre du programme D-CLIC de l'Organisation Internationale de la Francophonie, AgriSmart utilise des réseaux de neurones convolutifs entraînés sur plus de 25 000 images pour identifier 9 maladies sur 2 cultures essentielles.",
    card_mais_title: "Modèle Maïs",
    card_mais_desc: "CNN entraîné sur 4 186 images · 4 classes · Architecture 3 blocs convolutifs",
    card_manioc_title: "Modèle Manioc",
    card_manioc_desc: "CNN entraîné sur 21 397 images · 5 classes · Gestion déséquilibre 12x",
    card_tflite_title: "Mobile-first",
    card_tflite_desc: "Modèles TFLite int8 < 1 MB · Fonctionne hors ligne · Android compatible",
    footer_copy: "AgriSmart · Lomé, Togo · 2025",
    footer_sub: "Développé dans le cadre du programme D-CLIC · OIF",
    lang_btn: "🇬🇧 EN",
    error_no_crop: "Veuillez sélectionner une culture",
    error_no_file: "Veuillez sélectionner une image",
    error_api: "Erreur de connexion à l'API. Vérifiez que le backend est lancé.",
  },
  EN: {
    nav_diag: "Diagnosis", nav_about: "About", nav_cta: "Get Started",
    hero_badge: "Agricultural AI · D-CLIC / OIF",
    hero_title_1: "Detect diseases",
    hero_title_2: "in your crops",
    hero_title_3: "in 2 seconds.",
    hero_sub: "AgriSmart analyzes a leaf photo and instantly identifies the disease — even without internet.",
    hero_cta: "Run a diagnosis",
    hero_scroll: "Discover",
    stat_1_val: "93.2%", stat_1_lbl: "Maize Accuracy",
    stat_2_val: "~72%",  stat_2_lbl: "Cassava Accuracy",
    stat_3_val: "9",     stat_3_lbl: "Diseases detected",
    stat_4_val: "<1MB",  stat_4_lbl: "Mobile model",
    diag_title: "AI Diagnosis",
    diag_sub: "Choose your crop then upload a leaf photo.",
    crop_mais: "Maize", crop_manioc: "Cassava",
    mais_desc: "4 diseases · 93.2%", manioc_desc: "5 diseases · ~72%",
    upload_title: "Leaf Photo",
    upload_hint: "Drag & drop or click · JPG, PNG",
    tip: "💡 Natural light, neutral background, leaf centered at 20-30 cm",
    analyze: "Analyze leaf",
    analyzing: "Analyzing…",
    result_title: "Result",
    confidence: "Confidence",
    severity: "Severity",
    treatment: "Treatment",
    prevention: "Prevention",
    distribution: "Probability distribution",
    new_diag: "New diagnosis",
    about_badge: "Our mission",
    about_title: "AI for African agriculture",
    about_p1: "AgriSmart was born from a simple observation: West African farmers don't have access to the same diagnostic tools as their counterparts in developed countries. A qualified agronomist can cost weeks and hundreds of dollars. We wanted to change that.",
    about_p2: "Developed under the D-CLIC program of the Organisation Internationale de la Francophonie, AgriSmart uses convolutional neural networks trained on over 25,000 images to identify 9 diseases across 2 essential crops.",
    card_mais_title: "Maize Model",
    card_mais_desc: "CNN trained on 4,186 images · 4 classes · 3-block conv architecture",
    card_manioc_title: "Cassava Model",
    card_manioc_desc: "CNN trained on 21,397 images · 5 classes · 12x imbalance handling",
    card_tflite_title: "Mobile-first",
    card_tflite_desc: "TFLite int8 models < 1 MB · Works offline · Android compatible",
    footer_copy: "AgriSmart · Lomé, Togo · 2025",
    footer_sub: "Developed under the D-CLIC program · OIF",
    lang_btn: "🇫🇷 FR",
    error_no_crop: "Please select a crop",
    error_no_file: "Please select an image",
    error_api: "API connection error. Make sure the backend is running.",
  }
};

const DISEASES = {
  mais: {
    FR: {
      sain:          { name: "Feuille Saine",            emoji: "✅", color: "#22C55E", sev: "Aucune",     treatment: "Aucun traitement nécessaire. Continuez vos bonnes pratiques.", prevention: "Rotation des cultures, semences certifiées." },
      blight:        { name: "Brûlure Foliaire (Blight)", emoji: "🟤", color: "#A16207", sev: "Élevée",     treatment: "Fongicide mancozèbe ou chlorothalonil. Éliminez les résidus.", prevention: "Variétés résistantes, évitez l'excès d'humidité." },
      rouille:       { name: "Rouille Commune",           emoji: "🟠", color: "#EA580C", sev: "Moyenne",    treatment: "Fongicides triazoles (propiconazole). Traitement précoce.", prevention: "Semis précoce, variétés hybrides résistantes." },
      cercosporiose: { name: "Cercosporiose",             emoji: "🔴", color: "#DC2626", sev: "Élevée",     treatment: "Strobilurine. Éliminez les feuilles infectées.", prevention: "Rotation biennale, labour des résidus." },
    },
    EN: {
      sain:          { name: "Healthy Leaf",         emoji: "✅", color: "#22C55E", sev: "None",    treatment: "No treatment needed. Continue good practices.", prevention: "Crop rotation, certified seeds." },
      blight:        { name: "Northern Leaf Blight", emoji: "🟤", color: "#A16207", sev: "High",    treatment: "Mancozeb or chlorothalonil fungicide. Remove residues.", prevention: "Resistant varieties, avoid excess humidity." },
      rouille:       { name: "Common Rust",          emoji: "🟠", color: "#EA580C", sev: "Medium",  treatment: "Triazole fungicides (propiconazole). Early treatment.", prevention: "Early sowing, resistant hybrid varieties." },
      cercosporiose: { name: "Gray Leaf Spot",       emoji: "🔴", color: "#DC2626", sev: "High",    treatment: "Strobilurin. Remove infected leaves.", prevention: "Biennial rotation, tillage of residues." },
    },
  },
  manioc: {
    FR: {
      sain:  { name: "Feuille Saine",            emoji: "✅", color: "#22C55E", sev: "Aucune",      treatment: "Aucun traitement nécessaire.", prevention: "Boutures saines, espacement correct." },
      cmd:   { name: "Mosaïque (CMD)",            emoji: "🟡", color: "#CA8A04", sev: "Très élevée", treatment: "Arrachez et brûlez immédiatement. Pas de chimique efficace.", prevention: "Boutures CMD-résistantes, contrôle aleurodes." },
      cbb:   { name: "Bactériose (CBB)",          emoji: "🔵", color: "#2563EB", sev: "Élevée",      treatment: "Éliminez les parties infectées. Cuivre. Désinfectez les outils.", prevention: "Évitez les blessures, boutures saines." },
      cgm:   { name: "Acaroïdes Verts (CGM)",    emoji: "🟣", color: "#9333EA", sev: "Moyenne",     treatment: "Acaricides biologiques (neem). Prédateurs naturels.", prevention: "Semis début de saison, variétés tolérantes." },
      cbsd:  { name: "Blight (CBSD)",             emoji: "🔴", color: "#DC2626", sev: "Très élevée", treatment: "Aucun traitement. Arrachez immédiatement.", prevention: "Boutures CBSD-saines, contrôle mouches blanches." },
    },
    EN: {
      sain:  { name: "Healthy Leaf",                  emoji: "✅", color: "#22C55E", sev: "None",       treatment: "No treatment needed.", prevention: "Healthy cuttings, proper spacing." },
      cmd:   { name: "Cassava Mosaic (CMD)",           emoji: "🟡", color: "#CA8A04", sev: "Very High",  treatment: "Uproot and burn immediately. No effective chemical.", prevention: "CMD-resistant cuttings, control whiteflies." },
      cbb:   { name: "Bacterial Blight (CBB)",         emoji: "🔵", color: "#2563EB", sev: "High",       treatment: "Remove infected parts. Copper. Disinfect tools.", prevention: "Avoid injuries, healthy cuttings." },
      cgm:   { name: "Green Mite (CGM)",               emoji: "🟣", color: "#9333EA", sev: "Medium",     treatment: "Biological acaricides (neem). Natural predators.", prevention: "Early planting, tolerant varieties." },
      cbsd:  { name: "Brown Streak (CBSD)",            emoji: "🔴", color: "#DC2626", sev: "Very High",  treatment: "No treatment. Uproot immediately.", prevention: "CBSD-certified cuttings, whitefly control." },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES  (CSS-in-JS via <style> tag injecté une fois)
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,700;0,900;1,300;1,700&family=Cabinet+Grotesk:wght@300;400;500;700&display=swap');

:root {
  --bg:       #050A05;
  --bg2:      #0A120A;
  --bg3:      #0F1A0F;
  --border:   rgba(255,255,255,0.06);
  --green:    #22C55E;
  --green2:   #16A34A;
  --gold:     #D97706;
  --text:     rgba(255,255,255,0.85);
  --text2:    rgba(255,255,255,0.45);
  --text3:    rgba(255,255,255,0.2);
  --r:        18px;
  --ff-display: 'Fraunces', Georgia, serif;
  --ff-body:    'Cabinet Grotesk', sans-serif;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: var(--ff-body); overflow-x: hidden; }
::selection { background: rgba(34,197,94,0.25); }

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.3); border-radius: 10px; }

/* ── NAV ── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 64px;
  background: rgba(5,10,5,0.85); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  transition: all 0.3s;
}
.nav-brand { font-family: var(--ff-display); font-size: 22px; font-weight: 700; color: var(--green); letter-spacing: -0.5px; }
.nav-links { display: flex; align-items: center; gap: 32px; }
.nav-link { font-size: 13px; color: var(--text2); text-decoration: none; letter-spacing: 0.3px; cursor: pointer; transition: color 0.2s; }
.nav-link:hover { color: var(--text); }
.nav-cta {
  background: var(--green); color: #050A05 !important; font-weight: 700;
  padding: 8px 20px; border-radius: 100px; font-size: 13px; cursor: pointer;
  transition: all 0.2s; border: none;
}
.nav-cta:hover { background: #16A34A; transform: translateY(-1px); }
.nav-lang {
  background: var(--border); border: 1px solid rgba(255,255,255,0.08);
  color: var(--text2); padding: 6px 14px; border-radius: 100px;
  font-size: 12px; cursor: pointer; font-family: var(--ff-body);
  transition: all 0.2s;
}
.nav-lang:hover { color: var(--text); border-color: rgba(255,255,255,0.15); }

/* ── HERO ── */
.hero {
  min-height: 100vh; display: flex; flex-direction: column;
  justify-content: center; padding: 120px 48px 80px;
  position: relative; overflow: hidden;
}
.hero-orb {
  position: absolute; border-radius: 50%; pointer-events: none;
  filter: blur(80px); opacity: 0.4;
}
.hero-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(34,197,94,0.15), transparent 70%); top: -10%; left: -5%; }
.hero-orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(217,119,6,0.08), transparent 70%); bottom: 10%; right: 5%; }
.hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; max-width: 1200px; margin: 0 auto; width: 100%; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
  border-radius: 100px; padding: 6px 16px; font-size: 11px;
  color: #86EFAC; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 28px;
}
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.4;transform:scale(0.7);} }
.hero-title {
  font-family: var(--ff-display); font-size: clamp(44px, 5.5vw, 76px);
  font-weight: 900; line-height: 1.0; letter-spacing: -3px;
  color: #fff; margin-bottom: 24px;
}
.hero-title-accent { color: var(--green); font-style: italic; }
.hero-sub { font-size: 17px; color: var(--text2); line-height: 1.7; max-width: 460px; margin-bottom: 36px; font-weight: 300; }
.hero-actions { display: flex; gap: 16px; align-items: center; }
.btn-primary {
  background: var(--green); color: #050A05; font-weight: 700; font-family: var(--ff-body);
  border: none; padding: 14px 28px; border-radius: 100px; font-size: 15px;
  cursor: pointer; transition: all 0.25s; letter-spacing: 0.2px;
}
.btn-primary:hover { background: #16A34A; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(34,197,94,0.3); }
.hero-scroll { font-size: 12px; color: var(--text3); letter-spacing: 1px; cursor: pointer; transition: color 0.2s; }
.hero-scroll:hover { color: var(--text2); }
.hero-right-card {
  background: var(--bg2); border: 1px solid var(--border); border-radius: 24px;
  padding: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
  overflow: hidden; position: relative;
}
.stat-cell {
  padding: 24px 20px; transition: background 0.2s;
  display: flex; flex-direction: column; gap: 4px;
}
.stat-cell:hover { background: rgba(255,255,255,0.02); }
.stat-val { font-family: var(--ff-display); font-size: 38px; font-weight: 900; color: var(--green); line-height: 1; letter-spacing: -2px; }
.stat-lbl { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 1.5px; }
.stat-divider-h { grid-column: 1/-1; height: 1px; background: var(--border); }
.stat-divider-v { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: var(--border); }

/* ── SECTIONS ── */
.section { padding: 100px 48px; max-width: 1200px; margin: 0 auto; }
.section-full { padding: 100px 48px; background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.section-full-inner { max-width: 1200px; margin: 0 auto; }
.section-badge { display: inline-block; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: var(--green); margin-bottom: 12px; }
.section-title { font-family: var(--ff-display); font-size: clamp(32px, 4vw, 52px); font-weight: 900; color: #fff; letter-spacing: -2px; line-height: 1.05; margin-bottom: 20px; }

/* ── DIAGNOSTIC ── */
.diag-sub { font-size: 15px; color: var(--text2); margin-bottom: 48px; max-width: 500px; }
.crop-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
.crop-btn {
  padding: 22px 24px; border-radius: var(--r); cursor: pointer;
  border: 2px solid var(--border); background: var(--bg2);
  transition: all 0.2s; text-align: left; position: relative; overflow: hidden;
}
.crop-btn::before { content:''; position:absolute; inset:0; border-radius:16px; opacity:0; transition:opacity 0.2s; }
.crop-btn-mais::before   { background: linear-gradient(135deg, rgba(217,119,6,0.06), transparent); }
.crop-btn-manioc::before { background: linear-gradient(135deg, rgba(34,197,94,0.06), transparent); }
.crop-btn:hover { transform: translateY(-2px); }
.crop-btn-mais:hover,   .crop-btn-mais.active   { border-color: #D97706; box-shadow: 0 0 0 1px #D97706, 0 12px 36px rgba(217,119,6,0.15); }
.crop-btn-manioc:hover, .crop-btn-manioc.active { border-color: var(--green); box-shadow: 0 0 0 1px var(--green), 0 12px 36px rgba(34,197,94,0.15); }
.crop-btn:hover::before, .crop-btn.active::before { opacity: 1; }
.crop-icon-lg { font-size: 36px; display: block; margin-bottom: 10px; }
.crop-name { font-family: var(--ff-display); font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 3px; }
.crop-desc { font-size: 12px; color: var(--text2); }

.upload-zone {
  border: 2px dashed rgba(34,197,94,0.2); border-radius: var(--r);
  background: rgba(34,197,94,0.02); padding: 40px;
  text-align: center; cursor: pointer; transition: all 0.2s;
  position: relative; margin-bottom: 16px;
}
.upload-zone:hover, .upload-zone.drag { border-color: rgba(34,197,94,0.5); background: rgba(34,197,94,0.04); }
.upload-icon { font-size: 40px; margin-bottom: 12px; display: block; }
.upload-title { font-family: var(--ff-display); font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 6px; }
.upload-hint { font-size: 12px; color: var(--text3); }
.upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
.tip-box { display: flex; gap: 10px; align-items: flex-start; background: rgba(217,119,6,0.05); border: 1px solid rgba(217,119,6,0.15); border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; }
.tip-box span { font-size: 12px; color: var(--text2); line-height: 1.55; }
.preview-wrap { position: relative; border-radius: var(--r); overflow: hidden; border: 1px solid var(--border); margin-bottom: 16px; }
.preview-wrap img { width: 100%; display: block; max-height: 280px; object-fit: cover; }
.preview-change { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; cursor: pointer; font-size: 13px; color: #fff; font-weight: 600; }
.preview-wrap:hover .preview-change { opacity: 1; }
.preview-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.btn-analyze {
  width: 100%; background: var(--green); color: #050A05; font-weight: 700;
  border: none; border-radius: 12px; padding: 15px; font-size: 15px;
  font-family: var(--ff-body); cursor: pointer; transition: all 0.25s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.btn-analyze:hover:not(:disabled) { background: #16A34A; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(34,197,94,0.3); }
.btn-analyze:disabled { opacity: 0.6; cursor: not-allowed; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(5,10,5,0.3); border-top-color: #050A05; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-box { background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #FCA5A5; margin-bottom: 12px; }
.diag-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }

/* ── RESULT PANEL ── */
.result-panel { background: var(--bg2); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; }
.result-head { padding: 24px 28px; border-bottom: 1px solid var(--border); display: flex; gap: 16px; align-items: center; }
.result-emoji-big { font-size: 48px; line-height: 1; }
.result-name { font-family: var(--ff-display); font-size: 22px; font-weight: 700; line-height: 1.1; margin-bottom: 4px; }
.result-conf { font-size: 13px; color: var(--text2); }
.result-conf strong { font-size: 15px; }
.result-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 18px; }
.result-field label { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: var(--text3); display: block; margin-bottom: 5px; }
.result-field p { font-size: 13px; color: var(--text2); line-height: 1.6; }
.sev-pill { display: inline-block; padding: 3px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; }
.probs-section { padding: 0 28px 24px; }
.probs-title { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: var(--text3); margin-bottom: 14px; }
.prob-row { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
.prob-lbl { font-size: 11px; color: var(--text2); min-width: 80px; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prob-track { flex: 1; height: 5px; background: rgba(255,255,255,0.05); border-radius: 100px; overflow: hidden; }
.prob-fill { height: 100%; border-radius: 100px; transition: width 0.8s cubic-bezier(.4,0,.2,1); }
.prob-pct { font-size: 11px; color: var(--text3); min-width: 30px; text-align: right; }
.btn-reset { width: 100%; background: transparent; border: 1px solid var(--border); color: var(--text2); font-family: var(--ff-body); font-size: 13px; padding: 11px; border-radius: 10px; cursor: pointer; transition: all 0.2s; margin: 0 28px 24px; width: calc(100% - 56px); }
.btn-reset:hover { border-color: rgba(255,255,255,0.15); color: var(--text); }
.result-empty {
  background: var(--bg2); border: 1px solid var(--border); border-radius: 24px;
  padding: 48px 28px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.result-empty-icon { font-size: 52px; opacity: 0.3; }
.result-empty-title { font-family: var(--ff-display); font-size: 20px; color: var(--text2); font-weight: 700; }
.result-empty-sub { font-size: 13px; color: var(--text3); max-width: 220px; line-height: 1.5; }
.model-info { background: var(--bg2); border: 1px solid var(--border); border-radius: 24px; padding: 28px; margin-top: 8px; }
.mi-title { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: var(--text3); margin-bottom: 20px; }
.mi-row { margin-bottom: 16px; }
.mi-row:last-child { margin-bottom: 0; }
.mi-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text3); margin-bottom: 3px; }
.mi-val-big { font-family: var(--ff-display); font-size: 40px; font-weight: 900; line-height: 1; }
.mi-val { font-size: 13px; color: var(--text2); line-height: 1.5; }

/* ── ABOUT ── */
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; margin-bottom: 72px; }
.about-p { font-size: 15px; color: var(--text2); line-height: 1.8; margin-bottom: 16px; font-weight: 300; }
.about-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.about-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 20px; padding: 28px; position: relative; overflow: hidden; transition: border-color 0.2s; }
.about-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background: linear-gradient(90deg, var(--green), transparent); }
.about-card:hover { border-color: rgba(255,255,255,0.1); }
.about-card-icon { font-size: 32px; margin-bottom: 16px; display: block; }
.about-card-title { font-family: var(--ff-display); font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
.about-card-desc { font-size: 13px; color: var(--text2); line-height: 1.6; }

/* ── FOOTER ── */
.footer {
  padding: 40px 48px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
  background: var(--bg);
}
.footer-brand { font-family: var(--ff-display); font-size: 20px; font-weight: 700; color: var(--green); }
.footer-right { text-align: right; }
.footer-copy { font-size: 12px; color: var(--text3); }

/* ── ANIMATIONS ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 0.6s ease forwards; }
.fade-up-1 { animation-delay: 0.1s; opacity: 0; }
.fade-up-2 { animation-delay: 0.2s; opacity: 0; }
.fade-up-3 { animation-delay: 0.3s; opacity: 0; }
.fade-up-4 { animation-delay: 0.4s; opacity: 0; }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .hero-grid, .diag-grid, .about-grid { grid-template-columns: 1fr; }
  .crop-row, .about-cards { grid-template-columns: 1fr; }
  .nav { padding: 0 24px; }
  .hero, .section, .section-full { padding-left: 24px; padding-right: 24px; }
  .stat-cell { padding: 18px 16px; }
  .stat-val { font-size: 28px; }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────
function Navbar({ lang, setLang, t, onNavClick }) {
  return (
    <nav className="nav">
      <div className="nav-brand">🌿 AgriSmart</div>
      <div className="nav-links">
        <span className="nav-link" onClick={() => onNavClick("diag")}>{t.nav_diag}</span>
        <span className="nav-link" onClick={() => onNavClick("about")}>{t.nav_about}</span>
        <button className="nav-lang" onClick={() => setLang(l => l === "FR" ? "EN" : "FR")}>{t.lang_btn}</button>
        <button className="nav-cta" onClick={() => onNavClick("diag")}>{t.nav_cta}</button>
      </div>
    </nav>
  );
}

function Hero({ t, onCta }) {
  return (
    <section className="hero">
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-grid">
        <div>
          <div className="hero-badge fade-up fade-up-1"><span className="dot" />{t.hero_badge}</div>
          <h1 className="hero-title fade-up fade-up-2">
            {t.hero_title_1}<br />
            {t.hero_title_2}<br />
            <span className="hero-title-accent">{t.hero_title_3}</span>
          </h1>
          <p className="hero-sub fade-up fade-up-3">{t.hero_sub}</p>
          <div className="hero-actions fade-up fade-up-4">
            <button className="btn-primary" onClick={onCta}>{t.hero_cta} →</button>
            <span className="hero-scroll" onClick={() => onCta()}>↓ {t.hero_scroll}</span>
          </div>
        </div>
        <div className="fade-up fade-up-3">
          <div className="hero-right-card">
            <div className="stat-divider-v" />
            {[
              [t.stat_1_val, t.stat_1_lbl], [t.stat_2_val, t.stat_2_lbl],
              null,
              [t.stat_3_val, t.stat_3_lbl], [t.stat_4_val, t.stat_4_lbl],
            ].map((s, i) =>
              s === null
                ? <div key={i} className="stat-divider-h" />
                : <div key={i} className="stat-cell">
                    <div className="stat-val">{s[0]}</div>
                    <div className="stat-lbl">{s[1]}</div>
                  </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DiagSection({ lang, t }) {
  const [crop,     setCrop]     = useState(null);
  const [imgFile,  setImgFile]  = useState(null);
  const [imgURL,   setImgURL]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState("");
  const [drag,     setDrag]     = useState(false);
  const inputRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file) return;
    setImgFile(file);
    setImgURL(URL.createObjectURL(file));
    setResult(null);
    setError("");
  }, []);

  const onDrop = (e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); };
  const onDrag = (e) => { e.preventDefault(); setDrag(true); };
  const onDragLeave = () => setDrag(false);

  const analyze = async () => {
    if (!crop)    return setError(t.error_no_crop);
    if (!imgFile) return setError(t.error_no_file);
    setLoading(true); setError(""); setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", imgFile);
      const res = await fetch(`${API_URL}/predict/${crop}`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(t.error_api);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setImgFile(null); setImgURL(null); setCrop(null); setError(""); };

  const diseases = result ? DISEASES[crop]?.[lang]?.[result.predicted] : null;
  const cropInfo = crop ? (crop === "mais" ? { acc: "93.2%", arch: "CNN Scratch · 3 blocs Conv", classes: "sain · blight · rouille · cercosporiose" } : { acc: "~72%", arch: "CNN Scratch · 3 blocs Conv", classes: "sain · cmd · cbb · cgm · cbsd" }) : null;

  return (
    <section className="section-full" id="diag">
      <div className="section-full-inner">
        <span className="section-badge">{t.nav_diag}</span>
        <h2 className="section-title">{t.diag_title}</h2>
        <p className="diag-sub">{t.diag_sub}</p>

        <div className="diag-grid">
          {/* ── GAUCHE : Sélection + Upload ── */}
          <div>
            {/* Crop selection */}
            <div className="crop-row">
              {[
                { key:"mais",   icon:"🌽", name:t.crop_mais,   desc:t.mais_desc,   cls:"crop-btn-mais"   },
                { key:"manioc", icon:"🌿", name:t.crop_manioc, desc:t.manioc_desc, cls:"crop-btn-manioc" },
              ].map(c => (
                <button
                  key={c.key}
                  className={`crop-btn ${c.cls} ${crop===c.key?"active":""}`}
                  onClick={() => { setCrop(c.key); setResult(null); setError(""); }}
                >
                  <span className="crop-icon-lg">{c.icon}</span>
                  <div className="crop-name">{c.name}</div>
                  <div className="crop-desc">{c.desc}</div>
                </button>
              ))}
            </div>

            {/* Upload / Preview */}
            {!imgURL ? (
              <div
                className={`upload-zone ${drag?"drag":""}`}
                onDrop={onDrop} onDragOver={onDrag} onDragLeave={onDragLeave}
                onClick={() => inputRef.current?.click()}
              >
                <span className="upload-icon">🌿</span>
                <div className="upload-title">{t.upload_title}</div>
                <div className="upload-hint">{t.upload_hint}</div>
                <input ref={inputRef} type="file" accept="image/*" className="upload-input"
                  onChange={e => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div className="preview-wrap" onClick={() => inputRef.current?.click()}>
                <img src={imgURL} alt="preview" />
                <div className="preview-change">🔄 Changer l'image</div>
                <input ref={inputRef} type="file" accept="image/*" className="preview-input"
                  onChange={e => handleFile(e.target.files[0])} />
              </div>
            )}

            <div className="tip-box"><span>{t.tip}</span></div>
            {error && <div className="error-box">{error}</div>}

            <button className="btn-analyze" onClick={analyze} disabled={loading || !imgFile || !crop}>
              {loading ? <><div className="spinner" />{t.analyzing}</> : `🔬 ${t.analyze}`}
            </button>
          </div>

          {/* ── DROITE : Résultat ── */}
          <div>
            {result && diseases ? (
              <div className="result-panel">
                <div className="result-head" style={{ background: diseases.color + "10" }}>
                  <span className="result-emoji-big">{diseases.emoji}</span>
                  <div>
                    <div className="result-name" style={{ color: diseases.color }}>{diseases.name}</div>
                    <div className="result-conf">{t.confidence} : <strong style={{ color: diseases.color }}>{Math.round(result.confidence * 100)}%</strong></div>
                  </div>
                </div>
                <div className="result-body">
                  <div className="result-field">
                    <label>{t.severity}</label>
                    <span className="sev-pill" style={{ background: diseases.color+"18", color: diseases.color, border:`1px solid ${diseases.color}30` }}>{diseases.sev}</span>
                  </div>
                  <div className="result-field">
                    <label>{t.treatment}</label>
                    <p>{diseases.treatment}</p>
                  </div>
                  <div className="result-field">
                    <label>{t.prevention}</label>
                    <p>{diseases.prevention}</p>
                  </div>
                </div>
                <div className="probs-section">
                  <div className="probs-title">{t.distribution}</div>
                  {Object.entries(result.probabilities)
                    .sort((a,b) => b[1]-a[1])
                    .map(([cls, prob]) => {
                      const d2 = DISEASES[crop][lang][cls];
                      const isTop = cls === result.predicted;
                      return (
                        <div key={cls} className="prob-row">
                          <div className="prob-lbl">{d2.emoji} {cls}</div>
                          <div className="prob-track">
                            <div className="prob-fill" style={{ width:`${Math.round(prob*100)}%`, background: isTop ? d2.color : "rgba(255,255,255,0.1)" }} />
                          </div>
                          <div className="prob-pct">{Math.round(prob*100)}%</div>
                        </div>
                      );
                  })}
                </div>
                <button className="btn-reset" onClick={reset}>🔄 {t.new_diag}</button>
              </div>
            ) : cropInfo ? (
              <div className="model-info">
                <div className="mi-title">{t.model_info || "Model Info"}</div>
                <div className="mi-row">
                  <div className="mi-lbl">{t.accuracy || "Accuracy"}</div>
                  <div className="mi-val-big" style={{ color: crop==="mais" ? "#D97706" : "#22C55E" }}>{cropInfo.acc}</div>
                </div>
                <div className="mi-row">
                  <div className="mi-lbl">{t.classes_lbl || "Classes"}</div>
                  <div className="mi-val">{cropInfo.classes}</div>
                </div>
                <div className="mi-row">
                  <div className="mi-lbl">{t.size_lbl || "Architecture"}</div>
                  <div className="mi-val">{cropInfo.arch}</div>
                </div>
              </div>
            ) : (
              <div className="result-empty">
                <span className="result-empty-icon">🌱</span>
                <div className="result-empty-title">{lang==="FR" ? "Prêt pour le diagnostic" : "Ready for diagnosis"}</div>
                <div className="result-empty-sub">{lang==="FR" ? "Choisissez une culture et uploadez une image" : "Choose a crop and upload an image"}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection({ t }) {
  return (
    <section className="section" id="about">
      <div className="about-grid">
        <div>
          <span className="section-badge">{t.about_badge}</span>
          <h2 className="section-title">{t.about_title}</h2>
        </div>
        <div>
          <p className="about-p">{t.about_p1}</p>
          <p className="about-p">{t.about_p2}</p>
        </div>
      </div>
      <div className="about-cards">
        {[
          { icon:"🌽", title: t.card_mais_title,   desc: t.card_mais_desc   },
          { icon:"🌿", title: t.card_manioc_title, desc: t.card_manioc_desc },
          { icon:"📱", title: t.card_tflite_title, desc: t.card_tflite_desc },
        ].map((c,i) => (
          <div key={i} className="about-card">
            <span className="about-card-icon">{c.icon}</span>
            <div className="about-card-title">{c.title}</div>
            <div className="about-card-desc">{c.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("FR");
  const t = LANG[lang];

  // Inject CSS once
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Navbar lang={lang} setLang={setLang} t={t} onNavClick={scrollTo} />
      <Hero t={t} onCta={() => scrollTo("diag")} />
      <DiagSection lang={lang} t={t} />
      <AboutSection t={t} />
      <footer className="footer">
        <div className="footer-brand">🌿 AgriSmart</div>
        <div className="footer-right">
          <div className="footer-copy">{t.footer_copy}</div>
          <div className="footer-copy">{t.footer_sub}</div>
        </div>
      </footer>
    </>
  );
}