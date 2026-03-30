import os
from dotenv import load_dotenv
from openai import OpenAI
from dataclasses import dataclass
from typing import List

# -------------------- MODELS --------------------

@dataclass
class BloodParameter:
    id: int
    name: str
    value: float
    flag: str  # "High", "Low", "Normal"


@dataclass
class PatientContext:
    age: int
    gender: str
    dietary_preferences: str


@dataclass
class AnalysisResult:
    risk_score: float
    patterns: List[str]


@dataclass
class Recommendation:
    category: str
    text: str
    linked_param_id: int


# -------------------- ENGINE --------------------

load_dotenv()


class SynthesisEngine:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.client = (
            OpenAI(
                api_key=self.api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            if self.api_key else None
        )

    def generate_findings_summary(
        self,
        params: List[BloodParameter],
        analysis: AnalysisResult,
        context: PatientContext
    ) -> str:

        if not self.client:
            return (
                "Mocked AI Summary: The analysis indicates notable deviations in key "
                "metabolic markers. Please review the detailed recommendations below."
            )

        prompt = f"""
Patient Context: {context.age}yo {context.gender}, Diet: {context.dietary_preferences}.
Risk Score: {analysis.risk_score}
Patterns: {', '.join(analysis.patterns)}
Key Parameters: {[(p.name, p.value, p.flag) for p in params[:5]]}

Generate a concise, professional 2-sentence clinical summary of these blood test results.
"""

        try:
            response = self.client.chat.completions.create(
                model="meta-llama/llama-3.1-8b-instruct:free",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
                extra_headers={
                    "HTTP-Referer": "http://localhost",
                    "X-Title": "Blood Analysis Engine"
                }
            )
            return response.choices[0].message.content.strip()

        except Exception as e:
            return f"AI Summary Error: {str(e)}"

    def generate_recommendations(
        self,
        params: List[BloodParameter],
        context: PatientContext
    ) -> List[Recommendation]:

        recommendations = []

        for param in params:
            if param.flag == "Normal":
                continue

            rec_text = ""
            category = "Medical Consultation"

            if param.name == "LDL" and param.flag == "High":
                category = "Diet"
                if "Vegan" in context.dietary_preferences:
                    rec_text = (
                        "Limit processed vegan foods and tropical oils. "
                        "Increase soluble fiber intake from oats and legumes."
                    )
                else:
                    rec_text = (
                        "Reduce saturated fat intake and increase omega-3 rich foods."
                    )

            elif param.name == "Glucose" and param.flag == "High":
                category = "Lifestyle"
                rec_text = (
                    "Prioritize low-glycemic foods and include 30 minutes of "
                    "moderate exercise after meals."
                )

            elif param.name == "Vitamin D" and param.flag == "Low":
                category = "Diet"
                if "Vegan" in context.dietary_preferences:
                    rec_text = (
                        "Use fortified plant milks or UV-exposed mushrooms. "
                        "Supplementation may be necessary."
                    )
                else:
                    rec_text = (
                        "Increase fatty fish intake or consider supplementation "
                        "alongside regular sunlight exposure."
                    )

            elif param.name == "Hemoglobin" and param.flag == "Low":
                category = "Diet"
                if "Vegan" in context.dietary_preferences:
                    rec_text = (
                        "Increase iron intake from lentils, tofu, and leafy greens. "
                        "Pair with vitamin C sources."
                    )
                else:
                    rec_text = (
                        "Increase iron intake through lean red meat or fortified foods."
                    )

            elif param.name == "Triglycerides" and param.flag == "High":
                category = "Lifestyle"
                rec_text = (
                    "Reduce refined sugars and alcohol. Emphasize complex carbohydrates "
                    "and regular physical activity."
                )

            if rec_text:
                recommendations.append(
                    Recommendation(
                        category=category,
                        text=rec_text,
                        linked_param_id=param.id
                    )
                )

        return recommendations


# -------------------- OPTIONAL TEST --------------------

if __name__ == "__main__":
    engine = SynthesisEngine()

    params = [
        BloodParameter(1, "LDL", 165, "High"),
        BloodParameter(2, "Glucose", 118, "High"),
        BloodParameter(3, "Vitamin D", 18, "Low"),
    ]

    context = PatientContext(
        age=45,
        gender="Male",
        dietary_preferences="Vegan"
    )

    analysis = AnalysisResult(
        risk_score=0.72,
        patterns=["Dyslipidemia", "Impaired glucose regulation"]
    )

    print(engine.generate_findings_summary(params, analysis, context))
    print(engine.generate_recommendations(params, context))
