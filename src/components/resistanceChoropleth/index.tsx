"use client";

import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapRegionalResistance } from "@/lib/hooks/useAMRTrends";
import ugandaGeoJSON from "../../../public/uganda_geo.json";
import Legend from "./legend";
import useScreenSize from "@/lib/hooks/useScreenSize";
import dynamic from "next/dynamic";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });
import { organisms, antibiotics } from "../homePage/constants";

interface FacilityData {
  facility_name: string;
  resistant_cases: number;
}

const getZoomLevel = (screenSize: number): number => {
  if (screenSize < 640) {
    return 6;
  } else {
    return 7;
  }
};

const getColor = (d: number) => {
  if (d === 0) return "#CCCCCC";
  if (d > 0 && d <= 50) return "#FF6969";
  if (d > 50 && d <= 100) return "#FF3333";
  if (d > 100 && d <= 500) return "#CC0000";
  if (d > 500 && d <= 1000) return "#990000";
  if (d > 1000) return "#660000";
  return "#FF9A9A";
};

const ResistanceChoropleth: React.FC = () => {
  const [year, setYear] = useState<number | null>(null);

  const screenSize = useScreenSize();
  const zoomLevel = getZoomLevel(screenSize);
  const [selectedOrganism, setSelectedOrganism] = useState("ecoli");
  const [selectedAntibiotic, setSelectedAntibiotic] = useState(
    antibiotics[0].value
  );
  const { data, isLoading, error, isSuccess, refetch } =
    useMapRegionalResistance(year, selectedOrganism, selectedAntibiotic);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const resistanceMap = data?.data?.data?.reduce(
    (acc: any, facility: FacilityData) => {
      acc[facility.facility_name.trim()] = facility.resistant_cases;
      return acc;
    },
    {} as Record<string, number>
  );

  useEffect(() => {
    refetch();
  }, [year, selectedAntibiotic, selectedOrganism]);

  // Initialize Leaflet map when data is ready.
  // Returning map.remove() in cleanup is what makes this survive
  // React 18 StrictMode's mount -> unmount -> remount cycle.
  useEffect(() => {
    if (!isSuccess) return;

    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: [1.3733, 32.2903],
      zoom: zoomLevel,
      minZoom: zoomLevel,
      maxZoom: zoomLevel,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      geoJsonRef.current = null;
    };
  }, [isSuccess]);

  // Update zoom imperatively when screen size changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setMinZoom(zoomLevel);
    mapRef.current.setMaxZoom(zoomLevel);
    mapRef.current.setZoom(zoomLevel);
  }, [zoomLevel]);

  // Swap the GeoJSON layer whenever the resistance data changes
  useEffect(() => {
    if (!mapRef.current || !resistanceMap) return;

    if (geoJsonRef.current) {
      mapRef.current.removeLayer(geoJsonRef.current);
      geoJsonRef.current = null;
    }

    geoJsonRef.current = L.geoJSON(ugandaGeoJSON as any, {
      style: (feature: any) => ({
        fillColor: getColor(resistanceMap[feature.properties.name.trim()] || 0),
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
      }),
      onEachFeature: (feature: any, layer: L.Layer) => {
        const facilityName = feature.properties.name;
        const resistantCases = resistanceMap[facilityName.trim()] || "unknown";
        layer.bindPopup(
          `<strong>${facilityName}</strong><br/>Resistant Cases: ${resistantCases}`
        );
      },
    }).addTo(mapRef.current);
  }, [resistanceMap]);

  const handleOrganismChange = (e: any) => {
    setSelectedOrganism(e.target.value);
  };
  const handleAntibioticChange = (e: any) => {
    setSelectedAntibiotic(e.target.value);
  };

  return (
    <div className="relative flex flex-col">
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="mb-1 flex flex-col text-black">
          <label className="mb-1 text-sm font-medium">Year</label>
          <select
            value={year || ""}
            onChange={(e) =>
              setYear(
                e.target.value === "overall" ? null : parseInt(e.target.value)
              )
            }
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="overall">Overall</option>
            {/* <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option> */}
            {/* Hide year filter for now */}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Organism</label>
          <select
            value={selectedOrganism}
            onChange={handleOrganismChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {organisms.map((organism) => (
              <option key={organism.value} value={organism.value}>
                {organism.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Antibiotic</label>
          <select
            value={selectedAntibiotic}
            onChange={handleAntibioticChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {antibiotics.map((anti) => (
              <option key={anti.value} value={anti.value}>
                {anti.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center min-h-[300px]">
          <span className="loader">
            <DotsLoader />
          </span>{" "}
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center min-h-[300px]">
          <p>Error: Failed to load resistance map</p>
        </div>
      )}

      {isSuccess && (
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div
            ref={containerRef}
            className="overflow-hidden rounded-lg"
            style={{
              height: screenSize < 640 ? "300px" : "500px",
              width: "100%",
            }}
          />
          <Legend />
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">CLSI. Performance Standards for Antimicrobial Susceptibility Testing. 34th ed. CLSI supplement M100. Clinical and Laboratory Standards Institute; 2024.</p>
    </div>
  );
};

export default ResistanceChoropleth;
