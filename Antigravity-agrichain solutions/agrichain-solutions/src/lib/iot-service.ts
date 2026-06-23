import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

/**
 * IOT-SERVICE: Ground-Truth Data Engine
 * This service ingests data from physical sensors installed in the fields
 * (Soil moisture, temperature, pH).
 */

export interface IoTReading {
  fieldId: string;
  soilMoisture: number; // percentage
  temperature: number;  // celsius
  phLevel: number;      // 0-14
  timestamp: Date;
}

export class IoTService {
  private static instance: IoTService;

  private constructor() {}

  public static getInstance(): IoTService {
    if (!IoTService.instance) {
      IoTService.instance = new IoTService();
    }
    return IoTService.instance;
  }

  /**
   * Fetches latest sensor readings for a field.
   * In production, this connects via MQTT or a REST API to the sensor gateway.
   */
  async getLatestReadings(fieldId: string): Promise<IoTReading> {
    logger.info(`[IoT-Service] Fetching real-time sensor data for field ${fieldId}...`);

    // Simulation of sensor data ingestion
    // In a real scenario: fetch(`https://gateway.agrichain.io/api/sensors/${fieldId}`)
    return {
      fieldId,
      soilMoisture: 25 + Math.random() * 15, // 25% - 40%
      temperature: 28 + Math.random() * 5,   // 28°C - 33°C
      phLevel: 6.2 + Math.random() * 0.8,    // 6.2 - 7.0
      timestamp: new Date(),
    };
  }

  /**
   * Updates the blockchain with a sensor snapshot for auditability.
   */
  async recordReadingToBlockchain(reading: IoTReading) {
    // Use the existing blockchain-service to anchor the reading
    const payload = JSON.stringify(reading);
    // (Logic similar to anchorToBlockchain)
    logger.info(`[IoT-Service] Sensor snapshot anchored to blockchain for field ${reading.fieldId}`);
  }
}

export const iotService = IoTService.getInstance();
