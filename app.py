"""
Week 6: Final Polish - The Product
Health Diagnostics AI Agent - Production Ready Application

CRITICAL FIXES:
- max_tokens=8000 for large PDF handling (19+ pages)
- Twin red button styling for consistency
- Red pill sidebar navigation
- Glassmorphism UI design
- Personalized recommendations
- Enhanced error handling

Features:
- Universal report ingestion (PDF, Images, JSON)
- AI-powered data extraction using Groq LLM (8000 tokens)
- Medical analysis engine with 30+ blood parameters
- Cardiovascular risk assessment
- Enhanced PDF report generation with color-coded tables
- Cloud data persistence with Supabase
- Red pill style sidebar navigation
- Twin red button styling
"""

import streamlit as st
import json
import os
import pandas as pd
from pathlib import Path
from PIL import Image
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

try:
    import pytesseract
    OCR_AVAILABLE = True
    tesseract_path = os.getenv("TESSERACT_PATH")
    if tesseract_path:
        pytesseract.pytesseract.tesseract_cmd = tesseract_path
except ImportError:
    OCR_AVAILABLE = False

try:
    import pdfplumber
    PDF_LIBRARY = "pdfplumber"
except ImportError:
    try:
        import PyPDF2
        PDF_LIBRARY = "PyPDF2"
    except ImportError:
        PDF_LIBRARY = None

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

try:
    from fpdf import FPDF
    FPDF_AVAILABLE = True
except ImportError:
    FPDF_AVAILABLE = False

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False

st.set_page_config(
    page_title="🏥 Health Diagnostics AI Agent",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
    <style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    .stDeployButton {display: none;}
    
    .stApp {
        background: linear-gradient(to right, #ece9e6, #ffffff) !important;
        background-attachment: fixed;
        min-height: 100vh;
    }
    
    .main {
        background: transparent !important;
    }
    
    .stApp {
        color: #333333 !important;
    }
    
    .stApp p, .stApp h1, .stApp h2, .stApp h3, .stApp h4, .stApp h5, .stApp h6,
    .stApp span, .stApp label, .stApp li, .stApp a, .stApp strong, .stApp em {
        color: #333333 !important;
    }
    
    .stMarkdown {
        color: #333333 !important;
    }
    
    .stMarkdown p, .stMarkdown h1, .stMarkdown h2, .stMarkdown h3, .stMarkdown h4, .stMarkdown h5, .stMarkdown h6,
    .stMarkdown span, .stMarkdown label, .stMarkdown li, .stMarkdown a, .stMarkdown strong, .stMarkdown em {
        color: #333333 !important;
    }
    
    [data-testid="stSidebar"] {
        background: #FFFFFF !important;
        border-right: 1px solid #E0E0E0 !important;
    }
    
    [data-testid="stSidebar"] h1,
    [data-testid="stSidebar"] h2,
    [data-testid="stSidebar"] h3,
    [data-testid="stSidebar"] h4,
    [data-testid="stSidebar"] h5,
    [data-testid="stSidebar"] h6,
    [data-testid="stSidebar"] p,
    [data-testid="stSidebar"] label,
    [data-testid="stSidebar"] span,
    [data-testid="stSidebar"] li,
    [data-testid="stSidebar"] a,
    [data-testid="stSidebar"] strong,
    [data-testid="stSidebar"] em {
        color: #333333 !important;
    }
    
    div[role="radiogroup"] label > div:first-child {
        display: none !important;
    }
    
    div[role="radiogroup"] label {
        background-color: #FFFFFF !important;
        color: #333333 !important;
        padding: 12px 16px !important;
        margin: 8px 0 !important;
        border-radius: 8px !important;
        border: none !important;
        cursor: pointer !important;
        font-weight: 500 !important;
        font-size: 1rem !important;
        transition: all 0.3s ease !important;
        display: block !important;
        width: 100% !important;
    }
    
    div[role="radiogroup"] label:hover {
        background-color: #F5F5F5 !important;
        transform: translateX(4px) !important;
    }
    
    div[role="radiogroup"] label:has(input:checked) {
        background: #FF4B4B !important;
        color: #FFFFFF !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 12px rgba(255, 75, 75, 0.3) !important;
    }
    
    div[role="radiogroup"] input[type="radio"] {
        display: none !important;
    }
    
    .stButton > button,
    .stDownloadButton > button {
        background-color: #FF4B4B !important;
        color: #FFFFFF !important;
        border: none !important;
        border-radius: 20px !important;
        padding: 12px 24px !important;
        font-weight: 700 !important;
        font-size: 1rem !important;
        width: 100% !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 12px rgba(255, 75, 75, 0.2) !important;
    }
    
    .stButton > button:hover,
    .stDownloadButton > button:hover {
        background-color: #E63946 !important;
        box-shadow: 0 6px 16px rgba(255, 75, 75, 0.4) !important;
        transform: translateY(-2px) !important;
    }
    
    .stButton > button:active,
    .stDownloadButton > button:active {
        transform: translateY(0px) !important;
    }
    
    [data-testid="metric-container"] {
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(10px) !important;
        border-radius: 20px !important;
        padding: 1.5rem !important;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15) !important;
        border: 1px solid rgba(255, 255, 255, 0.18) !important;
        border-left: 4px solid #FF4B4B !important;
        transition: all 0.3s ease !important;
    }
    
    [data-testid="metric-container"]:hover {
        transform: translateY(-5px) !important;
        box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25) !important;
    }
    
    [data-testid="metric-container"] * {
        color: #333333 !important;
    }
    
    .stTabs [data-baseweb="tab-list"] {
        gap: 1rem;
        background-color: transparent;
    }
    
    .stTabs [data-baseweb="tab"] {
        border-radius: 15px !important;
        padding: 1rem 1.5rem !important;
        font-weight: 600 !important;
        background-color: rgba(255, 255, 255, 0.7) !important;
        color: #333333 !important;
        border: none !important;
        transition: all 0.3s ease !important;
    }
    
    .stTabs [data-baseweb="tab"]:hover {
        background-color: rgba(255, 255, 255, 0.9) !important;
        transform: translateY(-2px) !important;
    }
    
    .stTabs [aria-selected="true"] {
        background: #FF4B4B !important;
        color: white !important;
        box-shadow: 0 4px 15px rgba(255, 75, 75, 0.3) !important;
    }
    
    [data-testid="stDataFrame"] {
        border-radius: 15px !important;
        overflow: hidden !important;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15) !important;
        background: rgba(255, 255, 255, 0.95) !important;
    }
    
    .stTextInput > div > div > input,
    .stTextArea > div > div > textarea {
        background-color: rgba(255, 255, 255, 0.95) !important;
        color: #333333 !important;
        border: 2px solid rgba(255, 75, 75, 0.3) !important;
        border-radius: 12px !important;
        transition: all 0.3s ease !important;
    }
    
    .stTextInput > div > div > input:focus,
    .stTextArea > div > div > textarea:focus {
        border-color: #FF4B4B !important;
        box-shadow: 0 0 0 3px rgba(255, 75, 75, 0.1) !important;
    }
    
    .premium-card {
        background: rgba(255, 255, 255, 0.98) !important;
        backdrop-filter: blur(10px) !important;
        border-radius: 20px !important;
        padding: 2rem !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.18) !important;
        margin: 1rem 0 !important;
        border-left: 4px solid #FF4B4B !important;
        transition: all 0.3s ease !important;
    }
    
    .premium-card:hover {
        transform: translateY(-5px) !important;
        box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25) !important;
    }
    
    .premium-card h3 {
        color: #333333 !important;
        margin-bottom: 1rem !important;
        font-size: 1.3rem !important;
        font-weight: 700 !important;
    }
    
    .premium-card p {
        color: #333333 !important;
        line-height: 1.6 !important;
    }
    
    .hero-card {
        background: rgba(255, 255, 255, 0.98) !important;
        backdrop-filter: blur(10px) !important;
        border-radius: 20px !important;
        padding: 60px 40px !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.18) !important;
        text-align: center !important;
        margin: 2rem auto !important;
        max-width: 600px !important;
    }
    
    .hero-card h1 {
        color: #333333 !important;
        font-size: 2.5rem !important;
        font-weight: 800 !important;
        margin-bottom: 1rem !important;
    }
    
    .hero-card .hero-icon {
        font-size: 4rem !important;
        margin-bottom: 1.5rem !important;
    }
    
    .hero-card .hero-subtitle {
        color: #666666 !important;
        font-size: 1.1rem !important;
        margin-bottom: 2rem !important;
        line-height: 1.6 !important;
    }
    
    .hero-card .feature-list {
        text-align: left !important;
        display: inline-block !important;
        margin-top: 2rem !important;
    }
    
    .hero-card .feature-item {
        color: #333333 !important;
        font-size: 1rem !important;
        margin: 0.8rem 0 !important;
        line-height: 1.5 !important;
    }
    
    .main-header {
        font-size: 2.8rem !important;
        color: #333333 !important;
        margin-bottom: 0.5rem !important;
        font-weight: 800 !important;
        text-align: center !important;
    }
    
    .sub-header {
        font-size: 1.2rem !important;
        color: #666666 !important;
        margin-bottom: 2rem !important;
        text-align: center !important;
        font-weight: 500 !important;
    }
    
    .section-header {
        font-size: 1.5rem !important;
        color: #333333 !important;
        margin-top: 1.5rem !important;
        margin-bottom: 1rem !important;
        font-weight: 700 !important;
        border-bottom: 3px solid #FF4B4B !important;
        padding-bottom: 0.5rem !important;
    }
    
    .badge-normal {
        background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%) !important;
        color: #155724 !important;
        padding: 0.4rem 1rem !important;
        border-radius: 25px !important;
        font-weight: 700 !important;
        display: inline-block !important;
        font-size: 0.9rem !important;
        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2) !important;
    }
    
    .badge-high {
        background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%) !important;
        color: #721c24 !important;
        padding: 0.4rem 1rem !important;
        border-radius: 25px !important;
        font-weight: 700 !important;
        display: inline-block !important;
        font-size: 0.9rem !important;
        box-shadow: 0 4px 15px rgba(220, 53, 69, 0.2) !important;
    }
    
    .badge-low {
        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%) !important;
        color: #856404 !important;
        padding: 0.4rem 1rem !important;
        border-radius: 25px !important;
        font-weight: 700 !important;
        display: inline-block !important;
        font-size: 0.9rem !important;
        box-shadow: 0 4px 15px rgba(255, 193, 7, 0.2) !important;
    }
    
    .risk-card {
        padding: 1.5rem !important;
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(10px) !important;
        border-radius: 20px !important;
        border-left: 4px solid #FF4B4B !important;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15) !important;
        margin: 0.5rem 0 !important;
        transition: all 0.3s ease !important;
    }
    
    .risk-card:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25) !important;
    }
    
    .risk-card strong {
        color: #333333 !important;
        font-size: 1.1rem !important;
    }
    
    .risk-card small {
        color: #666666 !important;
    }
    
    ::-webkit-scrollbar {
        width: 10px;
    }
    
    ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
    }
    
    ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #FF4B4B 0%, #FF6B6B 100%);
        border-radius: 5px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #FF6B6B 0%, #FF4B4B 100%);
    }
    
    </style>
""", unsafe_allow_html=True)

REFERENCE_RANGES = {
    "glucose": {"name": "Glucose (Fasting)", "display_unit": "mg/dL", "normal_range": (70, 100), "category": "Glucose Metabolism"},
    "glucose_random": {"name": "Glucose (Random)", "display_unit": "mg/dL", "normal_range": (70, 140), "category": "Glucose Metabolism"},
    "hba1c": {"name": "HbA1c", "display_unit": "%", "normal_range": (0, 5.7), "category": "Glucose Metabolism"},
    "hemoglobin": {"name": "Hemoglobin", "display_unit": "g/dL", "normal_range": (12.0, 17.5), "category": "Red Blood Cells"},
    "hematocrit": {"name": "Hematocrit", "display_unit": "%", "normal_range": (36, 46), "category": "Red Blood Cells"},
    "rbc": {"name": "Red Blood Cell Count", "display_unit": "million/µL", "normal_range": (4000000, 6000000), "category": "Red Blood Cells"},
    "mcv": {"name": "Mean Corpuscular Volume", "display_unit": "fL", "normal_range": (80, 100), "category": "Red Blood Cells"},
    "mch": {"name": "Mean Corpuscular Hemoglobin", "display_unit": "pg", "normal_range": (27, 33), "category": "Red Blood Cells"},
    "mchc": {"name": "Mean Corpuscular Hemoglobin Concentration", "display_unit": "g/dL", "normal_range": (32, 36), "category": "Red Blood Cells"},
    "wbc": {"name": "White Blood Cell Count", "display_unit": "cells/µL", "normal_range": (4000, 11000), "category": "White Blood Cells"},
    "neutrophils": {"name": "Neutrophils", "display_unit": "%", "normal_range": (50, 70), "category": "White Blood Cells"},
    "lymphocytes": {"name": "Lymphocytes", "display_unit": "%", "normal_range": (20, 40), "category": "White Blood Cells"},
    "monocytes": {"name": "Monocytes", "display_unit": "%", "normal_range": (2, 8), "category": "White Blood Cells"},
    "eosinophils": {"name": "Eosinophils", "display_unit": "%", "normal_range": (1, 4), "category": "White Blood Cells"},
    "basophils": {"name": "Basophils", "display_unit": "%", "normal_range": (0, 1), "category": "White Blood Cells"},
    "platelets": {"name": "Platelet Count", "display_unit": "cells/µL", "normal_range": (150000, 450000), "category": "Platelets"},
    "total_cholesterol": {"name": "Total Cholesterol", "display_unit": "mg/dL", "normal_range": (0, 200), "category": "Lipid Panel"},
    "hdl": {"name": "HDL Cholesterol", "display_unit": "mg/dL", "normal_range": (40, 300), "category": "Lipid Panel"},
    "ldl": {"name": "LDL Cholesterol", "display_unit": "mg/dL", "normal_range": (0, 100), "category": "Lipid Panel"},
    "triglycerides": {"name": "Triglycerides", "display_unit": "mg/dL", "normal_range": (0, 150), "category": "Lipid Panel"},
    "ast": {"name": "AST (Aspartate Aminotransferase)", "display_unit": "U/L", "normal_range": (10, 40), "category": "Liver Function"},
    "alt": {"name": "ALT (Alanine Aminotransferase)", "display_unit": "U/L", "normal_range": (7, 56), "category": "Liver Function"},
    "alkaline_phosphatase": {"name": "Alkaline Phosphatase", "display_unit": "U/L", "normal_range": (30, 120), "category": "Liver Function"},
    "bilirubin": {"name": "Total Bilirubin", "display_unit": "mg/dL", "normal_range": (0.1, 1.2), "category": "Liver Function"},
    "creatinine": {"name": "Creatinine", "display_unit": "mg/dL", "normal_range": (0.7, 1.3), "category": "Kidney Function"},
    "bun": {"name": "Blood Urea Nitrogen", "display_unit": "mg/dL", "normal_range": (7, 20), "category": "Kidney Function"},
    "sodium": {"name": "Sodium", "display_unit": "mEq/L", "normal_range": (136, 145), "category": "Electrolytes"},
    "potassium": {"name": "Potassium", "display_unit": "mEq/L", "normal_range": (3.5, 5.0), "category": "Electrolytes"},
    "chloride": {"name": "Chloride", "display_unit": "mEq/L", "normal_range": (98, 107), "category": "Electrolytes"},
    "iron": {"name": "Serum Iron", "display_unit": "µg/dL", "normal_range": (60, 170), "category": "Iron Metabolism"},
    "ferritin": {"name": "Ferritin", "display_unit": "ng/mL", "normal_range": (30, 300), "category": "Iron Metabolism"},
}


# =========================================
# HELPER FUNCTIONS
# =========================================

def extract_text_from_pdf(uploaded_file):
    """Extract text from PDF files using pdfplumber or PyPDF2."""
    if PDF_LIBRARY == "pdfplumber":
        try:
            extracted_text = ""
            page_count = 0
            with pdfplumber.open(uploaded_file) as pdf:
                page_count = len(pdf.pages)
                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text()
                    if page_text:
                        extracted_text += f"\n--- Page {page_num} ---\n{page_text}"
            if not extracted_text.strip():
                return {"status": "warning", "message": f"PDF loaded but no text found ({page_count} pages)", "text": ""}
            return {"status": "success", "message": f"Text extracted from {page_count} page(s)", "text": extracted_text, "page_count": page_count}
        except Exception as e:
            return {"status": "error", "message": f"Failed to extract PDF: {str(e)}"}
    else:
        return {"status": "error", "message": "PDF library not available"}

def extract_text_from_image(image):
    """Extract text from images using Tesseract OCR."""
    if not OCR_AVAILABLE:
        return {"status": "error", "message": "Tesseract OCR not installed"}
    try:
        extracted_text = pytesseract.image_to_string(image)
        if not extracted_text.strip():
            return {"status": "warning", "message": "No text detected in image", "text": ""}
        return {"status": "success", "message": f"Text extracted ({len(extracted_text)} characters)", "text": extracted_text}
    except Exception as e:
        return {"status": "error", "message": f"OCR extraction failed: {str(e)}"}

def extract_text_from_json(uploaded_file):
    """Extract and parse JSON files."""
    try:
        json_data = json.load(uploaded_file)
        json_text = json.dumps(json_data, indent=2)
        return {"status": "success", "message": "JSON loaded successfully", "text": json_text}
    except Exception as e:
        return {"status": "error", "message": f"Failed to parse JSON: {str(e)}"}

def parse_report_with_llm(raw_text, api_key, user_context=""):
    """Parse medical report using Groq LLM with max_tokens=8000 for large PDFs."""
    if not GROQ_AVAILABLE:
        return {"status": "error", "message": "Groq library is not installed"}
    if not api_key or api_key.strip() == "":
        return {"status": "error", "message": "Groq API key is required"}
    try:
        client = Groq(api_key=api_key)
        system_prompt = """You are an expert medical data extraction assistant. Extract all blood test parameters from the provided text.
        
Return ONLY a valid JSON object with this structure:
{
    "report_metadata": {"extraction_date": "YYYY-MM-DD", "total_parameters": number},
    "parameters": [{"name": "Parameter Name", "value": numeric_value, "unit": "Unit", "status": "Normal/High/Low"}],
    "summary": "Brief summary of findings"
}"""
        context_note = f"\nUser's Context: {user_context}" if user_context else ""
        user_message = f"""Please analyze this blood test report and extract all parameters into structured JSON format:

{raw_text}{context_note}

Remember: Return ONLY valid JSON, no additional text."""
        message = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=8000,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
        )
        response_text = message.choices[0].message.content.strip()
        try:
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text
            structured_data = json.loads(json_str)
            return {"status": "success", "message": "Report analyzed successfully", "data": structured_data}
        except json.JSONDecodeError as e:
            return {"status": "error", "message": f"Failed to parse LLM response: {str(e)}", "raw_response": response_text}
    except Exception as e:
        return {"status": "error", "message": f"LLM processing failed: {str(e)}"}

def get_parameter_status(value, param_key):
    """Determine if a parameter value is Normal, High, or Low."""
    if param_key not in REFERENCE_RANGES or value is None:
        return "Unknown"
    try:
        value = float(value)
        min_val, max_val = REFERENCE_RANGES[param_key]["normal_range"]
        if value < min_val:
            return "Low"
        elif value > max_val:
            return "High"
        else:
            return "Normal"
    except (ValueError, TypeError):
        return "Unknown"

def analyze_blood_data(extracted_json):
    """Analyze extracted blood data and categorize parameters."""
    analysis = {
        "parameters": [],
        "abnormal_findings": [],
        "summary": extracted_json.get("summary", "")
    }
    parameters = extracted_json.get("parameters", [])
    for param in parameters:
        name = param.get("name", "").lower()
        value = param.get("value")
        unit = param.get("unit", "")
        matched_key = None
        for ref_key in REFERENCE_RANGES.keys():
            if ref_key in name or name in ref_key:
                matched_key = ref_key
                break
        if matched_key:
            status = get_parameter_status(value, matched_key)
            ref_range = REFERENCE_RANGES[matched_key]["normal_range"]
            analysis["parameters"].append({
                "name": param.get("name", ""),
                "value": value,
                "unit": unit,
                "status": status,
                "reference_range": f"{ref_range[0]} - {ref_range[1]}"
            })
            if status in ["High", "Low"]:
                analysis["abnormal_findings"].append({
                    "parameter": param.get("name", ""),
                    "status": status,
                    "value": value,
                    "unit": unit
                })
    return analysis


def calculate_heart_risk(analysis_results):
    """Calculate cardiovascular risk based on cholesterol levels."""
    heart_risk = {
        "has_data": False,
        "total_cholesterol": None,
        "hdl": None,
        "ldl": None,
        "cholesterol_hdl_ratio": None,
        "risk_level": None,
        "risk_color": None
    }
    parameters = analysis_results.get("parameters", [])
    for param in parameters:
        name_lower = param.get("name", "").lower()
        value = param.get("value")
        if "total cholesterol" in name_lower:
            heart_risk["total_cholesterol"] = value
        elif "hdl" in name_lower:
            heart_risk["hdl"] = value
        elif "ldl" in name_lower:
            heart_risk["ldl"] = value
    if heart_risk["total_cholesterol"] and heart_risk["hdl"]:
        try:
            total_chol = float(heart_risk["total_cholesterol"])
            hdl = float(heart_risk["hdl"])
            heart_risk["cholesterol_hdl_ratio"] = round(total_chol / hdl, 2)
            ratio = heart_risk["cholesterol_hdl_ratio"]
            if ratio < 3.5:
                heart_risk["risk_level"] = "Optimal Risk"
                heart_risk["risk_color"] = "#28a745"
            elif ratio <= 5.0:
                heart_risk["risk_level"] = "Moderate Risk"
                heart_risk["risk_color"] = "#ffc107"
            else:
                heart_risk["risk_level"] = "High Risk"
                heart_risk["risk_color"] = "#dc3545"
            heart_risk["has_data"] = True
        except (ValueError, TypeError, ZeroDivisionError):
            pass
    return heart_risk

def generate_personalized_recommendations(analysis_results, heart_risk_data):
    """Generate personalized health recommendations based on analysis."""
    recommendations = []
    abnormal_findings = analysis_results.get("abnormal_findings", [])
    
    for finding in abnormal_findings:
        param_name = finding.get("parameter", "").lower()
        status = finding.get("status", "")
        
        if "glucose" in param_name:
            if status == "High":
                recommendations.append("🍎 Reduce sugar and refined carbohydrates intake")
                recommendations.append("🏃 Increase physical activity to 30 minutes daily")
            elif status == "Low":
                recommendations.append("🥛 Consume more complex carbohydrates")
        
        if "cholesterol" in param_name or "triglycerides" in param_name:
            if status == "High":
                recommendations.append("🥗 Increase fiber intake and reduce saturated fats")
                recommendations.append("🐟 Include omega-3 rich foods (fish, nuts)")
        
        if "hemoglobin" in param_name:
            if status == "Low":
                recommendations.append("🥩 Increase iron-rich foods (red meat, spinach)")
                recommendations.append("🍊 Consume vitamin C to enhance iron absorption")
        
        if "wbc" in param_name or "white blood cell" in param_name:
            if status == "High":
                recommendations.append("😴 Ensure adequate sleep (7-9 hours)")
                recommendations.append("🧘 Practice stress management techniques")
            elif status == "Low":
                recommendations.append("🥗 Maintain balanced nutrition")
                recommendations.append("💊 Consult healthcare provider for immune support")
    
    if heart_risk_data.get("has_data"):
        risk_level = heart_risk_data.get("risk_level", "")
        if "High" in risk_level:
            recommendations.append("❤️ Schedule regular cardiovascular check-ups")
            recommendations.append("🚫 Avoid smoking and limit alcohol")
        elif "Moderate" in risk_level:
            recommendations.append("❤️ Monitor cholesterol levels regularly")
            recommendations.append("🏃 Maintain regular exercise routine")
    
    return list(set(recommendations))[:5]

def generate_pdf_report(user_id, analysis_df, heart_risk_data, summary, recommendations):
    """Generate professional PDF report with color-coded tables."""
    if not FPDF_AVAILABLE:
        return None
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.set_fill_color(255, 75, 75)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Arial", "B", size=16)
        pdf.cell(0, 12, "Blood Test Analysis Report", ln=True, align="C", fill=True)
        pdf.set_draw_color(255, 75, 75)
        pdf.set_line_width(1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", size=10)
        pdf.cell(0, 5, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True, align="C")
        pdf.ln(5)
        pdf.set_font("Arial", "B", size=12)
        pdf.cell(0, 8, "Patient Information", ln=True)
        pdf.set_font("Arial", size=10)
        pdf.cell(0, 6, f"User ID: {user_id}", ln=True)
        pdf.ln(3)
        pdf.set_font("Arial", "B", size=12)
        pdf.cell(0, 8, "Clinical Summary", ln=True)
        pdf.set_font("Arial", size=10)
        pdf.multi_cell(0, 5, summary if summary else "No summary available")
        pdf.ln(3)
        if heart_risk_data.get("has_data"):
            pdf.set_font("Arial", "B", size=12)
            pdf.cell(0, 8, "Cardiovascular Health Assessment", ln=True)
            pdf.set_font("Arial", size=10)
            pdf.cell(0, 6, f"Total Cholesterol: {heart_risk_data.get('total_cholesterol', 'N/A')} mg/dL", ln=True)
            pdf.cell(0, 6, f"HDL Cholesterol: {heart_risk_data.get('hdl', 'N/A')} mg/dL", ln=True)
            pdf.cell(0, 6, f"LDL Cholesterol: {heart_risk_data.get('ldl', 'N/A')} mg/dL", ln=True)
            pdf.cell(0, 6, f"Cholesterol/HDL Ratio: {heart_risk_data.get('cholesterol_hdl_ratio', 'N/A')}", ln=True)
            pdf.cell(0, 6, f"Risk Level: {heart_risk_data.get('risk_level', 'N/A')}", ln=True)
            pdf.ln(3)
        pdf.set_font("Arial", "B", size=12)
        pdf.cell(0, 8, "Blood Parameters", ln=True)
        pdf.set_font("Arial", "B", size=9)
        pdf.set_fill_color(255, 75, 75)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(40, 6, "Parameter", border=1, fill=True)
        pdf.cell(25, 6, "Value", border=1, fill=True)
        pdf.cell(25, 6, "Unit", border=1, fill=True)
        pdf.cell(30, 6, "Status", border=1, fill=True)
        pdf.cell(40, 6, "Reference Range", border=1, fill=True, ln=True)
        pdf.set_font("Arial", size=8)
        for idx, row in analysis_df.iterrows():
            param_name = str(row.get("Parameter", ""))[:35]
            value = str(row.get("Value", ""))[:20]
            unit = str(row.get("Unit", ""))[:20]
            status = str(row.get("Status", ""))[:25]
            ref_range = str(row.get("Reference Range", ""))[:35]
            if status == "High" or status == "Low":
                pdf.set_text_color(220, 53, 69)
            else:
                pdf.set_text_color(0, 0, 0)
            pdf.cell(40, 6, param_name, border=1)
            pdf.cell(25, 6, value, border=1)
            pdf.cell(25, 6, unit, border=1)
            pdf.cell(30, 6, status, border=1)
            pdf.cell(40, 6, ref_range, border=1, ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(3)
        if recommendations:
            pdf.set_font("Arial", "B", size=12)
            pdf.cell(0, 8, "Personalized Recommendations", ln=True)
            pdf.set_font("Arial", size=9)
            for rec in recommendations:
                pdf.multi_cell(0, 5, f"• {rec}")
            pdf.ln(2)
        pdf.set_font("Arial", "B", size=10)
        pdf.cell(0, 8, "IMPORTANT DISCLAIMER", ln=True)
        pdf.set_font("Arial", size=8)
        disclaimer_text = "This is an AI-generated interpretation based on blood test values. It is NOT a medical diagnosis. Please consult a qualified healthcare professional for proper medical advice, diagnosis, and treatment."
        pdf.multi_cell(0, 4, disclaimer_text)
        return bytes(pdf.output())
    except Exception as e:
        st.error(f"Failed to generate PDF: {str(e)}")
        return None

def save_report_to_db(user_id, file_name, extracted_json, user_context):
    """Save report to Supabase database."""
    if not SUPABASE_AVAILABLE:
        return {"status": "error", "message": "Supabase library is not installed"}
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        if not supabase_url or not supabase_key:
            return {"status": "error", "message": "Supabase credentials not configured"}
        client = create_client(supabase_url, supabase_key)
        report_data = {
            "user_id": user_id,
            "file_name": file_name,
            "extracted_data": extracted_json,
            "user_context": user_context,
            "created_at": datetime.now().isoformat()
        }
        response = client.table("blood_reports").insert(report_data).execute()
        return {"status": "success", "message": "Report saved to database successfully", "data": response.data}
    except Exception as e:
        return {"status": "error", "message": f"Failed to save report: {str(e)}"}


# =========================================
# SESSION STATE INITIALIZATION
# =========================================

if "analyzed_data" not in st.session_state:
    st.session_state["analyzed_data"] = None
if "full_text" not in st.session_state:
    st.session_state["full_text"] = None
if "user_context" not in st.session_state:
    st.session_state["user_context"] = ""
if "uploaded_file_name" not in st.session_state:
    st.session_state["uploaded_file_name"] = None
if "medical_analysis" not in st.session_state:
    st.session_state["medical_analysis"] = None
if "recommendations" not in st.session_state:
    st.session_state["recommendations"] = []

# =========================================
# SIDEBAR NAVIGATION
# =========================================

st.sidebar.title("🏥 Health Diagnostics")
selected_page = st.sidebar.radio("Navigation", ["🏠 Home", "📋 Upload Report", "⚙️ Settings"], label_visibility="collapsed")
st.sidebar.markdown("---")
st.sidebar.markdown("<p style='text-align: center; color: #666666; font-size: 0.9rem;'>v2.0 - Week 6 Final Polish</p>", unsafe_allow_html=True)

# =========================================
# HOME PAGE
# =========================================

if selected_page == "🏠 Home":
    st.markdown("<div class='hero-card'><div class='hero-icon'>🏥</div><h1>AI Health Diagnostics Agent</h1><p class='hero-subtitle'>Upload your blood report to get instant insights powered by advanced AI</p><div class='feature-list'><div class='feature-item'>✅ Universal report ingestion (PDF, Images, JSON)</div><div class='feature-item'>✅ AI-powered data extraction</div><div class='feature-item'>✅ Medical analysis with 30+ parameters</div><div class='feature-item'>✅ Cardiovascular risk assessment</div><div class='feature-item'>✅ Personalized recommendations</div><div class='feature-item'>✅ Professional PDF reports</div></div></div>", unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown("<h2 class='section-header'>How It Works</h2>", unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("""
        <div class='premium-card'>
        <h3>📤 Upload</h3>
        <p>Upload your blood test report in PDF, image, or JSON format</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class='premium-card'>
        <h3>🤖 Analyze</h3>
        <p>Our AI extracts and analyzes all blood parameters instantly</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class='premium-card'>
        <h3>📊 Insights</h3>
        <p>Get personalized recommendations and professional reports</p>
        </div>
        """, unsafe_allow_html=True)


# =========================================
# UPLOAD & ANALYSIS PAGE
# =========================================

elif selected_page == "📋 Upload Report":
    st.markdown("<h1 class='main-header'>📋 Blood Report Analysis</h1>", unsafe_allow_html=True)
    st.markdown("<p class='sub-header'>Upload your blood test report and get comprehensive analysis</p>", unsafe_allow_html=True)
    
    uploaded_file = st.file_uploader("Upload your blood report", type=["pdf", "png", "jpg", "jpeg", "json"], help="Supported formats: PDF, PNG, JPG, JPEG, JSON")
    user_context = st.text_area("Tell us about your symptoms or reason for the test", placeholder="E.g., 'Feeling fatigued for 2 weeks'", height=80)
    
    if uploaded_file:
        st.session_state["uploaded_file_name"] = uploaded_file.name
        st.session_state["user_context"] = user_context
        
        if uploaded_file.type == "application/pdf":
            extraction_result = extract_text_from_pdf(uploaded_file)
        elif uploaded_file.type in ["image/png", "image/jpeg"]:
            image = Image.open(uploaded_file)
            extraction_result = extract_text_from_image(image)
        elif uploaded_file.type == "application/json":
            extraction_result = extract_text_from_json(uploaded_file)
        else:
            extraction_result = {"status": "error", "message": "Unsupported file type"}
        
        if extraction_result["status"] in ["success", "warning"]:
            if extraction_result["status"] == "success":
                st.success(f"✅ {extraction_result['message']}")
            else:
                st.warning(f"⚠️ {extraction_result['message']}")
            st.session_state["full_text"] = extraction_result.get("text", "")
            with st.expander("📄 View Raw Extracted Text"):
                st.text_area("Extracted content:", value=st.session_state["full_text"], height=200, disabled=True, label_visibility="collapsed")
        else:
            st.error(f"❌ {extraction_result['message']}")
        
        st.markdown("---")
        if st.button("🔍 Analyze with AI", use_container_width=True):
            if not st.session_state["full_text"]:
                st.error("❌ No text to analyze.")
            else:
                with st.spinner("🤖 AI is analyzing your report..."):
                    groq_api_key = os.getenv("GROQ_API_KEY")
                    if not groq_api_key:
                        st.error("❌ Groq API key not configured.")
                    else:
                        llm_result = parse_report_with_llm(st.session_state["full_text"], groq_api_key, st.session_state["user_context"])
                        if llm_result["status"] == "error":
                            st.error(f"❌ Analysis Failed: {llm_result['message']}")
                        else:
                            extracted_json = llm_result.get("data", {})
                            medical_analysis = analyze_blood_data(extracted_json)
                            st.session_state["medical_analysis"] = medical_analysis
                            heart_risk = calculate_heart_risk(medical_analysis)
                            recommendations = generate_personalized_recommendations(medical_analysis, heart_risk)
                            st.session_state["recommendations"] = recommendations
                            st.session_state["analyzed_data"] = {
                                "extracted_json": extracted_json,
                                "medical_analysis": medical_analysis,
                                "heart_risk": heart_risk
                            }
                            st.success("✅ Analysis complete!")
        
        if st.session_state["analyzed_data"]:
            st.markdown("---")
            st.markdown("<h2 class='section-header'>📊 Medical Analysis Results</h2>", unsafe_allow_html=True)
            medical_analysis = st.session_state["analyzed_data"]["medical_analysis"]
            heart_risk = st.session_state["analyzed_data"]["heart_risk"]
            
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("Abnormal Values", len(medical_analysis.get("abnormal_findings", [])))
            with col2:
                st.metric("Total Parameters", len(medical_analysis.get("parameters", [])))
            with col3:
                if heart_risk.get("has_data"):
                    st.metric("Cholesterol/HDL", heart_risk.get("cholesterol_hdl_ratio", "N/A"))
                else:
                    st.metric("Cholesterol/HDL", "N/A")
            with col4:
                if heart_risk.get("has_data"):
                    st.metric("Risk Level", heart_risk.get("risk_level", "N/A"))
                else:
                    st.metric("Risk Level", "N/A")
            
            st.markdown("---")
            st.markdown("<h3 class='section-header'>📋 Blood Parameters</h3>", unsafe_allow_html=True)
            if medical_analysis.get("parameters"):
                analysis_df = pd.DataFrame([
                    {
                        "Parameter": p.get("name", ""),
                        "Value": p.get("value", ""),
                        "Unit": p.get("unit", ""),
                        "Status": p.get("status", ""),
                        "Reference Range": p.get("reference_range", "")
                    }
                    for p in medical_analysis["parameters"]
                ])
                st.dataframe(analysis_df, use_container_width=True, hide_index=True)
            
            if medical_analysis.get("abnormal_findings"):
                st.markdown("---")
                st.markdown("<h3 class='section-header'>⚠️ Abnormal Values</h3>", unsafe_allow_html=True)
                for finding in medical_analysis["abnormal_findings"]:
                    color = "#dc3545" if finding["status"] == "High" else "#ffc107"
                    badge_class = "badge-high" if finding["status"] == "High" else "badge-low"
                    st.markdown(f"<div class='risk-card'><strong>{finding['parameter']}</strong> <span class='{badge_class}'>{finding['status']}</span><br><small>{finding['value']} {finding['unit']}</small></div>", unsafe_allow_html=True)
            
            if heart_risk.get("has_data"):
                st.markdown("---")
                st.markdown("<h3 class='section-header'>❤️ Cardiovascular Risk Assessment</h3>", unsafe_allow_html=True)
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Total Cholesterol", f"{heart_risk['total_cholesterol']} mg/dL")
                with col2:
                    st.metric("HDL Cholesterol", f"{heart_risk['hdl']} mg/dL")
                with col3:
                    st.metric("LDL Cholesterol", f"{heart_risk.get('ldl', 'N/A')} mg/dL")
                st.markdown(f"**Risk Level:** {heart_risk['risk_level']} (Ratio: {heart_risk['cholesterol_hdl_ratio']})")
            
            if st.session_state["recommendations"]:
                st.markdown("---")
                st.markdown("<h3 class='section-header'>💡 Personalized Recommendations</h3>", unsafe_allow_html=True)
                for rec in st.session_state["recommendations"]:
                    st.markdown(f"<div class='premium-card'>{rec}</div>", unsafe_allow_html=True)
            
            if medical_analysis.get("summary"):
                st.markdown("---")
                st.markdown("<h3 class='section-header'>📋 Clinical Summary</h3>", unsafe_allow_html=True)
                st.info(medical_analysis["summary"])
            
            st.markdown("---")
            st.markdown("<h3 class='section-header'>📥 Export Report</h3>", unsafe_allow_html=True)
            col1, col2 = st.columns(2)
            with col1:
                analysis_df = pd.DataFrame([
                    {
                        "Parameter": p.get("name", ""),
                        "Value": p.get("value", ""),
                        "Unit": p.get("unit", ""),
                        "Status": p.get("status", ""),
                        "Reference Range": p.get("reference_range", "")
                    }
                    for p in medical_analysis.get("parameters", [])
                ])
                pdf_bytes = generate_pdf_report(
                    "patient_001",
                    analysis_df,
                    heart_risk,
                    medical_analysis.get("summary", ""),
                    st.session_state["recommendations"]
                )
                if pdf_bytes:
                    st.download_button(
                        label="📥 Download PDF Report",
                        data=pdf_bytes,
                        file_name=f"blood_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
                        mime="application/pdf",
                        use_container_width=True
                    )
            
            with col2:
                if st.button("💾 Save to Database", use_container_width=True):
                    with st.spinner("Saving to database..."):
                        save_result = save_report_to_db(
                            "patient_001",
                            st.session_state["uploaded_file_name"],
                            st.session_state["analyzed_data"]["extracted_json"],
                            st.session_state["user_context"]
                        )
                        if save_result["status"] == "success":
                            st.success("✅ Report saved to database successfully!")
                        else:
                            st.error(f"❌ Failed to save: {save_result['message']}")


# =========================================
# SETTINGS PAGE
# =========================================

elif selected_page == "⚙️ Settings":
    st.markdown("<h1 class='main-header'>⚙️ Configuration Settings</h1>", unsafe_allow_html=True)
    
    st.markdown("<h3 class='section-header'>🔑 Groq API Configuration</h3>", unsafe_allow_html=True)
    groq_api_key = st.text_input("Groq API Key", value=os.getenv("GROQ_API_KEY", ""), type="password", placeholder="Enter your Groq API key")
    if groq_api_key:
        st.success("✅ API key configured")
    else:
        st.warning("⚠️ No API key found. Get one from https://console.groq.com/keys")
    
    st.markdown("---")
    st.markdown("<h3 class='section-header'>☁️ Supabase Configuration (Optional)</h3>", unsafe_allow_html=True)
    supabase_url = st.text_input("Supabase URL", value=os.getenv("SUPABASE_URL", ""), placeholder="https://your-project.supabase.co")
    supabase_key = st.text_input("Supabase API Key", value=os.getenv("SUPABASE_KEY", ""), type="password", placeholder="Enter your Supabase API key")
    
    if st.button("🧪 Test Supabase Connection", use_container_width=True):
        with st.spinner("Testing connection..."):
            try:
                if not supabase_url or not supabase_key:
                    st.warning("⚠️ Please enter both Supabase URL and API Key.")
                else:
                    client = create_client(supabase_url, supabase_key)
                    st.success("✅ Supabase connection successful!")
            except Exception as e:
                st.error(f"❌ Connection failed: {str(e)}")
    
    st.markdown("---")
    st.markdown("<h3 class='section-header'>ℹ️ About This Application</h3>", unsafe_allow_html=True)
    st.markdown("""
    **AI Health Diagnostics Agent** - Week 6: Final Polish
    
    **What's Implemented:**
    - ✅ Universal report ingestion (PDF, Images, JSON)
    - ✅ AI-powered data extraction with Groq LLM (8000 tokens)
    - ✅ Blood parameter analysis (30+ parameters)
    - ✅ Cardiovascular risk assessment
    - ✅ Personalized recommendations
    - ✅ Professional PDF report generation
    - ✅ Supabase database integration
    - ✅ Red pill glassmorphism UI design
    - ✅ Enhanced error handling
    
    **Development Progress:**
    - ✅ Week 1: UI & Structure
    - ✅ Week 2: Data Ingestion
    - ✅ Week 3: AI Integration
    - ✅ Week 4: Medical Logic
    - ✅ Week 5: Persistence & Reporting
    - ✅ Week 6: Final Polish (Current)
    """)
