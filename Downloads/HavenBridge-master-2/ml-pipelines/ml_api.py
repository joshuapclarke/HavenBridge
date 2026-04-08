"""
HavenBridge ML Prediction API
Flask microservice exposing prediction endpoints for 3 models.
Run: python ml_api.py
"""

import os
import logging
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow calls from React frontend

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# Model loading (lazy, cached)
# ---------------------------------------------------------------------------

_model_cache = {}

def load_pkl(filename):
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(path):
        logger.warning(f"Model file not found: {path}")
        return None
    try:
        import joblib
        model = joblib.load(path)
        logger.info(f"Loaded model: {filename}")
        return model
    except Exception as e:
        logger.error(f"Failed to load {filename}: {e}")
        return None

def get_model(key, filename):
    if key not in _model_cache:
        _model_cache[key] = load_pkl(filename)
    return _model_cache[key]

# ---------------------------------------------------------------------------
# Rule-based fallbacks (used when .pkl files don't exist)
# ---------------------------------------------------------------------------

def rule_resident_risk(d: dict) -> dict:
    """Heuristic risk prediction based on sub-categories and incidents."""
    score = 0.0
    score += d.get('sub_cat_trafficked', 0) * 0.20
    score += d.get('sub_cat_sexual_abuse', 0) * 0.20
    score += d.get('sub_cat_physical_abuse', 0) * 0.15
    score += d.get('sub_cat_at_risk', 0) * 0.10
    score += d.get('has_special_needs', 0) * 0.05
    score += min(d.get('unresolved_count', 0), 3) * 0.08
    score += min(d.get('high_severity_count', 0), 3) * 0.10
    score -= min(d.get('avg_health_score', 5), 10) * 0.01
    score -= min(d.get('avg_progress', 50), 100) * 0.001
    score = max(0.0, min(score, 1.0))

    if score >= 0.60:
        level = 'Critical'
    elif score >= 0.40:
        level = 'High'
    elif score >= 0.20:
        level = 'Medium'
    else:
        level = 'Low'

    return {
        'modelLoaded': False,
        'riskLevel': level,
        'confidenceScore': round(score, 2),
        'probabilities': {'Low': 0.0, 'Medium': 0.0, 'High': 0.0, 'Critical': 0.0,
                          level: round(score, 2)}
    }

def rule_reintegration(d: dict) -> dict:
    """Heuristic reintegration readiness based on progress and safety."""
    score = 0.5
    score += (d.get('avg_health_score', 5) - 5) * 0.02
    score += (d.get('avg_progress', 50) - 50) * 0.003
    score -= d.get('unresolved_count', 0) * 0.05
    score -= d.get('high_severity_count', 0) * 0.08
    score += min(d.get('plan_completion_rate', 0), 1.0) * 0.15
    score += min(d.get('total_visits', 0), 5) * 0.01
    score = max(0.0, min(score, 1.0))

    if score >= 0.75:
        action = 'READY'
    elif score >= 0.50:
        action = 'PROGRESSING'
    elif score >= 0.25:
        action = 'IN DEVELOPMENT'
    else:
        action = 'NOT READY'

    return {
        'modelLoaded': False,
        'readinessScore': round(score, 2),
        'recommendedAction': action
    }

def rule_donor_ltv(d: dict) -> dict:
    """Heuristic donor lifetime value based on donation history."""
    total = d.get('total_donations', 0)
    avg = d.get('avg_amount', 0)
    is_recurring = d.get('is_recurring_donor', 0)
    age_years = max(d.get('account_age_days', 365) / 365, 0.1)

    # Simple projection: (avg donation) * (projected donations per year) * 3yr horizon
    donations_per_year = total / age_years if age_years > 0 else total
    multiplier = 1.5 if is_recurring else 1.0
    predicted = avg * donations_per_year * 3 * multiplier

    high_value_prob = min(predicted / 50000, 0.99)
    if high_value_prob >= 0.6:
        tier = 'HIGH'
    elif high_value_prob >= 0.3:
        tier = 'MEDIUM'
    else:
        tier = 'STANDARD'

    return {
        'modelLoaded': False,
        'predictedLifetimeValue': round(predicted, 2),
        'highValueProbability': round(high_value_prob, 2),
        'engagementTier': tier
    }

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.route('/health')
def health():
    models_status = {
        'residentRisk': os.path.exists(os.path.join(MODEL_DIR, 'resident_risk_model.pkl')),
        'reintegration': os.path.exists(os.path.join(MODEL_DIR, 'reintegration_readiness_model.pkl')),
        'donorLtv': os.path.exists(os.path.join(MODEL_DIR, 'donor_lifetime_value_model.pkl')),
    }
    return jsonify({'status': 'ok', 'models': models_status})


@app.route('/predict/resident-risk', methods=['POST'])
def predict_resident_risk():
    d = request.get_json(force=True) or {}

    model_data = get_model('resident_risk', 'resident_risk_model.pkl')
    if model_data is None:
        return jsonify(rule_resident_risk(d))

    try:
        model = model_data['model']
        feature_cols = model_data['feature_cols']
        features = {col: 0.0 for col in feature_cols}
        features.update({k: float(v) for k, v in d.items() if k in features})
        X = np.array([[features[col] for col in feature_cols]])

        pred = int(model.predict(X)[0])
        probs = model.predict_proba(X)[0].tolist()
        risk_labels = ['Low', 'Medium', 'High', 'Critical']
        risk_level = risk_labels[pred] if pred < len(risk_labels) else 'Unknown'

        return jsonify({
            'modelLoaded': True,
            'riskLevel': risk_level,
            'confidenceScore': round(float(max(probs)), 2),
            'probabilities': {label: round(p, 2) for label, p in zip(risk_labels, probs[:4])}
        })
    except Exception as e:
        logger.error(f"Prediction error (resident-risk): {e}")
        return jsonify(rule_resident_risk(d))


@app.route('/predict/reintegration', methods=['POST'])
def predict_reintegration():
    d = request.get_json(force=True) or {}

    model_data = get_model('reintegration', 'reintegration_readiness_model.pkl')
    if model_data is None:
        return jsonify(rule_reintegration(d))

    try:
        binary_clf = model_data['binary_classifier']
        feature_cols = model_data['feature_cols']
        features = {col: 0.0 for col in feature_cols}
        features.update({k: float(v) for k, v in d.items() if k in features})
        X = np.array([[features[col] for col in feature_cols]])

        score = float(binary_clf.predict_proba(X)[0][1])
        if score >= 0.75:
            action = 'READY'
        elif score >= 0.50:
            action = 'PROGRESSING'
        elif score >= 0.25:
            action = 'IN DEVELOPMENT'
        else:
            action = 'NOT READY'

        return jsonify({
            'modelLoaded': True,
            'readinessScore': round(score, 2),
            'recommendedAction': action
        })
    except Exception as e:
        logger.error(f"Prediction error (reintegration): {e}")
        return jsonify(rule_reintegration(d))


@app.route('/predict/donor-value', methods=['POST'])
def predict_donor_value():
    d = request.get_json(force=True) or {}

    model_data = get_model('donor_ltv', 'donor_lifetime_value_model.pkl')
    if model_data is None:
        return jsonify(rule_donor_ltv(d))

    try:
        regressor = model_data['regressor']
        classifier = model_data['classifier']
        feature_cols = model_data['feature_cols']
        features = {col: 0.0 for col in feature_cols}
        features.update({k: float(v) for k, v in d.items() if k in features})
        X = np.array([[features[col] for col in feature_cols]])

        predicted_value = float(regressor.predict(X)[0])
        high_value_prob = float(classifier.predict_proba(X)[0][1])
        tier = 'HIGH' if high_value_prob >= 0.6 else ('MEDIUM' if high_value_prob >= 0.3 else 'STANDARD')

        return jsonify({
            'modelLoaded': True,
            'predictedLifetimeValue': round(predicted_value, 2),
            'highValueProbability': round(high_value_prob, 2),
            'engagementTier': tier
        })
    except Exception as e:
        logger.error(f"Prediction error (donor-value): {e}")
        return jsonify(rule_donor_ltv(d))


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"Starting HavenBridge ML API on port {port}")
    logger.info(f"Model directory: {MODEL_DIR}")
    app.run(host='0.0.0.0', port=port, debug=False)
