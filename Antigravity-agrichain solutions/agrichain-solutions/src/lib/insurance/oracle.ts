import { ethers } from "ethers";
import axios from "axios";

interface WeatherData {
  rain: number; // Precipitation in mm
  temp: number; // Temperature in Celsius
}

interface SatelliteData {
  ndvi: number; // Normalized Difference Vegetation Index (-1 to 1)
}

export class InsuranceOracle {
  private weatherApiKey: string;
  private sentinelApiKey: string;
  private contractAddress: string;
  private privateKey: string;

  constructor() {
    this.weatherApiKey = process.env.OPENWEATHER_API_KEY || "";
    this.sentinelApiKey = process.env.SENTINEL_HUB_API_KEY || "";
    this.contractAddress = process.env.INSURANCE_CONTRACT_ADDRESS || "";
    this.privateKey = process.env.ORACLE_PRIVATE_KEY || "";
  }

  /**
   * Fetches real-time precipitation data for a specific location.
   */
  async fetchWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.weatherApiKey}&units=metric`
      );
      
      // Mocking the rain value if not present in the current hourly call, in real world we use the 'forecast' or 'history' API
      const rain = response.data.rain?.["1h"] || 0;
      const temp = response.data.main?.temp || 0;

      return { rain, temp };
    } catch (error) {
      console.error("Weather API Error:", error);
      throw new Error("FAILED_TO_FETCH_WEATHER");
    }
  }

  /**
   * Fetches vegetation index (NDVI) via Sentinel Hub.
   */
  async fetchNDVI(bbox: number[]): Promise<SatelliteData> {
    try {
      // This is a simplified version of the Sentinel Hub request
      const response = await axios.post(
        "https://api.sentinel-hub.com/v1/process",
        {
          input: {
            bbox: bbox,
            time: "LAST_30_DAYS",
            evalscript: "return [NDVI];" // Simplified evalscript
          }
        },
        {
          headers: { Authorization: `Bearer ${this.sentinelApiKey}` }
        }
      );

      const ndvi = response.data.mean_ndvi || 0.5; // Default fallback
      return { ndvi };
    } catch (error) {
      console.error("Sentinel Hub API Error:", error);
      throw new Error("FAILED_TO_FETCH_SATELLITE_DATA");
    }
  }

  /**
   * Evaluates a policy and triggers payout if the threshold is breached.
   */
  async evaluatePolicy(policyId: string, lat: number, lon: number, threshold: number): Promise<boolean> {
    console.log(`Evaluating policy ${policyId}...`);
    
    const weather = await this.fetchWeather(lat, lon);
    
    // Parametric Logic: If rain is below threshold (drought), trigger payout
    if (weather.rain < threshold) {
      console.log(`🚨 Threshold breached! Rain: ${weather.rain}mm < Threshold: ${threshold}mm. Triggering payout...`);
      return await this.triggerBlockchainPayout(policyId);
    }

    console.log(`✅ Policy ${policyId} is safe. Rain: ${weather.rain}mm >= Threshold: ${threshold}mm.`);
    return false;
  }

  private async triggerBlockchainPayout(policyId: string): Promise<boolean> {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      const wallet = new ethers.Wallet(this.privateKey, provider);
      
      const abi = [
        "function triggerPayout(bytes32 _policyId) external"
      ];
      
      const contract = new ethers.Contract(this.contractAddress, abi, wallet);
      const tx = await contract.triggerPayout(policyId);
      await tx.wait();
      
      console.log(`💰 Payout successfully executed on blockchain for policy ${policyId}. Tx: ${tx.hash}`);
      return true;
    } catch (error) {
      console.error("Blockchain Payout Error:", error);
      return false;
    }
  }
}
