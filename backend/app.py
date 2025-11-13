from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load models AND scaler globally
try:
    solar_model = joblib.load('backend/solar_prediction_model.joblib')
    solar_scaler = joblib.load('backend/solar_scaler.joblib')
    print("✓ Solar model and scaler loaded.")
except Exception as e:
    print(f"❌ Error loading solar model/scaler: {e}")
    solar_model = None
    solar_scaler = None

try:
    electricity_model = joblib.load('backend/electricity_prediction_model.joblib')
    print("✓ Electricity model loaded.")
except Exception as e:
    print(f"❌ Error loading electricity model: {e}")
    electricity_model = None


@app.route('/')
def home():
    return "Solar & Electricity ML API Running!"


@app.route('/predict_solar', methods=['POST'])
def predict_solar():
    try:
        if solar_model is None or solar_scaler is None:
            return jsonify({'error': 'Solar model or scaler not loaded'}), 500
            
        data = request.get_json(force=True)
        print("Received solar data:", data)
        
        # Input: [LAT, LON, Cloud, Zone_C, Zone_E, Zone_N, Zone_S, Zone_W]
        input_features = np.array(data['features']).reshape(1, -1)
        print("Input features shape:", input_features.shape)
        print("Raw features:", input_features)
        
        # CRITICAL: Scale only LAT, LON, Cloud Amount (first 3 columns)
        # Keep zone columns (last 5) unchanged
        input_features_scaled = input_features.copy()
        input_features_scaled[:, 0:3] = solar_scaler.transform(input_features[:, 0:3])
        
        print("Scaled features:", input_features_scaled)
        
        # Predict (returns kWh/m²/day)
        prediction = solar_model.predict(input_features_scaled)
        irradiance = float(prediction[0])
        
        print(f"Predicted irradiance: {irradiance:.2f} kWh/m²/day")
        
        # Convert to annual kWh for 1kW system
        # Formula: irradiance × 365 days × 0.75 (system efficiency)
        annual_kwh = irradiance * 365 * 0.75
        
        print(f"Annual solar potential: {annual_kwh:.0f} kWh/year")
        
        return jsonify({
            'prediction': round(annual_kwh, 2),
            'irradiance': round(irradiance, 2),
            'unit': 'kWh/year'
        })
        
    except Exception as e:
        print("❌ Solar prediction error:", e)
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/predict_electricity', methods=['POST'])
def predict_electricity():
    if electricity_model is None:
        return jsonify({"error": "Electricity model not loaded"}), 500
    
    try:
        data = request.get_json(force=True)
        print("Received electricity data:", data)
        
        input_features = np.array(data['features']).reshape(1, -1)
        print("Input features:", input_features)
        
        # Predict (returns bill amount in INR)
        prediction = electricity_model.predict(input_features)
        bill_amount = float(prediction[0])
        
        print(f"Predicted bill: ₹{bill_amount:.2f}")
        
        return jsonify({
            'prediction': round(bill_amount, 2),
            'unit': 'INR'
        })
        
    except Exception as e:
        print("❌ Electricity prediction error:", e)
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/debug_models', methods=['GET'])
def debug_models():
    """Debug endpoint to check model info"""
    solar_info = {}
    elec_info = {}
    
    if solar_model is not None:
        try:
            solar_info['type'] = str(type(solar_model))
            solar_info['n_features'] = solar_model.n_features_in_
            
            # Test prediction with Bangalore coordinates
            test_input = np.array([[12.9716, 77.5946, 30, 0, 0, 0, 1, 0]])  # South zone
            test_scaled = test_input.copy()
            test_scaled[:, 0:3] = solar_scaler.transform(test_input[:, 0:3])
            
            test_pred = solar_model.predict(test_scaled)
            irradiance = float(test_pred[0])
            annual_kwh = irradiance * 365 * 0.75
            
            solar_info['test_irradiance'] = round(irradiance, 2)
            solar_info['test_annual_kwh'] = round(annual_kwh, 0)
            solar_info['expected_range'] = '1200-1500 kWh/year'
        except Exception as e:
            solar_info['error'] = str(e)
            import traceback
            solar_info['traceback'] = traceback.format_exc()
    else:
        solar_info['status'] = 'Model not loaded'
    
    if electricity_model is not None:
        try:
            elec_info['type'] = str(type(electricity_model))
            elec_info['n_features'] = electricity_model.n_features_in_
            
            # Test prediction
            test_input = np.array([[3, 1, 0, 2, 1, 1, 11, 200, 7]])
            test_pred = electricity_model.predict(test_input)
            bill = float(test_pred[0])
            consumption = bill / 7  # Divide by tariff rate
            
            elec_info['test_bill'] = round(bill, 2)
            elec_info['test_consumption'] = round(consumption, 2)
        except Exception as e:
            elec_info['error'] = str(e)
            import traceback
            elec_info['traceback'] = traceback.format_exc()
    else:
        elec_info['status'] = 'Model not loaded'
    
    return jsonify({
        'solar_model': solar_info,
        'electricity_model': elec_info
    })


if __name__ == '__main__':
    app.run(debug=True)
