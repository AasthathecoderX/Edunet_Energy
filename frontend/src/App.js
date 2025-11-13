import React, { useState } from "react";
import "./App.css";

// Helper to map zone text to match backend expectations
const encodeZone = (zone) => {
  switch (zone.toLowerCase()) {
    case "central": return "CENTRAL ZONE";
    case "east": return "EAST ZONE";
    case "north": return "NORTH ZONE";
    case "south": return "SOUTH ZONE";
    case "west": return "WEST ZONE";
    default: return "CENTRAL ZONE";
  }
};

export default function App() {
  // State for Electricity Consumption Form
  const [fan, setFan] = useState("");
  const [refrigerator, setRefrigerator] = useState("");
  const [airConditioner, setAirConditioner] = useState("");
  const [television, setTelevision] = useState("");
  const [monitor, setMonitor] = useState("");
  const [motorPump, setMotorPump] = useState("");
  const [month, setMonth] = useState("");
  const [monthlyHours, setMonthlyHours] = useState("");
  const [tariffRate, setTariffRate] = useState("");

  // State for Solar Generation Form
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [cloudAmount, setCloudAmount] = useState("");
  const [zone, setZone] = useState("Central");

  // Results
  const [energyConsumption, setEnergyConsumption] = useState("--");
  const [solarGeneration, setSolarGeneration] = useState("--");
  const [progress, setProgress] = useState(0);

  // Handler for Electricity Consumption Prediction
  const handleElectricityPredict = async () => {
    setProgress(0);
    setEnergyConsumption("--");

    let stage = 0;
    const simulation = setInterval(() => {
      stage += 10;
      setProgress(stage);
      if (stage >= 100) clearInterval(simulation);
    }, 60);

    if (!fan || !refrigerator || !airConditioner || !television || 
        !monitor || !motorPump || !month || !monthlyHours || !tariffRate) {
      alert("Please fill out all electricity consumption fields");
      clearInterval(simulation);
      return;
    }

    const features = [
      parseFloat(fan),
      parseFloat(refrigerator),
      parseFloat(airConditioner),
      parseFloat(television),
      parseFloat(monitor),
      parseFloat(motorPump),
      parseFloat(month),
      parseFloat(monthlyHours),
      parseFloat(tariffRate)
    ];

    console.log("Sending electricity features:", features);

    try {
      const response = await fetch("http://localhost:5000/predict_electricity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features })
      });
      const data = await response.json();
      console.log("Electricity prediction response:", data);
      
      if (data.error) {
        alert(`Error: ${data.error}`);
        setEnergyConsumption("Error");
      } else if (data.prediction !== undefined) {
        const billAmount = data.prediction;
        const consumptionKWh = billAmount / parseFloat(tariffRate);
        
        setEnergyConsumption(
          `${consumptionKWh.toFixed(2)} kWh/month (₹${billAmount.toFixed(2)})`
        );
      } else {
        setEnergyConsumption("No prediction returned");
      }
    } catch (error) {
      alert("Error predicting electricity consumption: " + error.message);
      console.error(error);
      setEnergyConsumption("Error");
    }
  };

  // Handler for Solar Generation Prediction
  const handleSolarPredict = async () => {
    setProgress(0);
    setSolarGeneration("--");

    let stage = 0;
    const simulation = setInterval(() => {
      stage += 10;
      setProgress(stage);
      if (stage >= 100) clearInterval(simulation);
    }, 60);

    if (!latitude || !longitude || !cloudAmount || !zone) {
      alert("Please fill out all solar generation fields");
      clearInterval(simulation);
      return;
    }

    const encodedZone = encodeZone(zone);

    const features = [
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(cloudAmount),
      encodedZone === "CENTRAL ZONE" ? 1 : 0,
      encodedZone === "EAST ZONE" ? 1 : 0,
      encodedZone === "NORTH ZONE" ? 1 : 0,
      encodedZone === "SOUTH ZONE" ? 1 : 0,
      encodedZone === "WEST ZONE" ? 1 : 0
    ];

    console.log("Sending solar features:", features);

    try {
      const response = await fetch("http://localhost:5000/predict_solar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features })
      });
      
      const data = await response.json();
      console.log("Solar prediction response:", data);
      
      if (data.error) {
        alert(`Error: ${data.error}`);
        setSolarGeneration("Error");
      } else if (data.prediction !== undefined) {
        setSolarGeneration(`${data.prediction.toFixed(2)} kWh / year`);
      } else {
        setSolarGeneration("No prediction returned");
      }
    } catch (error) {
      alert("Error predicting solar generation: " + error.message);
      console.error("Full error:", error);
      setSolarGeneration("Error");
    }
  };

  return (
    <>
      <div className="super-bg">
        <div className="solar-hero">
          <SolarPanelSvg />
          <div className="hero-text">
            <h1>
              <span className="gradient-highlight">SuryaVeda</span>
            </h1>
            <p className="hero-desc">
              Empowering Sustainable Energy Decisions through AI
            </p>
          </div>
        </div>

        <div className="main-content">
          {/* FORM 1: Electricity Consumption Prediction */}
<div className="glass-card app-form-card">
  <h2 className="form-header">⚡ Predict Electricity Consumption</h2>
  
  {/* Two-Column Layout: Appliances Left, Usage Right */}
  <div className="form-columns">
    {/* LEFT COLUMN: Household Appliances */}
    <div className="form-section">
      <h3 className="section-title">🏠 Household Appliances</h3>
      <div className="input-list">
        <div className="input-group">
          <label>Fan (count)</label>
          <input
            className="fancy-input"
            type="number"
            placeholder="Number of Fans"
            value={fan}
            onChange={e => setFan(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Refrigerator (count)</label>
          <input
            className="fancy-input"
            type="number"
            placeholder="Number of Refrigerators"
            value={refrigerator}
            onChange={e => setRefrigerator(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Air Conditioner (count)</label>
          <input
            className="fancy-input"
            type="number"
            placeholder="Number of ACs"
            value={airConditioner}
            onChange={e => setAirConditioner(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Television (count)</label>
          <input
            className="fancy-input"
            type="number"
            placeholder="Number of TVs"
            value={television}
            onChange={e => setTelevision(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Monitor (count)</label>
          <input
            className="fancy-input"
            type="number"
            placeholder="Number of Monitors"
            value={monitor}
            onChange={e => setMonitor(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Motor Pump (count)</label>
          <input
            className="fancy-input"
            type="number"
            placeholder="Number of Motor Pumps"
            value={motorPump}
            onChange={e => setMotorPump(e.target.value)}
          />
        </div>
      </div>
    </div>

    {/* RIGHT COLUMN: Usage Details */}
    <div className="form-section">
      <h3 className="section-title">📊 Usage Details</h3>
      <div className="input-list">
        <div className="input-group">
          <label>Month (1-12)</label>
          <input
            className="fancy-input"
            type="number"
            placeholder="e.g., 1 for Jan, 12 for Dec"
            value={month}
            onChange={e => setMonth(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Monthly Hours of Usage</label>
          <input
            className="fancy-input"
            type="number"
            placeholder="Total hours per month"
            value={monthlyHours}
            onChange={e => setMonthlyHours(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Tariff Rate (₹/kWh)</label>
          <input
            className="fancy-input"
            type="number"
            placeholder="Electricity tariff rate"
            value={tariffRate}
            onChange={e => setTariffRate(e.target.value)}
          />
        </div>
      </div>
    </div>
  </div>

  <button className="predict-btn" onClick={handleElectricityPredict}>
    ⚡ Predict Electricity Consumption
  </button>
</div>

          {/* FORM 2: Solar Generation Prediction */}
<div className="glass-card app-form-card solar-form-card">
  <h2 className="form-header">🌞 Predict Potential Solar Generation</h2>
  
  <div className="form-section">
    <h3 className="section-title">📍 Location Details</h3>
    <div className="solar-grid">
      <div className="input-group">
        <label>Latitude</label>
        <input
          className="fancy-input"
          type="number"
          placeholder="e.g., 12.9716"
          value={latitude}
          onChange={e => setLatitude(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Longitude</label>
        <input
          className="fancy-input"
          type="number"
          placeholder="e.g., 77.5946"
          value={longitude}
          onChange={e => setLongitude(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Cloud Amount (%)</label>
        <input
          className="fancy-input"
          type="number"
          placeholder="Cloud coverage (0-100%)"
          value={cloudAmount}
          onChange={e => setCloudAmount(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Zone</label>
        <select
          className="fancy-input"
          value={zone}
          onChange={e => setZone(e.target.value)}
        >
          <option>Central</option>
          <option>East</option>
          <option>North</option>
          <option>South</option>
          <option>West</option>
        </select>
      </div>
    </div>
  </div>

  <button className="predict-btn" onClick={handleSolarPredict}>
    🌞 Predict Solar Generation
  </button>

  {/* Progress meter animation */}
  <div className="progress-meter-bg">
    <div className="progress-meter" style={{ width: `${progress}%` }} />
  </div>
</div>

          {/* Results Grid */}
          <div className="result-grid">
            <div className="result-card glass-card animated-card">
              <h2 className="result-title">⚡ Predicted Household Energy Consumption</h2>
              <div className={`result-value ${energyConsumption !== "--" ? "fade-in" : ""}`}>
                {energyConsumption}
              </div>
            </div>
            <div className="result-card glass-card animated-card">
              <h2 className="result-title">🌟 Predicted Solar Generation</h2>
              <div className={`result-value ${solarGeneration !== "--" ? "fade-in" : ""}`}>
                {solarGeneration}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="about-section-wrapper">
        <div className="about-container">
          <div className="about-header">
            <div className="about-icon">📖</div>
            <h2 className="about-title">How to Use SolarSmart Prediction</h2>
            <p className="about-subtitle">Your complete guide to accurate energy forecasting</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">⚡</div>
              <h3 className="step-title">Electricity Consumption</h3>
              <p className="step-description">
                Enter the <strong>number of appliances</strong> in your home, including fans, 
                refrigerators, ACs, TVs, monitors, and motor pumps. Provide monthly usage hours 
                and your electricity tariff rate.
              </p>
              <div className="step-example">Get accurate monthly consumption predictions!</div>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">🌞</div>
              <h3 className="step-title">Solar Generation</h3>
              <p className="step-description">
                Input your <strong>location coordinates</strong> (latitude & longitude), 
                <strong>cloud coverage</strong> percentage, and select your geographical 
                <strong>zone</strong> for solar potential analysis.
              </p>
              <div className="step-example">Discover your solar power potential!</div>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">🚀</div>
              <h3 className="step-title">Get Predictions</h3>
              <p className="step-description">
                                Click the respective <strong>"Predict"</strong> buttons to receive instant 
                estimates for your electricity consumption and solar generation potential.
              </p>
              <div className="step-example">Results appear in real-time!</div>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon">💡</div>
              <h3 className="step-title">Make Informed Decisions</h3>
              <p className="step-description">
                Compare your <strong>energy consumption</strong> with <strong>solar generation 
                potential</strong> to determine if solar installation is right for you.
              </p>
              <div className="step-example">Plan your sustainable future!</div>
            </div>
          </div>

          <div className="about-footer">
            <p className="about-footer-text">
              🌱 Powered by advanced machine learning algorithms | Built for a sustainable future
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// SVG Solar Panel Animation
const SolarPanelSvg = () => (
  <svg width="160" height="110" viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="solar-svg">
    <rect x="20" y="40" width="120" height="50" rx="8" fill="#c5e9ee" stroke="#47d7ac" strokeWidth="2" />
    <rect x="27" y="47" width="24" height="36" fill="#8adde6" stroke="#31bd83" strokeWidth="1" />
    <rect x="59" y="47" width="24" height="36" fill="#8adde6" stroke="#31bd83" strokeWidth="1" />
    <rect x="91" y="47" width="24" height="36" fill="#8adde6" stroke="#31bd83" strokeWidth="1" />
    <rect x="123" y="47" width="15" height="36" fill="#f5fff9" stroke="#85e4bc" strokeWidth="1" />
    <circle cx="40" cy="25" r="18" fill="#ffe97a" filter="url(#glow)" />
    <defs>
      <filter id="glow" x="0" y="0" width="80" height="80" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

