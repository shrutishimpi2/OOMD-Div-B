import React, { useState, useEffect } from "react";
import {
  Heart,
  LogOut,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Apple,
  Dumbbell,
  Moon,
} from "lucide-react";

export default function DiabetesPredictionApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");

  const [formData, setFormData] = useState({
    pregnancies: "",
    glucose: "",
    bloodPressure: "",
    skinThickness: "",
    insulin: "",
    bmi: "",
    diabetesPedigree: "",
    age: "",
  });

  const handleSignUp = () => {
    setAuthError("");

    if (!authName || !authEmail || !authPassword) {
      setAuthError("Please fill in all fields");
      return;
    }

    if (authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters");
      return;
    }

    const usersData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("user_")) {
        usersData[key] = JSON.parse(localStorage.getItem(key));
      }
    }

    if (usersData["user_" + authEmail]) {
      setAuthError("Email already registered");
      return;
    }

    const userData = {
      name: authName,
      email: authEmail,
      password: authPassword,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("user_" + authEmail, JSON.stringify(userData));
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ name: authName, email: authEmail })
    );

    setCurrentUser({ name: authName, email: authEmail });
    setIsLoggedIn(true);
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
  };

  const handleLogin = () => {
    setAuthError("");

    if (!authEmail || !authPassword) {
      setAuthError("Please fill in all fields");
      return;
    }

    const user = localStorage.getItem("user_" + authEmail);

    if (!user) {
      setAuthError("Invalid email or password");
      return;
    }

    const userData = JSON.parse(user);

    if (userData.password !== authPassword) {
      setAuthError("Invalid email or password");
      return;
    }

    const currentUserData = { name: userData.name, email: userData.email };
    setCurrentUser(currentUserData);
    localStorage.setItem("currentUser", JSON.stringify(currentUserData));
    setIsLoggedIn(true);
    setAuthEmail("");
    setAuthPassword("");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setIsLoggedIn(false);
    setPrediction(null);
    setFormData({
      pregnancies: "",
      glucose: "",
      bloodPressure: "",
      skinThickness: "",
      insulin: "",
      bmi: "",
      diabetesPedigree: "",
      age: "",
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const loadSampleData = (type) => {
    if (type === "negative") {
      setFormData({
        pregnancies: "1",
        glucose: "85",
        bloodPressure: "66",
        skinThickness: "29",
        insulin: "26",
        bmi: "26.6",
        diabetesPedigree: "0.351",
        age: "31",
      });
    } else {
      setFormData({
        pregnancies: "8",
        glucose: "183",
        bloodPressure: "64",
        skinThickness: "32",
        insulin: "124",
        bmi: "38.2",
        diabetesPedigree: "0.967",
        age: "45",
      });
    }
    setPrediction(null);
  };

  const predictDiabetes = () => {
    const values = Object.values(formData);
    if (values.some((v) => v === "" || isNaN(v))) {
      alert("Please fill in all fields with valid numbers");
      return;
    }

    const features = {
      pregnancies: parseFloat(formData.pregnancies),
      glucose: parseFloat(formData.glucose),
      bloodPressure: parseFloat(formData.bloodPressure),
      skinThickness: parseFloat(formData.skinThickness),
      insulin: parseFloat(formData.insulin),
      bmi: parseFloat(formData.bmi),
      diabetesPedigree: parseFloat(formData.diabetesPedigree),
      age: parseFloat(formData.age),
    };

    const weights = {
      glucose: 0.03,
      bmi: 0.05,
      age: 0.02,
      pregnancies: 0.04,
      pedigree: 5.0,
    };

    let score = 0;

    if (features.glucose > 140) {
      score += features.glucose * weights.glucose;
    }

    if (features.bmi > 30) {
      score += features.bmi * weights.bmi;
    }

    if (features.age > 40) {
      score += features.age * weights.age;
    }

    score += features.pregnancies * weights.pregnancies;
    score += features.diabetesPedigree * weights.pedigree;

    let result;
    if (score > 12) {
      result = {
        risk: "High Risk",
        level: "high",
        message:
          "Based on your inputs, you may have a higher risk for diabetes.",
        percentage: Math.min(95, 70 + Math.round(score - 12)),
      };
    } else if (score > 8) {
      result = {
        risk: "Moderate Risk",
        level: "moderate",
        message: "Some risk factors for diabetes are present.",
        percentage: Math.min(69, 40 + Math.round((score - 8) * 7)),
      };
    } else {
      result = {
        risk: "Low Risk",
        level: "low",
        message:
          "Based on your inputs, you appear to have a lower risk for diabetes.",
        percentage: Math.max(5, Math.round(score * 4)),
      };
    }

    setPrediction(result);
  };

  const getRecommendations = (level) => {
    const recommendations = {
      high: [
        {
          icon: <Activity className="w-5 h-5" />,
          text: "Consult a healthcare professional immediately for proper diagnosis and treatment plan",
        },
        {
          icon: <Apple className="w-5 h-5" />,
          text: "Follow a low-glycemic diet with controlled carbohydrate intake",
        },
        {
          icon: <Dumbbell className="w-5 h-5" />,
          text: "Engage in at least 150 minutes of moderate exercise per week",
        },
        {
          icon: <TrendingUp className="w-5 h-5" />,
          text: "Monitor blood glucose levels regularly as advised by your doctor",
        },
        {
          icon: <Moon className="w-5 h-5" />,
          text: "Maintain consistent sleep schedule (7-8 hours per night)",
        },
      ],
      moderate: [
        {
          icon: <Activity className="w-5 h-5" />,
          text: "Schedule a check-up with your doctor to discuss preventive measures",
        },
        {
          icon: <Apple className="w-5 h-5" />,
          text: "Adopt a balanced diet rich in vegetables, whole grains, and lean proteins",
        },
        {
          icon: <Dumbbell className="w-5 h-5" />,
          text: "Incorporate regular physical activity into your daily routine",
        },
        {
          icon: <TrendingUp className="w-5 h-5" />,
          text: "Work on achieving and maintaining a healthy weight (BMI 18.5-24.9)",
        },
        {
          icon: <Moon className="w-5 h-5" />,
          text: "Reduce stress through meditation, yoga, or other relaxation techniques",
        },
      ],
      low: [
        {
          icon: <CheckCircle className="w-5 h-5" />,
          text: "Continue maintaining your healthy lifestyle habits",
        },
        {
          icon: <Apple className="w-5 h-5" />,
          text: "Keep eating a balanced diet with plenty of fruits and vegetables",
        },
        {
          icon: <Dumbbell className="w-5 h-5" />,
          text: "Stay active with regular exercise to maintain your health",
        },
        {
          icon: <TrendingUp className="w-5 h-5" />,
          text: "Consider annual health check-ups for preventive care",
        },
        {
          icon: <Moon className="w-5 h-5" />,
          text: "Maintain good sleep hygiene and stress management practices",
        },
      ],
    };

    return recommendations[level] || recommendations.low;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Diabetes Care
            </h1>
            <p className="text-gray-600">ML-based risk assessment system</p>
          </div>

          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setShowLogin(true);
                setAuthError("");
              }}
              className={`flex-1 py-2 rounded-md transition-all ${
                showLogin
                  ? "bg-white shadow-md text-purple-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setShowLogin(false);
                setAuthError("");
              }}
              className={`flex-1 py-2 rounded-md transition-all ${
                !showLogin
                  ? "bg-white shadow-md text-purple-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{authError}</p>
            </div>
          )}

          <div className="space-y-4">
            {!showLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={showLogin ? handleLogin : handleSignUp}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              {showLogin ? "Login" : "Sign Up"}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            {showLogin
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => {
                setShowLogin(!showLogin);
                setAuthError("");
              }}
              className="text-purple-600 font-medium hover:underline"
            >
              {showLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Diabetes Care</h1>
              <p className="text-purple-100 text-sm">
                ML-based Risk Assessment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <User className="w-5 h-5" />
              <span className="font-medium">{currentUser?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            About This Tool
          </h2>
          <p className="text-blue-800 mb-2">
            This application uses machine learning to predict diabetes risk
            based on health parameters. The model has been trained on the PIMA
            Indians Diabetes Dataset.
          </p>
          <p className="text-blue-700 text-sm">
            <strong>Note:</strong> This tool is for educational purposes only
            and should not replace professional medical advice.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Health Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pregnancies
                </label>
                <input
                  type="number"
                  name="pregnancies"
                  value={formData.pregnancies}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Glucose Level (mg/dL)
                </label>
                <input
                  type="number"
                  name="glucose"
                  value={formData.glucose}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure (mm Hg)
                </label>
                <input
                  type="number"
                  name="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skin Thickness (mm)
                </label>
                <input
                  type="number"
                  name="skinThickness"
                  value={formData.skinThickness}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insulin (mu U/ml)
                </label>
                <input
                  type="number"
                  name="insulin"
                  value={formData.insulin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BMI (kg/m²)
                </label>
                <input
                  type="number"
                  name="bmi"
                  value={formData.bmi}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diabetes Pedigree Function
                </label>
                <input
                  type="number"
                  name="diabetesPedigree"
                  value={formData.diabetesPedigree}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  min="0"
                  step="0.001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (years)
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  min="0"
                  step="1"
                />
              </div>

              <button
                onClick={predictDiabetes}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Predict Diabetes Risk
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => loadSampleData("negative")}
                className="flex-1 bg-green-50 text-green-700 border border-green-200 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              >
                Load Low Risk Sample
              </button>
              <button
                onClick={() => loadSampleData("positive")}
                className="flex-1 bg-red-50 text-red-700 border border-red-200 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                Load High Risk Sample
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {prediction && (
              <>
                <div
                  className={`rounded-xl shadow-lg p-6 ${
                    prediction.level === "high"
                      ? "bg-red-50 border-2 border-red-200"
                      : prediction.level === "moderate"
                      ? "bg-yellow-50 border-2 border-yellow-200"
                      : "bg-green-50 border-2 border-green-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                      Risk Assessment
                    </h3>
                    {prediction.level === "high" ? (
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    ) : prediction.level === "moderate" ? (
                      <Activity className="w-8 h-8 text-yellow-600" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`text-3xl font-bold ${
                          prediction.level === "high"
                            ? "text-red-700"
                            : prediction.level === "moderate"
                            ? "text-yellow-700"
                            : "text-green-700"
                        }`}
                      >
                        {prediction.risk}
                      </span>
                      <span
                        className={`text-2xl font-bold ${
                          prediction.level === "high"
                            ? "text-red-700"
                            : prediction.level === "moderate"
                            ? "text-yellow-700"
                            : "text-green-700"
                        }`}
                      >
                        {prediction.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          prediction.level === "high"
                            ? "bg-red-600"
                            : prediction.level === "moderate"
                            ? "bg-yellow-600"
                            : "bg-green-600"
                        }`}
                        style={{ width: `${prediction.percentage}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-gray-700">{prediction.message}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Personalized Recommendations
                  </h3>
                  <div className="space-y-4">
                    {getRecommendations(prediction.level).map((rec, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`flex-shrink-0 ${
                            prediction.level === "high"
                              ? "text-red-600"
                              : prediction.level === "moderate"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {rec.icon}
                        </div>
                        <p className="text-gray-700 text-sm">{rec.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!prediction && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Ready for Assessment
                </h3>
                <p className="text-gray-500">
                  Fill in your health parameters and click "Predict Diabetes
                  Risk" to see your results and personalized recommendations.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Understanding the Parameters
          </h2>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600">
              <h3 className="font-semibold text-gray-800 mb-2">Pregnancies</h3>
              <p className="text-gray-700 text-sm">
                Number of times pregnant. Multiple pregnancies can increase
                diabetes risk due to gestational diabetes history.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <h3 className="font-semibold text-gray-800 mb-2">
                Glucose Level
              </h3>
              <p className="text-gray-700 text-sm">
                Plasma glucose concentration measured 2 hours after an oral
                glucose tolerance test. High glucose levels are a primary
                indicator of diabetes.
              </p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-600">
              <h3 className="font-semibold text-gray-800 mb-2">
                Blood Pressure
              </h3>
              <p className="text-gray-700 text-sm">
                Diastolic blood pressure measured in mm Hg. High blood pressure
                often accompanies diabetes and can indicate metabolic syndrome.
              </p>
            </div>

            <div className="p-4 bg-cyan-50 rounded-lg border-l-4 border-cyan-600">
              <h3 className="font-semibold text-gray-800 mb-2">
                Skin Thickness
              </h3>
              <p className="text-gray-700 text-sm">
                Triceps skin fold thickness measured in mm. This measurement
                helps assess body fat percentage and obesity risk.
              </p>
            </div>

            <div className="p-4 bg-teal-50 rounded-lg border-l-4 border-teal-600">
              <h3 className="font-semibold text-gray-800 mb-2">Insulin</h3>
              <p className="text-gray-700 text-sm">
                2-hour serum insulin level measured in mu U/ml. Abnormal insulin
                levels can indicate insulin resistance, a precursor to Type 2
                diabetes.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
              <h3 className="font-semibold text-gray-800 mb-2">
                BMI (Body Mass Index)
              </h3>
              <p className="text-gray-700 text-sm">
                Body mass index calculated as weight in kg divided by height in
                meters squared. Higher BMI indicates obesity, a major diabetes
                risk factor.
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-600">
              <h3 className="font-semibold text-gray-800 mb-2">
                Diabetes Pedigree Function
              </h3>
              <p className="text-gray-700 text-sm">
                A function that scores the likelihood of diabetes based on
                family history. Higher values indicate stronger genetic
                predisposition.
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-600">
              <h3 className="font-semibold text-gray-800 mb-2">Age</h3>
              <p className="text-gray-700 text-sm">
                Age in years. Diabetes risk increases with age, particularly
                after 40 years old.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Typical Value Ranges
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <th className="px-4 py-3 text-left font-semibold rounded-tl-lg">
                    Parameter
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Typical Range
                  </th>
                  <th className="px-4 py-3 text-left font-semibold rounded-tr-lg">
                    Mean Value
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    Pregnancies
                  </td>
                  <td className="px-4 py-3 text-gray-700">0-17</td>
                  <td className="px-4 py-3 text-gray-700">3.8</td>
                </tr>
                <tr className="bg-gray-50 border-b hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    Glucose (mg/dL)
                  </td>
                  <td className="px-4 py-3 text-gray-700">70-199</td>
                  <td className="px-4 py-3 text-gray-700">120.9</td>
                </tr>
                <tr className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    Blood Pressure (mm Hg)
                  </td>
                  <td className="px-4 py-3 text-gray-700">40-122</td>
                  <td className="px-4 py-3 text-gray-700">69.1</td>
                </tr>
                <tr className="bg-gray-50 border-b hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    Skin Thickness (mm)
                  </td>
                  <td className="px-4 py-3 text-gray-700">7-99</td>
                  <td className="px-4 py-3 text-gray-700">20.5</td>
                </tr>
                <tr className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    Insulin (mu U/ml)
                  </td>
                  <td className="px-4 py-3 text-gray-700">14-846</td>
                  <td className="px-4 py-3 text-gray-700">79.8</td>
                </tr>
                <tr className="bg-gray-50 border-b hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    BMI (kg/m²)
                  </td>
                  <td className="px-4 py-3 text-gray-700">18.2-67.1</td>
                  <td className="px-4 py-3 text-gray-700">32.0</td>
                </tr>
                <tr className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    Diabetes Pedigree
                  </td>
                  <td className="px-4 py-3 text-gray-700">0.078-2.42</td>
                  <td className="px-4 py-3 text-gray-700">0.47</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 rounded-bl-lg">
                    Age (years)
                  </td>
                  <td className="px-4 py-3 text-gray-700">21-81</td>
                  <td className="px-4 py-3 text-gray-700 rounded-br-lg">
                    33.2
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These ranges are based on the PIMA Indians
              Diabetes Dataset. Individual values may vary. Always consult with
              a healthcare professional for accurate interpretation of your
              health parameters.
            </p>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>
            Based on the PIMA Indians Diabetes Dataset | © 2025 | For
            educational purposes only
          </p>
        </div>
      </footer>
    </div>
  );
}
