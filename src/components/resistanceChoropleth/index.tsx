import React, { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMapRegionalResistance } from "@/lib/hooks/useAMRTrends";
import L from "leaflet";
import ugandaGeoJSON from "../../../public/uganda_geo.json";
import Legend from "./legend";
import useScreenSize from "@/lib/hooks/useScreenSize";
import dynamic from "next/dynamic";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

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

const ResistanceChoropleth: React.FC = () => {
  const [year, setYear] = useState<number | null>(null);
  const { data, isLoading, error, isSuccess } = useMapRegionalResistance(year);
  const screenSize = useScreenSize(); // Get the current screen size
  const zoomLevel = getZoomLevel(screenSize);

  // Create a mapping of facility names to resistance cases
  const resistanceMap = data?.data?.data?.reduce(
    (acc: any, facility: FacilityData) => {
      acc[facility.facility_name.trim()] = facility.resistant_cases;
      return acc;
    },
    {} as Record<string, number>
  );

  // Function to style each feature
  const getColor = (d: number) => {
    if (d === 0) return "#CCCCCC"; // Very Light Red for 0 cases
    if (d > 0 && d <= 100) return "#FF6969"; // Light Red
    if (d > 100 && d <= 500) return "#FF3333"; // Moderate Red
    if (d > 500 && d <= 1000) return "#CC0000"; // Medium Red
    if (d > 1000 && d <= 5000) return "#990000"; // High Red
    if (d > 5000) return "#660000"; // Dark Red (Very High)
    return "#FF9A9A"; // Default to very light red if none match
  };

  const style = (feature: any) => {
    const facilityName = feature.properties.name;
    const resistantCases = resistanceMap[facilityName.trim()] || 0;
    return {
      fillColor: getColor(resistantCases),
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const facilityName = feature.properties.name;
    const resistantCases = resistanceMap[facilityName.trim()] || 'unknown';
    layer.bindPopup(
      `<strong>${facilityName}</strong><br/>Resistant Cases: ${resistantCases}`
    );
  };

  return (
    <div className="relative flex flex-col">
      <label className="text-black font-semibold mb-2">
        Year:
        <select
          value={year || ""}
          onChange={(e) =>
            setYear(
              e.target.value === "overall" ? null : parseInt(e.target.value)
            )
          }
          className="ml-2 border border-gray-300 rounded-md bg-white text-gray-700 py-2 px-3 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="overall">Overall</option>
          <option value="2020">2020</option>
          <option value="2021">2021</option>
          <option value="2022">2022</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
        </select>
      </label>

      {isLoading && (
        <div className="flex justify-center items-center min-h-[300px]">
          <span className="loader">
            <DotsLoader />
          </span>{" "}
          {/* You can replace this with a spinner component */}
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center min-h-[300px]">
          <p>Error: Failed to load resistance map</p>
        </div>
      )}

      {isSuccess && (
        <div className="flex flex-col md:flex-row justify-between">
          <MapContainer
            center={[1.3733, 32.2903]} // Center of Uganda
            zoom={zoomLevel} // Initial zoom level
            minZoom={zoomLevel} // Set minimum zoom level
            maxZoom={zoomLevel} // Set maximum zoom level (unzoomable)
            style={{
              height: screenSize < 640 ? "300px" : "500px",
              width: "100%",
            }} // Set width to 100% for responsiveness
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <GeoJSON
              // @ts-ignore
              data={ugandaGeoJSON}
              style={style}
              onEachFeature={onEachFeature}
            />
          </MapContainer>
          <Legend /> {/* Add margin for spacing */}
        </div>
      )}
    </div>
  );
};

export default ResistanceChoropleth;
