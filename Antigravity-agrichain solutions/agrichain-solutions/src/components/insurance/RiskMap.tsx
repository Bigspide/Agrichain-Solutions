"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function RiskMap() {
  // Example coordinates for a field in Côte d'Ivoire
  const position: [number, number] = [5.3484, -4.0305]; 
  
  return (
    <MapContainer 
      center={position} 
      zoom={13} 
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Circle 
        center={position} 
        radius={1000} 
        pathOptions={{ 
          color: '#ef4444', 
          fillColor: '#ef4444', 
          fillOpacity: 0.4,
          weight: 2 
        }}
      >
        <Popup>
          <div className="p-2 font-sans">
            <p className="font-bold text-red-600">Zone à Risque Élevé</p>
            <p className="text-xs">Précipitations: 8mm / Seuil: 10mm</p>
            <p className="text-xs font-medium mt-1 text-gray-600">Alerte Payout Active</p>
          </div>
        </Popup>
      </Circle>
    </MapContainer>
  );
}
