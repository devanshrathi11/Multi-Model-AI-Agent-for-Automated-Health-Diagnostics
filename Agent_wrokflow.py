import json
from typing import Dict, List, Any

class HealthDiagnosticsAgent:
    def __init__(self):
        # Reference ranges for Task 3 (Model 1) 
        self.reference_ranges = {
            "glucose": {"min": 70, "max": 99, "unit": "mg/dL"},
            "cholesterol": {"min": 0, "max": 200, "unit": "mg/dL"},
            "hemoglobin": {"min": 13.8, "max": 17.2, "unit": "g/dL"}
        }

    def task_1_input_reception(self, file_path: str) -> Dict[str, Any]:
        """
        Receives the user's blood report. In a real scenario, this handles 
        PDFs or Images. Here we simulate receiving raw structured data.
        Ref: 
        """
        print(f"--- Task 1: Receiving Input from {file_path} ---")
        # Simulating reading a raw file (mocking the parsing of a PDF)
        raw_data = {
            "patient_id": "12345",
            "raw_text": "Glucose: 110 mg/dL, Cholesterol: 240 mg/dL, Hemoglobin: 14 g/dL"
        }
        print("Input received successfully.")
        return raw_data

    def task_2_data_extraction(self, raw_input: Dict[str, Any]) -> Dict[str, float]:
        """
        Extracts relevant parameters, cleans data, and standardizes units.
        Ref: [cite: 17, 19]
        """
        print("--- Task 2: Extraction & Preprocessing ---")
        # Simulating extraction logic (e.g., Regex or OCR post-processing)
        # In a real app, this would parse the 'raw_text' string.
        extracted_data = {
            "glucose": 110.0,      # Extracted value
            "cholesterol": 240.0,  # Extracted value
            "hemoglobin": 14.0     # Extracted value
        }
        
        # Validation: Ensure values are plausible 
        for key, value in extracted_data.items():
            if value < 0:
                raise ValueError(f"Invalid value for {key}")
                
        print(f"Extracted Data: {extracted_data}")
        return extracted_data

    def task_3_multi_model_analysis(self, clean_data: Dict[str, float]) -> List[Dict[str, Any]]:
        """
        Model 1: Compare against reference ranges (Parameter Interpretation).
        Model 2: Identify patterns/risk (Risk Assessment).
        Ref: [cite: 20, 21, 23]
        """
        print("--- Task 3: Multi-Model Analysis ---")
        analysis_results = []

        # Model 1 Logic: Parameter Interpretation 
        for param, value in clean_data.items():
            ref = self.reference_ranges.get(param)
            if ref:
                status = "Normal"
                if value < ref['min']: status = "Low"
                if value > ref['max']: status = "High"
                
                analysis_results.append({
                    "parameter": param,
                    "value": value,
                    "status": status,
                    "model_source": "Model 1 (Interpretation)"
                })

        # Model 2 Logic: Pattern Recognition 
        # Example Pattern: High Glucose + High Cholesterol = Metabolic Risk
        glucose_status = next((x['status'] for x in analysis_results if x['parameter'] == 'glucose'), "Normal")
        cholesterol_status = next((x['status'] for x in analysis_results if x['parameter'] == 'cholesterol'), "Normal")

        if glucose_status == "High" and cholesterol_status == "High":
            analysis_results.append({
                "pattern": "Metabolic Risk Warning",
                "risk_score": "Elevated",
                "details": "Combined high glucose and cholesterol detected.",
                "model_source": "Model 2 (Pattern Recognition)"
            })
            
        return analysis_results

    def task_4_synthesize_findings(self, analysis_results: List[Dict[str, Any]]) -> str:
        """
        Aggregates outputs from models into a comprehensive summary.
        Ref: 
        """
        print("--- Task 4: Synthesizing Findings ---")
        summary_lines = []
        abnormalities = [item for item in analysis_results if 'status' in item and item['status'] != 'Normal']
        patterns = [item for item in analysis_results if 'pattern' in item]

        if not abnormalities and not patterns:
            return "All parameters are within normal range. No specific risks identified."

        summary_lines.append("Key Findings:")
        for item in abnormalities:
            summary_lines.append(f"- {item['parameter'].capitalize()} is {item['status']} ({item['value']}).")
        
        for item in patterns:
            summary_lines.append(f"- RISK ALERT: {item['pattern']} - {item['details']}")

        final_summary = "\n".join(summary_lines)
        print("Synthesis Complete.")
        return final_summary

    def task_5_generate_recommendations(self, synthesis_summary: str) -> List[str]:
        """
        Generates actionable advice based on the synthesized findings.
        Ref: 
        """
        print("--- Task 5: Generating Recommendations ---")
        recommendations = []

        # Logic to map findings to recommendations
        if "Glucose is High" in synthesis_summary:
            recommendations.append("Diet: Reduce intake of sugary foods and refined carbohydrates.")
        if "Cholesterol is High" in synthesis_summary:
            recommendations.append("Lifestyle: Increase cardiovascular exercise (e.g., walking, running).")
        if "Metabolic Risk" in synthesis_summary:
            recommendations.append("Action: Consult a healthcare professional for a comprehensive metabolic evaluation.")

        if not recommendations:
            recommendations.append("Maintain current healthy lifestyle habits.")

        print(f"Generated {len(recommendations)} recommendations.")
        return recommendations

if __name__ == "__main__":
    agent = HealthDiagnosticsAgent()
    
    # Execute the 5-Step Workflow
    # 1. Input
    raw_input = agent.task_1_input_reception("patient_report_001.pdf")
    
    # 2. Extraction
    clean_data = agent.task_2_data_extraction(raw_input)
    
    # 3. Analysis
    analysis_results = agent.task_3_multi_model_analysis(clean_data)
    
    # 4. Synthesis
    summary = agent.task_4_synthesize_findings(analysis_results)
    print(f"\n[Summary Report]:\n{summary}\n")
    
    # 5. Recommendations
    recommendations = agent.task_5_generate_recommendations(summary)
    print("\n[Recommendations]:")
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec}")
