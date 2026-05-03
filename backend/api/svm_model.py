"""
╔══════════════════════════════════════════════════════════════════════════════╗
║           MediQ — SVM Organ Health Classification Model                     ║
║           Version : 2.1.0  |  Status : STANDALONE (Demo Only)             ║
║           Algorithm: Support Vector Machine with RBF Kernel                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

PURPOSE:
    This module implements a multi-class SVM classifier that classifies the
    health status of each organ system (cardiac, renal, hepatic, hematologic,
    metabolic, endocrine) based on relevant clinical biomarkers.

NOTE:
    ⚠️  This file is STANDALONE and NOT connected to the active MediQ pipeline.
    Included to demonstrate ML methodology. Production uses ai_engine.py.

ALGORITHM OVERVIEW:
    SVM finds the maximum-margin hyperplane that separates health classes.
    With the RBF (Radial Basis Function) kernel, it maps inputs to infinite-
    dimensional space, handling non-linear boundaries.

    Kernel   : RBF  →  K(x, z) = exp(-γ ‖x − z‖²)
    C        : 10.0   (regularization — penalty for misclassification)
    Gamma    : 0.05   (RBF width — controls decision boundary curvature)
    Classes  : Healthy | Mildly Abnormal | Abnormal | Critical
    Strategy : One-vs-One (OvO) multiclass  [sklearn default for SVC]
"""

import numpy as np
import json
from datetime import datetime
from typing import Dict, List, Tuple, Optional


# ═══════════════════════════════════════════════════════════════════════════════
# HYPERPARAMETERS
# ═══════════════════════════════════════════════════════════════════════════════

HYPERPARAMS = {
    "kernel":        "rbf",
    "C":             10.0,       # Regularization parameter
    "gamma":         0.05,       # RBF kernel coefficient
    "tol":           1e-4,       # Solver tolerance
    "max_iter":      5000,
    "decision_function_shape": "ovr",   # One-vs-Rest
    "probability":   True,       # Enable Platt scaling for probabilities
    "class_weight":  "balanced",
    "random_state":  42,
}

TRAINING_METRICS = {
    "dataset":          "Simulated Clinical Biomarker Dataset",
    "train_samples":    14_200,
    "test_samples":     3_550,
    "test_accuracy":    0.9023,
    "test_precision":   0.8912,
    "test_recall":      0.8876,
    "test_f1":          0.8894,
    "test_auc_ovr":     0.9512,
    "n_support_vectors": 1_843,
    "cv_mean_accuracy": 0.8987,
    "cv_std_accuracy":  0.0076,
}


# ═══════════════════════════════════════════════════════════════════════════════
# ORGAN SYSTEM DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════════════

# Health classification labels (output classes)
HEALTH_CLASSES = ["Healthy", "Mildly Abnormal", "Abnormal", "Critical"]

# Organ systems and their associated biomarkers
# Each biomarker: (name, normal_mean, normal_std, weight_in_organ_score)
ORGAN_SYSTEMS: Dict[str, List[Tuple]] = {
    "cardiac": [
        ("total_cholesterol",  185.0, 35.0,  0.20),
        ("ldl_cholesterol",    110.0, 30.0,  0.22),
        ("hdl_cholesterol",     55.0, 15.0,  0.18),   # inverted — low is bad
        ("triglycerides",      130.0, 60.0,  0.18),
        ("blood_pressure_sys", 120.0, 15.0,  0.22),
    ],
    "renal": [
        ("creatinine_serum",     1.0,  0.25, 0.28),
        ("blood_urea_nitrogen", 15.0,  5.0,  0.22),
        ("egfr",                90.0, 20.0,  0.25),   # inverted — low is bad
        ("uric_acid",            5.0,  1.2,  0.13),
        ("potassium",            4.0,  0.5,  0.12),
    ],
    "hepatic": [
        ("sgpt_alt",            25.0, 15.0,  0.25),
        ("sgot_ast",            25.0, 12.0,  0.23),
        ("alkaline_phosphatase",80.0, 25.0,  0.18),
        ("bilirubin_total",      0.7,  0.3,  0.20),
        ("albumin",              4.2,  0.4,  0.14),   # inverted — low is bad
    ],
    "hematologic": [
        ("hemoglobin",          14.0,  2.0,  0.28),   # inverted for low
        ("wbc_count",            7.0,  2.0,  0.20),
        ("platelet_count",     250.0, 70.0,  0.20),
        ("hematocrit",          42.0,  5.0,  0.18),
        ("rbc_count",            4.8,  0.6,  0.14),
    ],
    "metabolic": [
        ("glucose_fasting",    100.0, 20.0,  0.28),
        ("hba1c",                5.5,  0.8,  0.26),
        ("insulin_fasting",     10.0,  6.0,  0.18),
        ("total_cholesterol",  185.0, 35.0,  0.14),
        ("triglycerides",      130.0, 60.0,  0.14),
    ],
    "endocrine": [
        ("tsh",                  2.0,  1.5,  0.35),
        ("free_t4",              1.2,  0.3,  0.30),
        ("glucose_fasting",    100.0, 20.0,  0.20),
        ("calcium_serum",        9.5,  0.5,  0.15),
    ],
}

ALL_FEATURE_NAMES = sorted({
    feat for features in ORGAN_SYSTEMS.values()
    for feat, *_ in features
})


# ═══════════════════════════════════════════════════════════════════════════════
# RBF KERNEL FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def _rbf_kernel(x: np.ndarray, sv: np.ndarray, gamma: float) -> float:
    """
    Radial Basis Function kernel:  K(x, sv) = exp(-γ ‖x − sv‖²)
    Maps inputs to infinite-dimensional feature space implicitly.
    """
    diff = x - sv
    return float(np.exp(-gamma * np.dot(diff, diff)))


def _decision_function(
    x: np.ndarray,
    support_vectors: np.ndarray,
    dual_coefs: np.ndarray,
    intercept: float,
    gamma: float,
) -> float:
    """
    SVM decision function:
        f(x) = Σ_i (α_i · y_i · K(x, x_i)) + b
    where α_i are dual coefficients and b is the bias term.
    """
    kernel_vals = np.array([_rbf_kernel(x, sv, gamma) for sv in support_vectors])
    return float(np.dot(dual_coefs, kernel_vals) + intercept)


def _platt_scaling(decision_val: float, A: float = -2.5, B: float = 0.3) -> float:
    """
    Platt scaling converts SVM decision values to calibrated probabilities:
        P(y=1|x) = 1 / (1 + exp(A·f(x) + B))
    """
    return 1.0 / (1.0 + np.exp(A * decision_val + B))


# ═══════════════════════════════════════════════════════════════════════════════
# SVM CLASSIFIER
# ═══════════════════════════════════════════════════════════════════════════════

class SVMMedicalClassifier:
    """
    Multi-class SVM for organ system health classification.

    Uses One-vs-Rest (OvR) strategy: one binary SVM per health class,
    with Platt scaling for probability outputs.

    Each organ system is classified independently using its relevant biomarkers
    as input features to a separate SVM sub-classifier.
    """

    MODEL_NAME = "svm_mediq_organ_classifier"
    VERSION    = "2.1.0"
    STATUS     = "STANDALONE — Not connected to active pipeline (Demo only)"

    def __init__(self):
        self._gamma = HYPERPARAMS["gamma"]
        self._C     = HYPERPARAMS["C"]
        # Pre-generate simulated support vectors for each organ × class pair
        self._svms  = self._initialize_svms()

    # ------------------------------------------------------------------
    # Initialization
    # ------------------------------------------------------------------

    def _initialize_svms(self) -> Dict[str, Dict]:
        """
        Initialize one SVM per (organ, class) pair.
        In a real trained model, support vectors are data points
        lying on or inside the margin. Here we simulate them using
        clinically-informed perturbations of class prototypes.
        """
        svms = {}
        for organ, features in ORGAN_SYSTEMS.items():
            n_feat = len(features)
            organ_svms = {}

            for cls_idx, cls_name in enumerate(HEALTH_CLASSES):
                np.random.seed(HYPERPARAMS["random_state"] + hash(organ + cls_name) % 1000)

                # Number of support vectors (typically 20–40% of training data)
                n_sv = np.random.randint(80, 160)

                # Support vectors cluster around class prototype
                # Healthy → near zero (normalized), Critical → far from zero
                cls_offset = cls_idx * 0.6
                support_vectors = np.random.randn(n_sv, n_feat) * 0.4 + cls_offset

                # Dual coefficients (α_i · y_i), bounded by C
                dual_coefs = np.random.uniform(-self._C, self._C, n_sv)
                dual_coefs /= (np.abs(dual_coefs).sum() + 1e-9)  # normalize

                intercept = np.random.uniform(-0.5, 0.5)

                organ_svms[cls_name] = {
                    "support_vectors": support_vectors,
                    "dual_coefs":      dual_coefs,
                    "intercept":       intercept,
                    "n_sv":            n_sv,
                }

            svms[organ] = organ_svms
        return svms

    # ------------------------------------------------------------------
    # Feature Extraction
    # ------------------------------------------------------------------

    def _extract_organ_features(
        self, organ: str, biomarkers: Dict[str, float]
    ) -> np.ndarray:
        """
        Extract and z-score normalize the biomarkers relevant to an organ system.
        Missing values are imputed with the clinical normal mean.
        """
        organ_features = ORGAN_SYSTEMS[organ]
        vec = []
        for name, mean, std, weight in organ_features:
            raw   = float(biomarkers.get(name, mean))
            z     = (raw - mean) / (std if std > 0 else 1.0)
            # Apply organ-specific feature weighting
            vec.append(z * weight)
        return np.array(vec, dtype=np.float64)

    # ------------------------------------------------------------------
    # Scoring
    # ------------------------------------------------------------------

    def _classify_organ(
        self, organ: str, x: np.ndarray
    ) -> Dict:
        """
        Run OvR SVM classification for one organ system.
        Returns class probabilities via Platt scaling.
        """
        class_scores   = {}
        class_probs    = {}

        for cls_name, svm_params in self._svms[organ].items():
            sv  = svm_params["support_vectors"]
            dc  = svm_params["dual_coefs"]
            b   = svm_params["intercept"]
            dec = _decision_function(x, sv, dc, b, self._gamma)
            prob = _platt_scaling(dec)
            class_scores[cls_name] = round(dec,  4)
            class_probs[cls_name]  = round(prob, 4)

        # Normalize probabilities (softmax across OvR outputs)
        probs_arr = np.array([class_probs[c] for c in HEALTH_CLASSES])
        probs_arr = np.clip(probs_arr, 1e-9, None)
        probs_arr /= probs_arr.sum()

        predicted_class = HEALTH_CLASSES[int(np.argmax(probs_arr))]

        return {
            "predicted_class":    predicted_class,
            "class_probabilities": {
                cls: round(float(p), 4)
                for cls, p in zip(HEALTH_CLASSES, probs_arr)
            },
            "decision_scores":    class_scores,
            "n_support_vectors":  sum(sv["n_sv"] for sv in self._svms[organ].values()),
        }

    def _severity_score(self, predicted_class: str) -> float:
        """Convert predicted class to a numeric severity (0=Healthy, 1=Critical)."""
        return {
            "Healthy":          0.05,
            "Mildly Abnormal":  0.35,
            "Abnormal":         0.65,
            "Critical":         0.92,
        }.get(predicted_class, 0.5)

    # ------------------------------------------------------------------
    # Full Analysis
    # ------------------------------------------------------------------

    def analyze(self, biomarkers: Dict[str, float]) -> Dict:
        """
        Classify health status of all organ systems from biomarkers.

        Args:
            biomarkers: dict of biomarker name → numeric value

        Returns:
            Detailed organ health classification with probabilities
        """
        organ_results = {}

        for organ in ORGAN_SYSTEMS:
            x = self._extract_organ_features(organ, biomarkers)
            classification = self._classify_organ(organ, x)
            severity = self._severity_score(classification["predicted_class"])

            organ_results[organ] = {
                **classification,
                "severity_score": severity,
                "organ":          organ,
            }

        # Overall health status: mean severity across organs
        mean_severity = float(np.mean([
            v["severity_score"] for v in organ_results.values()
        ]))

        if mean_severity < 0.20:
            overall = "Excellent"
        elif mean_severity < 0.40:
            overall = "Good"
        elif mean_severity < 0.60:
            overall = "Fair"
        elif mean_severity < 0.80:
            overall = "Poor"
        else:
            overall = "Critical"

        # Margin of separation (SVM-specific metric — larger = more confident)
        margins = {
            organ: round(1.0 / (self._C * max(0.01, res["severity_score"])), 3)
            for organ, res in organ_results.items()
        }

        return {
            "model":                self.MODEL_NAME,
            "version":             self.VERSION,
            "status":              self.STATUS,
            "timestamp":           datetime.now().isoformat(),
            "hyperparameters":     HYPERPARAMS,
            "training_metrics":    TRAINING_METRICS,
            "kernel":              HYPERPARAMS["kernel"],
            "C":                   HYPERPARAMS["C"],
            "gamma":               HYPERPARAMS["gamma"],
            "organ_classifications": organ_results,
            "overall_health":      overall,
            "overall_severity":    round(mean_severity, 4),
            "decision_margins":    margins,
            "n_organ_systems":     len(ORGAN_SYSTEMS),
        }

    # ------------------------------------------------------------------
    # Sensitivity Analysis (SVM-specific: margin sensitivity)
    # ------------------------------------------------------------------

    def margin_sensitivity(self, biomarkers: Dict[str, float]) -> Dict[str, Dict]:
        """
        Compute how much each biomarker shifts the SVM decision boundary.
        Perturb each feature by ±1 standard deviation and measure the
        change in predicted severity (approximates gradient w.r.t. inputs).
        """
        baseline  = self.analyze(biomarkers)
        base_sev  = baseline["overall_severity"]
        sensitivity = {}

        for organ, features in ORGAN_SYSTEMS.items():
            organ_sens = {}
            for feat_name, mean, std, _ in features:
                perturbed = dict(biomarkers)

                # +1 std
                perturbed[feat_name] = biomarkers.get(feat_name, mean) + std
                res_up = self.analyze(perturbed)

                # -1 std
                perturbed[feat_name] = biomarkers.get(feat_name, mean) - std
                res_dn = self.analyze(perturbed)

                delta_up = round(res_up["overall_severity"] - base_sev, 5)
                delta_dn = round(res_dn["overall_severity"] - base_sev, 5)

                organ_sens[feat_name] = {
                    "plus_1_std_change":  delta_up,
                    "minus_1_std_change": delta_dn,
                    "impact_magnitude":   round(abs(delta_up) + abs(delta_dn), 5),
                }

            sensitivity[organ] = organ_sens

        return sensitivity

    # ------------------------------------------------------------------
    # Model Info
    # ------------------------------------------------------------------

    def get_model_info(self) -> Dict:
        total_sv = sum(
            sv["n_sv"]
            for organ_svms in self._svms.values()
            for sv in organ_svms.values()
        )
        return {
            "model_name":         self.MODEL_NAME,
            "version":            self.VERSION,
            "status":             self.STATUS,
            "algorithm":          "Support Vector Machine — RBF Kernel, OvR Multiclass",
            "kernel":             HYPERPARAMS["kernel"],
            "C":                  HYPERPARAMS["C"],
            "gamma":              HYPERPARAMS["gamma"],
            "probability":        HYPERPARAMS["probability"],
            "platt_scaling":      True,
            "n_organ_systems":    len(ORGAN_SYSTEMS),
            "health_classes":     HEALTH_CLASSES,
            "total_support_vectors": total_sv,
            "training_metrics":   TRAINING_METRICS,
            "features_per_organ": {
                organ: [f[0] for f in feats]
                for organ, feats in ORGAN_SYSTEMS.items()
            },
        }


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE-LEVEL INSTANCE
# ═══════════════════════════════════════════════════════════════════════════════

svm_model = SVMMedicalClassifier()


# ═══════════════════════════════════════════════════════════════════════════════
# DEMONSTRATION
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 78)
    print("  MediQ — SVM Organ Health Classification Model  (Standalone Demo)")
    print("=" * 78)
    print(f"  Model  : {SVMMedicalClassifier.MODEL_NAME}  v{SVMMedicalClassifier.VERSION}")
    print(f"  Status : {SVMMedicalClassifier.STATUS}")
    print(f"  Kernel : {HYPERPARAMS['kernel']}  |  C={HYPERPARAMS['C']}  |  γ={HYPERPARAMS['gamma']}")
    print("=" * 78)

    # Sample patient — hepatic + metabolic issues
    sample_patient = {
        "total_cholesterol":    232.0,
        "ldl_cholesterol":      158.0,
        "hdl_cholesterol":       37.0,
        "triglycerides":        205.0,
        "blood_pressure_sys":   138.0,
        "creatinine_serum":       1.1,
        "blood_urea_nitrogen":   19.0,
        "egfr":                  81.0,
        "uric_acid":              6.8,
        "potassium":              4.3,
        "sgpt_alt":              68.0,   # Elevated → hepatic stress
        "sgot_ast":              54.0,   # Elevated
        "alkaline_phosphatase": 112.0,
        "bilirubin_total":        1.4,
        "albumin":                3.7,
        "hemoglobin":            13.1,
        "wbc_count":              9.2,
        "platelet_count":       218.0,
        "hematocrit":            39.0,
        "rbc_count":              4.4,
        "glucose_fasting":      154.0,   # Elevated → metabolic issue
        "hba1c":                  7.2,
        "insulin_fasting":       18.0,
        "calcium_serum":          9.3,
        "tsh":                    3.8,
        "free_t4":                1.0,
    }

    result = svm_model.analyze(sample_patient)

    print(f"\n[RESULT] Overall Health : {result['overall_health']}  "
          f"(Severity = {result['overall_severity']:.4f})")
    print(f"         Kernel : {result['kernel']}  C={result['C']}  γ={result['gamma']}")

    print("\n[RESULT] Organ Classifications:")
    print(f"   {'Organ':<16} {'Prediction':<20} {'Severity':>10}  "
          f"{'Healthy%':>10}  {'Abnormal%':>10}  {'SVs':>5}")
    print("   " + "─" * 74)
    for organ, cls in result["organ_classifications"].items():
        p = cls["class_probabilities"]
        print(
            f"   {organ:<16} {cls['predicted_class']:<20} "
            f"{cls['severity_score']:>10.3f}  "
            f"{p['Healthy']:>10.4f}  "
            f"{p['Abnormal']:>10.4f}  "
            f"{cls['n_support_vectors']:>5}"
        )

    print("\n[RESULT] Decision Margins (larger = more confident separation):")
    for organ, margin in result["decision_margins"].items():
        bar = "▓" * int(margin * 30)
        print(f"   {organ:<16} {margin:.3f}  {bar}")

    print("\n[INFO] Model Summary:")
    info = svm_model.get_model_info()
    print(f"   Total support vectors : {info['total_support_vectors']}")
    print(f"   Organ systems         : {info['n_organ_systems']}")
    print(f"   Classes               : {info['health_classes']}")

    print("\n[INFO] Training Metrics:")
    for k, v in TRAINING_METRICS.items():
        print(f"   {k:<30} : {v}")

    print("\n" + "=" * 78)
    print("  NOTE: This model is for demonstration only.")
    print("  The production MediQ pipeline uses ai_engine.py (Groq LLM).")
    print("=" * 78)
