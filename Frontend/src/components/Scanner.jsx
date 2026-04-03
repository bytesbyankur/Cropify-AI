import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Network } from '@capacitor/network';
import * as tf from '@tensorflow/tfjs';
import { TRANSLATIONS } from './translations';

// 🌿 OFFLINE TF.JS CONFIGURATION
const SUPPORTED_PLANTS = ["apple", "corn", "grapes", "potato", "tomato"];

const DISEASE_LABELS = {
  tomato: ["Tomato - healthy", "Tomato - Early blight", "Tomato - Late blight", "Tomato - Bacterial spot", "Tomato - Leaf Mold", "Tomato - Septoria leaf spot", "Tomato - Spider mites", "Tomato - Target Spot", "Tomato - Tomato Yellow Leaf Curl Virus", "Tomato - Tomato mosaic virus"],
  apple: ["Apple - healthy", "Apple - Apple scab", "Apple - Cedar apple rust", "Apple - Black rot"],
  corn: ["Corn - healthy", "Corn - Northern Leaf Blight", "Corn - Common rust", "Corn - Cercospora leaf spot Gray leaf spot"],
  grapes: ["Grapes - healthy", "Grapes - Black rot", "Grapes - Esca (Black Measles)", "Grapes - Leaf Blight (Isariopsis Leaf Spot)"],
  potato: ["Potato - healthy", "Potato - Early blight", "Potato - Late blight"]
};

// ... KEEP YOUR DISEASE_DETAILS DICTIONARY HERE ...
// (I am omitting it for brevity, but paste your massive DISEASE_DETAILS object right here exactly as you had it!)
const DISEASE_DETAILS = { /* Insert your existing dictionary here */ };

const Scanner = ({ imagePreview, setImagePreview, isAnalyzing, setIsAnalyzing, setDiseaseData, language = "English" }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [scanStatus, setScanStatus] = useState("");

  const [selectedPlant, setSelectedPlant] = useState("tomato");
  const [isOnline, setIsOnline] = useState(true);

  // Setup Dictionary Shortcut
  const t = TRANSLATIONS[language] || TRANSLATIONS["English"];

  useEffect(() => {
    let networkListener;
    const checkInitialStatus = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
    };
    checkInitialStatus();

    const setupListener = async () => {
      networkListener = await Network.addListener('networkStatusChange', status => {
        setIsOnline(status.connected);
      });
    };
    setupListener();

    return () => { if (networkListener) networkListener.remove(); };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setDiseaseData(null);
      setErrorMessage(null);
      setScanStatus("");
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    const currentNetworkStatus = await Network.getStatus();

    if (currentNetworkStatus.connected) {
      setScanStatus(`${t.processingBtn} (${language})`);
      
      const formData = new FormData();
      formData.append('image', selectedFile);
      // 🔥 SEND THE CURRENT NAVBAR LANGUAGE TO DJANGO!
      formData.append('language', language);

      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.post(apiUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setDiseaseData(response.data);
      } catch (error) {
        console.error("API Error:", error);
        setErrorMessage(error.response ? `Server Error: ${error.response.status}` : "Network Error. Is the Django server running?");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      try {
        await new Promise((resolve, reject) => {
          const imgElement = new Image();
          imgElement.src = imagePreview;

          imgElement.onload = async () => {
            let specialistTensor, diseasePredictionTensor, specialistModel;
            try {
              const canvas = document.createElement('canvas');
              canvas.width = 224; canvas.height = 224;
              const ctx = canvas.getContext('2d');
              const size = Math.min(imgElement.width, imgElement.height);
              const startX = (imgElement.width - size) / 2;
              const startY = (imgElement.height - size) / 2;
              ctx.drawImage(imgElement, startX, startY, size, size, 0, 0, 224, 224);

              setScanStatus(`Loading ${selectedPlant.toUpperCase()} specialist...`);
              specialistModel = await tf.loadLayersModel(`/models/tfjs_${selectedPlant}/model.json`);
              setScanStatus(t.processingBtn);

              specialistTensor = tf.browser.fromPixels(canvas).toFloat().div(255.0).expandDims();
              diseasePredictionTensor = specialistModel.predict(specialistTensor);
              const diseasePredictions = await diseasePredictionTensor.data();

              const diseaseIndex = diseasePredictions.indexOf(Math.max(...diseasePredictions));
              const confidenceScore = (diseasePredictions[diseaseIndex] * 100).toFixed(2);
              const predictedDiseaseName = DISEASE_LABELS[selectedPlant][diseaseIndex];
              
              const details = DISEASE_DETAILS[predictedDiseaseName] || {
                severity: "Unknown",
                observedSymptoms: "Unable to load offline symptoms.",
                remedy: "Diagnosis incomplete. Please connect to the internet."
              };

              setDiseaseData({
                name: predictedDiseaseName || "Unknown Disease",
                confidence: `${confidenceScore}%`,
                severity: null, 
                symptoms: details.observedSymptoms,
                remedy: details.remedy,
                rootCause: "📡 Offline Mode: Please connect to the internet for deep AI root cause analysis.",
                weatherContext: "📡 Offline Mode: Weather context requires an active internet connection."
              });
              resolve();
            } catch (innerError) {
              reject(innerError);
            } finally {
              if (specialistTensor) specialistTensor.dispose();
              if (diseasePredictionTensor) diseasePredictionTensor.dispose();
              if (specialistModel) specialistModel.dispose();
            }
          };
          imgElement.onerror = () => reject(new Error("Failed to read the image file."));
        });
      } catch (error) {
        setErrorMessage(`Failed to load the ${selectedPlant} model.`);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleDiscard = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setDiseaseData(null);
    setErrorMessage(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">

      <AnimatePresence>
        {!isOnline && (
          <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: "auto", marginBottom: 24 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="overflow-hidden">
            <label className="block text-sm font-semibold text-amber-600 dark:text-amber-500 mb-2 flex items-center gap-2">
              <span className="text-lg">⚠️</span> {t.offlineFallback}
            </label>
            <select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)} disabled={isAnalyzing} className="w-full bg-amber-50 dark:bg-slate-900 border border-amber-300 dark:border-amber-600/50 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow disabled:opacity-50">
              {SUPPORTED_PLANTS.map(plant => (
                <option key={plant} value={plant}>{plant.charAt(0).toUpperCase() + plant.slice(1)}</option>
              ))}
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      {!imagePreview ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-400 dark:border-emerald-500 rounded-xl p-10 bg-emerald-50 dark:bg-emerald-900/20">
          <input type="file" accept="image/*" onChange={handleImageUpload} id="leaf-upload" className="hidden" />
          <label htmlFor="leaf-upload" className="cursor-pointer flex flex-col items-center text-center space-y-3">
            <span className="text-5xl">📸</span>
            <p className="text-slate-700 dark:text-slate-300 font-medium">{t.uploadText}</p>
            <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 shadow-md">{t.selectBtn}</span>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden shadow-inner">
            <img src={imagePreview} alt="Plant" className={`w-full h-full object-cover transition-all duration-500 ${isAnalyzing ? 'brightness-50 blur-[2px]' : ''}`} />
            {isAnalyzing && <motion.div initial={{ top: "0%" }} animate={{ top: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_4px_rgba(52,211,153,0.8)] z-10" />}
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <p className="bg-slate-900/80 text-emerald-400 font-bold px-5 py-2 text-center rounded-xl backdrop-blur-md animate-pulse border border-emerald-500/30">
                  {scanStatus}
                </p>
              </div>
            )}
          </div>

          {errorMessage && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-sm text-center font-medium">
              ⚠️ {errorMessage}
            </motion.div>
          )}

          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleScan} disabled={isAnalyzing} className={`flex-1 py-3 rounded-xl font-bold text-white ${isAnalyzing ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
              {isAnalyzing ? t.processingBtn : t.identifyBtn}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleDiscard} disabled={isAnalyzing} className="px-5 py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-600">
              {t.discardBtn}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Scanner;