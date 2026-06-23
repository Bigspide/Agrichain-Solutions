import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Interface for yield prediction request
interface YieldPredictionRequest {
  fieldId?: string;
  ndvi: number; // Normalized Difference Vegetation Index (0-1)
  weatherData: {
    temperature: number; // Celsius
    rainfall: number; // mm
    humidity: number; // percentage
    sunshineHours: number; // hours per day
  };
  soilData: {
    nitrogen: number; // N content (kg/ha)
    phosphorus: number; // P content (kg/ha)
    potassium: number; // K content (kg/ha)
    ph: number; // soil pH
    organicMatter: number; // percentage
  };
  cropType: string;
  growthStage: string; // e.g., "planting", "vegetative", "flowering", "ripening"
  fieldSize: number; // hectares
  historicalYield?: number; // previous year yield (kg/ha) if available
}

// Interface for yield prediction response
interface YieldPredictionResponse {
  predictedYield: number; // kg/ha
  confidence: number; // 0-1
  factors: {
    ndviImpact: number;
    weatherImpact: number;
    soilImpact: number;
    cropSpecificImpact: number;
  };
  recommendations: string[];
  predictedHarvestDate?: string; // ISO date string
}

// Simple yield prediction model (in a real implementation, this would use ML models)
function predictYield(request: YieldPredictionRequest): YieldPredictionResponse {
  // Base yield expectations by crop type (kg/ha)
  const baseYields: Record<string, number> = {
    "maize": 5000,
    "rice": 4000,
    "sorghum": 2500,
    "millet": 2000,
    "yam": 15000,
    "cassava": 20000,
    "plantain": 12000,
    "cocoa": 500,
    "coffee": 800,
    "cotton": 1500,
    "default": 3000
  };

  const baseYield = baseYields[request.cropType.toLowerCase()] || baseYields.default;

  // NDVI impact (0.0 to 1.0 scale, where 0.7+ is excellent vegetation)
  const ndviImpact = Math.max(0, Math.min(1, (request.ndvi - 0.3) / 0.7)); // Normalize NDVI impact

  // Weather impact (optimal ranges vary by crop, using general ranges)
  const tempOptimal = 25; // Celsius
  const rainOptimal = 100; // mm per week (simplified)
  const humidityOptimal = 70; // percentage

  const tempScore = Math.max(0, 1 - Math.abs(request.weatherData.temperature - tempOptimal) / 15);
  const rainScore = Math.max(0, 1 - Math.abs(request.weatherData.rainfall - rainOptimal) / 50);
  const humidityScore = Math.max(0, 1 - Math.abs(request.weatherData.humidity - humidityOptimal) / 30);
  const weatherImpact = (tempScore + rainScore + humidityScore) / 3;

  // Soil impact (simplified)
  const NScore = Math.min(1, request.soilData.nitrogen / 100); // Optimal around 100kg/ha
  const PScore = Math.min(1, request.soilData.phosphorus / 50); // Optimal around 50kg/ha
  const KScore = Math.min(1, request.soilData.potassium / 100); // Optimal around 100kg/ha
  const pHScore = request.soilData.ph >= 6.0 && request.soilData.ph <= 7.5 ? 1 :
                  Math.max(0, 1 - Math.abs(request.soilData.ph - 6.75) / 2); // Optimal pH 6.0-7.5
  const OMScore = Math.min(1, request.soilData.organicMatter / 5); // Optimal around 5%

  const soilImpact = (NScore + PScore + KScore + pHScore + OMScore) / 5;

  // Crop-specific impact based on growth stage
  const stageImpact: Record<string, number> = {
    "planting": 0.3,
    "vegetative": 0.6,
    "flowering": 0.8,
    "ripening": 0.9,
    "harvest": 1.0
  };
  const cropSpecificImpact = stageImpact[request.growthStage.toLowerCase()] || 0.5;

  // Calculate final predicted yield
  const yieldFactor = (ndviImpact * 0.3) + (weatherImpact * 0.25) + (soilImpact * 0.25) + (cropSpecificImpact * 0.2);
  const predictedYield = baseYield * yieldFactor;

  // Adjust for historical data if available
  if (request.historicalYield && request.historicalYield > 0) {
    // Blend prediction with historical data (70% prediction, 30% historical)
    const blendedYield = (predictedYield * 0.7) + (request.historicalYield * 0.3);
    return {
      predictedYield: Math.round(blendedYield),
      confidence: 0.8,
      factors: {
        ndviImpact: Number(ndviImpact.toFixed(2)),
        weatherImpact: Number(weatherImpact.toFixed(2)),
        soilImpact: Number(soilImpact.toFixed(2)),
        cropSpecificImpact: Number(cropSpecificImpact.toFixed(2))
      },
      recommendations: generateRecommendations(request, { ndviImpact, weatherImpact, soilImpact, cropSpecificImpact }),
      predictedHarvestDate: calculatePredictedHarvestDate(request.growthStage)
    };
  }

  // Generate recommendations based on analysis
  const recommendations = generateRecommendations(request, { ndviImpact, weatherImpact, soilImpact, cropSpecificImpact });

  return {
    predictedYield: Math.round(predictedYield),
    confidence: 0.75,
    factors: {
      ndviImpact: Number(ndviImpact.toFixed(2)),
      weatherImpact: Number(weatherImpact.toFixed(2)),
      soilImpact: Number(soilImpact.toFixed(2)),
      cropSpecificImpact: Number(cropSpecificImpact.toFixed(2))
    },
    recommendations,
    predictedHarvestDate: calculatePredictedHarvestDate(request.growthStage)
  };
}

// Generate recommendations based on analysis
function generateRecommendations(request: YieldPredictionRequest, factors: any): string[] {
  const recommendations: string[] = [];

  // NDVI recommendations
  if (factors.ndviImpact < 0.5) {
    recommendations.push("Consider improving crop health through better nutrition or pest management");
    if (request.ndvi < 0.3) {
      recommendations.push("Low NDVI detected - investigate potential causes: water stress, nutrient deficiency, or pest damage");
    }
  } else {
    recommendations.push("Crop health is good based on vegetation indices");
  }

  // Weather recommendations
  if (request.weatherData.temperature < 20 || request.weatherData.temperature > 35) {
    recommendations.push("Temperature outside optimal range - consider shade nets or irrigation timing adjustments");
  }

  if (request.weatherData.rainfall < 50) {
    recommendations.push("Low rainfall detected - consider irrigation supplementation");
  } else if (request.weatherData.rainfall > 200) {
    recommendations.push("High rainfall detected - ensure proper drainage to prevent waterlogging");
  }

  // Soil recommendations
  if (factors.soilImpact < 0.6) {
    recommendations.push("Soil health requires attention - consider soil testing and amendment");
    if (request.soilData.ph < 6.0) {
      recommendations.push("Soil pH is too low - consider applying lime to raise pH");
    } else if (request.soilData.ph > 7.5) {
      recommendations.push("Soil pH is too high - consider applying sulfur to lower pH");
    }

    if (request.soilData.nitrogen < 50) {
      recommendations.append("Nitrogen levels low - consider nitrogen-rich fertilizer application");
    }
    if (request.soilData.organicMatter < 2) {
      recommendations.push("Low organic matter - consider compost or cover crops");
    }
  }

  // Crop-specific recommendations
  if (request.growthStage.toLowerCase() === "flowering" && factors.ndviImpact < 0.6) {
    recommendations.push("During flowering stage - ensure adequate water and nutrients for optimal grain/set formation");
  }

  if (request.growthStage.toLowerCase() === "ripening") {
    recommendations.push("Ripening stage approaching - prepare for harvest and reduce irrigation");
  }

  // Add general recommendation if none specific
  if (recommendations.length === 0) {
    recommendations.push("Current conditions are favorable for optimal yield - maintain current practices");
  }

  return recommendations;
}

// Calculate predicted harvest date based on growth stage
function calculatePredictedHarvestDate(growthStage: string): string | undefined {
  const now = new Date();
  let daysToAdd = 0;

  switch (growthStage.toLowerCase()) {
    case "planting":
      daysToAdd = 90; // ~3 months to harvest
      break;
    case "vegetative":
      daysToAdd = 60; // ~2 months to harvest
      break;
    case "flowering":
      daysToAdd = 45; // ~1.5 months to harvest
      break;
    case "ripening":
      daysToAdd = 20; // ~3 weeks to harvest
      break;
    case "harvest":
      daysToAdd = 0; // Ready for harvest
      break;
    default:
      daysToAdd = 45; // Default to flowering stage timing
  }

  const harvestDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
  return harvestDate.toISOString();
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: YieldPredictionRequest = await request.json();

    // Validate required fields
    if (body.ndvi === undefined || !body.weatherData || !body.soilData || !body.cropType || !body.growthStage || body.fieldSize === undefined) {
      return NextResponse.json(
        { error: "Missing required fields for yield prediction" },
        { status: 400 }
      );
    }

    // Validate field data ranges
    if (body.ndvi < 0 || body.ndvi > 1) {
      return NextResponse.json(
        { error: "NDVI must be between 0 and 1" },
        { status: 400 }
      );
    }

    // Generate yield prediction
    const prediction = predictYield(body);

    // Return prediction
    return NextResponse.json<YieldPredictionResponse>(prediction);
  } catch (error) {
    console.error("Yield prediction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return available endpoints or model info
    return NextResponse.json({
      availableEndpoints: {
        POST: "/api/yield-prediction - Generate crop yield prediction"
      },
      supportedMetrics: [
        "NDVI (Normalized Difference Vegetation Index)",
        "Weather data (temperature, rainfall, humidity, sunshine)",
        "Soil data (N-P-K, pH, organic matter)",
        "Crop type and growth stage",
        "Historical yield data"
      ],
      output: [
        "Predicted yield (kg/ha)",
        "Confidence score (0-1)",
        "Impact factors breakdown",
        "Actionable recommendations",
        "Predicted harvest date"
      ]
    });
  } catch (error) {
    console.error("Yield prediction GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}