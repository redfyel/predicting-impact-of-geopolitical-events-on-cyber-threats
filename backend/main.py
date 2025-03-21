from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load your saved models
svr_model = joblib.load("svr_likelihood_model.pkl")
rf_model = joblib.load("random_forest_severity_model.pkl")

print("SVR Model Expected Features:", svr_model.n_features_in_)
print("RF Model Expected Features:", rf_model.n_features_in_)

@app.post("/predict")
async def predict(data: dict):
    try:
        print("Received data:", data)  # Debugging

        # Ensure data is wrapped in "features"
        if "features" not in data:
            raise HTTPException(status_code=400, detail="Missing 'features' key in request body")
        
        # Use the RF model's feature names as the gold standard (40 features)
        rf_feature_names = rf_model.feature_names_in_.tolist()
        
        # For SVR, remove the extra feature (assumed to be 'Likelihood')
        svr_feature_names = [f for f in rf_feature_names if f.lower() != "likelihood"]
        
        # Debug: Check lengths
        print("RF feature count:", len(rf_feature_names))  # Should be 40
        print("SVR feature count:", len(svr_feature_names))  # Should be 39

        # Map input features from the received dictionary.
        # We assume the client sends a dictionary with keys matching these names.
        svr_input = [data["features"].get(feature, 0) for feature in svr_feature_names]
        rf_input = [data["features"].get(feature, 0) for feature in rf_feature_names]
        
        # Convert to numpy arrays
        svr_features = np.array(svr_input).reshape(1, -1)
        rf_features = np.array(rf_input).reshape(1, -1)
        
        # Predict using both models
        likelihood = float(svr_model.predict(svr_features)[0])  # SVR prediction (regression)
        severity = int(rf_model.predict(rf_features)[0])          # RF prediction (classification)
        
        return {"likelihood": likelihood, "severity": severity}

    except Exception as e:
        print("Error:", str(e))
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/features")
async def get_features():
    try:
        # For SVR, we generate names dynamically since they aren't stored
        svr_features = [f"Feature_{i}" for i in range(svr_model.n_features_in_)]
        rf_features = rf_model.feature_names_in_.tolist() if hasattr(rf_model, "feature_names_in_") else [f"Feature_{i}" for i in range(rf_model.n_features_in_)]
        return {"svr_features": svr_features, "rf_features": rf_features}
    except Exception as e:
        return {"error": str(e)}
