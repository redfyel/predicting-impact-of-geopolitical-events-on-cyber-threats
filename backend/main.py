from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np

app = FastAPI()

# Enable CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with ["https://predict-geopolitical-event-impact-on-cyber-threat.vercel.app"] for better security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(data: dict):
    try:
        print("Received data:", data)
        if "features" not in data:
            raise HTTPException(status_code=400, detail="Missing 'features' key in request body")

        # Load models
        svr_model = joblib.load("svr_likelihood_model.pkl")
        rf_model = joblib.load("random_forest_severity_model.pkl")

        # Extract feature names
        rf_feature_names = rf_model.feature_names_in_.tolist()
        svr_feature_names = [f for f in rf_feature_names if f.lower() != "likelihood"]

        # Extract feature values
        svr_input = [data["features"].get(feature, 0) for feature in svr_feature_names]
        rf_input = [data["features"].get(feature, 0) for feature in rf_feature_names]

        # Convert to numpy arrays
        svr_features = np.array(svr_input).reshape(1, -1)
        rf_features = np.array(rf_input).reshape(1, -1)

        # Make predictions
        likelihood = float(svr_model.predict(svr_features)[0])
        severity = int(rf_model.predict(rf_features)[0])

        return {"likelihood": likelihood, "severity": severity}

    except Exception as e:
        print("Error:", str(e))
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
