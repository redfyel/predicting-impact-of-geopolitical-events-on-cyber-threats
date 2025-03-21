import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [formData, setFormData] = useState({
    eventType: '',
    eventRegion: '',
    cyberThreatType: '',
    threatActors: '',
    targetSector: '',
    eventDate: '',
    eventIntensity: '',
    eventPolarity: 'Neutral',
  });

  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(true); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const buildPayload = () => {
    let year = 0, month = 0, day = 0;
    if (formData.eventDate) {
      const dateObj = new Date(formData.eventDate);
      year = dateObj.getFullYear();
      month = dateObj.getMonth() + 1;
      day = dateObj.getDate();
    }

    const polarityMap = {
      "Negative": 0,
      "Neutral": 1,
      "Positive": 2
    };

    const countryRiskCategoryMap = {
      "Low": 1,
      "Medium": 2 ,
      "High": 0
    };
  

    const eventTypeOH = {
      "Event_Type_military conflict": formData.eventType?.toLowerCase() === "military conflict" ? 1 : 0,
      "Event_Type_protests": formData.eventType?.toLowerCase() === "protests" ? 1 : 0,
      "Event_Type_sanctions": formData.eventType?.toLowerCase() === "sanctions" ? 1 : 0,
      "Event_Type_trade disputes": formData.eventType?.toLowerCase() === "trade disputes" ? 1 : 0,
    };

    const eventRegionOH = {
      "Event_Region_asia": formData.eventRegion?.toLowerCase() === "asia" ? 1 : 0,
      "Event_Region_europe": formData.eventRegion?.toLowerCase() === "europe" ? 1 : 0,
      "Event_Region_middle east": formData.eventRegion?.toLowerCase() === "middle east" ? 1 : 0,
      "Event_Region_north america": formData.eventRegion?.toLowerCase() === "north america" ? 1 : 0,
      "Event_Region_south america": formData.eventRegion?.toLowerCase() === "south america" ? 1 : 0,
    };

    const cyberThreatTypeOH = {
      "Cyber_Threat_Type_ddos": formData.cyberThreatType?.toLowerCase() === "ddos" ? 1 : 0,
      "Cyber_Threat_Type_insider threat": formData.cyberThreatType?.toLowerCase() === "insider threat" ? 1 : 0,
      "Cyber_Threat_Type_phishing": formData.cyberThreatType?.toLowerCase() === "phishing" ? 1 : 0,
      "Cyber_Threat_Type_ransomware": formData.cyberThreatType?.toLowerCase() === "ransomware" ? 1 : 0,
      "Cyber_Threat_Type_data breach": formData.cyberThreatType?.toLowerCase() === "data breach" ? 1 : 0,
    };

    const threatActorsOH = {
      "Threat_Actors_hacktivists": formData.threatActors?.toLowerCase() === "hacktivists" ? 1 : 0,
      "Threat_Actors_insiders": formData.threatActors?.toLowerCase() === "insiders" ? 1 : 0,
      "Threat_Actors_state-sponsored": formData.threatActors?.toLowerCase() === "state-sponsored" ? 1 : 0,
      "Threat_Actors_unknown": formData.threatActors?.toLowerCase() === "unknown" ? 1 : 0,
    };

    const targetSectorOH = {
      "Target_Sector_finance": formData.targetSector?.toLowerCase() === "finance" ? 1 : 0,
      "Target_Sector_government": formData.targetSector?.toLowerCase() === "government" ? 1 : 0,
      "Target_Sector_healthcare": formData.targetSector?.toLowerCase() === "healthcare" ? 1 : 0,
      "Target_Sector_technology": formData.targetSector?.toLowerCase() === "technology" ? 1 : 0,
    };

    const payload = {
      "Event_Intensity": parseFloat(formData.eventIntensity) || 5,
      "Event_Duration_Days": 5,
      "Event_Polarity": polarityMap[formData.eventPolarity] ?? 0,
      "Event_Media_Coverage": 50,
      "Cyber_Threat_Severity": 2,
      "Num_Cyber_Attacks": 10,
      "Geopolitical_Risk_Index": 40,
      "Economic_Impact_Score": 70,
      "Media_Sentiment_Score": 0,
      "Pre_Event_Threat_Count": 30,
      "Post_Event_Threat_Count": 50,
      "Cybercrime_Index": 60,
      "Cybersecurity_Exposure_Index": 80,
      "Threat_Lag": 7,
      "Post_Event_Duration": 10,
      "Country_Risk_Category": countryRiskCategoryMap[formData.eventRegion] ?? 0,
      "Year": year,
      "Month": month,
      "Day": day,
      ...eventTypeOH,
      ...eventRegionOH,
      ...cyberThreatTypeOH,
      ...threatActorsOH,
      ...targetSectorOH
    };
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { features: buildPayload() };
    console.log("Sending payload:", payload);
    try {
      const response = await axios.post('https://predicting-impact-of-geopolitical-events.onrender.com/predict', payload, {
        headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" }
      });
      setPrediction(response.data);
      setError(null);
      setShowForm(false); // Hide form, show result
    } catch (err) {
      console.error('Prediction Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error fetching prediction');
    }
  };

  const handleBack = () => {
    setShowForm(true); // Show the form again
    setPrediction(null); // Clear the prediction
  };

  return (
    <div className="container">
      <h1 className="title">Prediction of Impact of Geopolitical Events on Cyber Threats</h1>

      {showForm ? (
        <form onSubmit={handleSubmit} className="form-container">
          <label>Event Type</label>
          <select name="eventType" value={formData.eventType} onChange={handleChange}>
            <option value="">Select Event Type</option>
            <option value="Military Conflict">Military Conflict</option>
            <option value="Protests">Protests</option>
            <option value="Sanctions">Sanctions</option>
            <option value="Trade Disputes">Trade Disputes</option>
          </select>
          <span className="tooltip">Choose one: Military Conflict, Protests, Sanctions, Trade Disputes</span>

          <label>Event Region</label>
          <select name="eventRegion" value={formData.eventRegion} onChange={handleChange}>
            <option value="">Select Region</option>
            <option value="Asia">Asia</option>
            <option value="Europe">Europe</option>
            <option value="Middle East">Middle East</option>
            <option value="North America">North America</option>
            <option value="South America">South America</option>
          </select>
          <span className="tooltip">Select the region where the event occurred</span>
          

          <label>Cyber Threat Type</label>
          <select name="cyberThreatType" value={formData.cyberThreatType} onChange={handleChange}>
            <option value="">Select Threat Type</option>
            <option value="DDoS">DDoS</option>
            <option value="Data Breach">Data Breach</option>
            <option value="Phishing">Phishing</option>
            <option value="Ransomware">Ransomware</option>
            <option value="Insider Threat">Insider Threat</option>
          </select>
          <span className="tooltip">Select the type of cyber threat</span>

          <label>Threat Actors</label>
          <select name="threatActors" value={formData.threatActors} onChange={handleChange}>
            <option value="">Select Threat Actors</option>
            <option value="Hacktivists">Hacktivists</option>
            <option value="State-sponsored">State-sponsored</option>
            <option value="Unknown">Unknown</option>
            <option value="Insiders">Insiders</option>
          </select>
          <span className="tooltip">Select who is behind the cyber threat</span>

          <label>Target Sector</label>
          <select name="targetSector" value={formData.targetSector} onChange={handleChange}>
            <option value="">Select Target Sector</option>
            <option value="Finance">Finance</option>
            <option value="Government">Government</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Technology">Technology</option>
          </select>
          <span className="tooltip">Select the sector affected by cyber threats</span>

          <div className="grid">
            <div>
              <label>Event Date</label>
              <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} placeholder="YYYY-MM-DD" />
            </div>
            <div>
              <label>Event Intensity</label>
              <input type="number" name="eventIntensity" value={formData.eventIntensity} onChange={handleChange} placeholder="1-10" />
            </div>
          </div>

          <label>Event Polarity</label>
          <input type="text" name="eventPolarity" value={formData.eventPolarity} onChange={handleChange} placeholder="Positive, Negative, Neutral" />
          
          <button type="submit" className="submit-btn">Predict</button>
        </form>
      ) : (
        <div className="prediction-container">
          <h2 className="prediction-title">Prediction Result</h2>
          <span className="tooltip">Likelihood indicates probabilty of threat happening and Severity indicates severity of threat in terms of Low(1), Medium(2) and High(3) </span>
          <div className="prediction">
            <div className="prediction-item">
              <span className="prediction-label">Likelihood:</span>
              
              <span className="prediction-value">{prediction.likelihood ? prediction.likelihood.toFixed(2) : "N/A"}</span>
              
            </div>
            <div className="prediction-item">
              <span className="prediction-label">Severity:</span>
              <span className="prediction-value">{prediction.severity}</span>
            </div>
          </div>
          <button className="back-btn" onClick={handleBack}>Back to Input Form</button>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default App;