import React, { useEffect, useState } from "react";
import countryList from "../data/countryList";
import mapNameAliases from "../data/mapNameAliases";
import { feature } from "topojson-client";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const normalize = (geoName) => mapNameAliases[geoName] || geoName;
const allowedCountries = new Set(countryList);
const topoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Additional small countries (rendered as dots)
const extraMarkers = [
  { name: "Andorra", coordinates: [1.5218, 42.5063] },
  { name: "Antigua and Barbuda", coordinates: [-61.8468, 17.1124] },
  { name: "Bahrain", coordinates: [50.5884, 26.0273] },
  { name: "Barbados", coordinates: [-59.5432, 13.1939] },
  { name: "Belau", coordinates: [134.5825, 7.4207] },
  { name: "Brunei", coordinates: [114.7277, 4.5353] },
  { name: "Cabo Verde", coordinates: [-23.5797, 14.933] },
  { name: "Comoros", coordinates: [43.8723, -11.6455] },
  { name: "Dominica", coordinates: [-61.371, 15.415] },
  { name: "Kiribati", coordinates: [-173.0236, 1.3297] },
  { name: "Liechtenstein", coordinates: [9.5554, 47.1419] },
  { name: "Maldives", coordinates: [73.2207, 3.2028] },
  { name: "Malta", coordinates: [14.3754, 35.8997] },
  { name: "Marshall Islands", coordinates: [171.1845, 7.1315] },
  { name: "Micronesia", coordinates: [151.9167, 7.4247] },
  { name: "Monaco", coordinates: [7.4246, 43.7384] },
  { name: "Nauru", coordinates: [166.9315, -0.5228] },
  { name: "Saint Kitts and Nevis", coordinates: [-62.783, 17.358] },
  { name: "Saint Lucia", coordinates: [-60.9789, 13.9094] },
  { name: "Saint Vincent and the Grenadines", coordinates: [-61.2872, 12.9843] },
  { name: "Samoa", coordinates: [-172.1046, -13.759] },
  { name: "San Marino", coordinates: [12.4578, 43.9333] },
  { name: "São Tomé and Príncipe", coordinates: [6.6159, 0.1864] },
  { name: "Seychelles", coordinates: [55.4521, -4.6796] },
  { name: "Singapore", coordinates: [103.8198, 1.3521] },
  { name: "Solomon Islands", coordinates: [159.4682, -9.6457] },
  { name: "Timor-Leste", coordinates: [125.7275, -8.8742] },
  { name: "Tonga", coordinates: [-175.2027, -21.179] },
  { name: "Tuvalu", coordinates: [179.194, -7.1095] },
  { name: "Vatican City", coordinates: [12.4534, 41.9029] },
  { name: "South Sudan", coordinates: [31.5, 7.5] },
  { name: "Western Sahara", coordinates: [-13.5, 24.5] },
  { name: "Somaliland", coordinates: [45.0, 9.8] },
];

// Fallback markers for countries that may be missing or unclickable
[
  { name: "South Sudan", coordinates: [31.5, 7.5] },
  { name: "Western Sahara", coordinates: [-13.0, 24.0] },
  { name: "Somaliland", coordinates: [45.0, 10.5] },
  { name: "Ivory Coast (Côte d’Ivoire)", coordinates: [-5.5, 7.5] },
].forEach((m) => {
  if (!extraMarkers.some((e) => e.name === m.name)) {
    extraMarkers.push(m);
  }
});

const Map = ({ onCountrySelect, countryStatuses = {} }) => {
  const [geographies, setGeographies] = useState([]);
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1.8 });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: "", status: "" });

  useEffect(() => {
    fetch(topoUrl)
      .then((res) => res.json())
      .then((topology) => {
        const geoFeatures = feature(topology, topology.objects.countries).features;
        const names = geoFeatures.map((f) => f.properties.name || f.properties.NAME);
        console.log("Names from TopoJSON:", names);  // 👈 this will now log properly
        setGeographies(geoFeatures);
      })
      .catch((err) => console.error("Error loading TopoJSON:", err));
  }, []);

  const handleMoveEnd = (pos) => setPosition(pos);

  const handleWheel = (e) => {
    e.preventDefault();
    setPosition((prev) => ({
      ...prev,
      zoom: Math.max(1, Math.min(prev.zoom * (e.deltaY < 0 ? 1.02 : 0.98), 8)),
    }));
  };

  const handleCountryClick = (name) => {
    const officialName = normalize(name);
onCountrySelect(officialName);
    const current = countryStatuses[name] || "none";
    const next = current === "none" ? "wishlist" : current === "wishlist" ? "visited" : "none";

    setTooltip({
      visible: true,
      x: window.innerWidth / 2,
      y: window.innerHeight - 100,
      name,
      status: next,
    });

    setTimeout(() => setTooltip({ visible: false }), 2000);
  };

  return (
    <div style={{ width: "100%", aspectRatio: "2 / 1" }} onWheel={handleWheel}>
      <ComposableMap style={{ width: "100%", height: "auto" }}>
        <ZoomableGroup center={position.coordinates} zoom={position.zoom} onMoveEnd={handleMoveEnd}>
          <Geographies geography={{ type: "FeatureCollection", features: geographies }}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const rawName = geo.properties.name || geo.properties.NAME;
                const name = normalize(rawName);
                const isCountry = allowedCountries.has(name);
                const status = countryStatuses[name] || "none";

                let fill = "#f0f4ff";
                if (status === "wishlist") fill = "#a5d8ff";
                if (status === "visited") fill = "#ffc9de";

                return (
                  <Geography
                    key={geo.rsmKey || name}
                    geography={geo}
                    onClick={() => isCountry && handleCountryClick(name)}
                    onMouseEnter={(e) => {
                      const { clientX, clientY } = e;
                      setTooltip({ visible: true, x: clientX, y: clientY, name, status });
                    }}
                    onMouseLeave={() => setTooltip({ visible: false })}
                    style={{
                      default: {
                        fill,
                        stroke: "#ccc",
                        strokeWidth: 0.3,
                        cursor: isCountry ? "pointer" : "default",
                        outline: "none",
                      },
                      hover: {
                        fill: isCountry ? "#c5e4ff" : fill,
                        cursor: isCountry ? "pointer" : "default",
                        outline: "none",
                      },
                      pressed: {
                        fill: isCountry ? "#fab8d9" : fill,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {extraMarkers.map(({ name, coordinates }) => {
            const status = countryStatuses[name] || "none";
            let fill = "#f0f4ff";
            if (status === "wishlist") fill = "#a5d8ff";
            if (status === "visited") fill = "#ffc9de";

            return (
              <Marker key={name} coordinates={coordinates}>
                <circle
                  r={2}
                  fill={fill}
                  stroke="#ccc"
                  strokeWidth={0.3}
                  onClick={() => handleCountryClick(name)}
                  onMouseEnter={(e) => {
                    const { clientX, clientY } = e;
                    setTooltip({ visible: true, x: clientX, y: clientY, name, status });
                  }}
                  onMouseLeave={() => setTooltip({ visible: false })}
                  style={{ cursor: "pointer" }}
                />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {tooltip.visible && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y,
            left: tooltip.x,
            transform: "translate(-50%, -50%)",
            background: "#1e293b",
            color: "#f1f5f9",
            padding: "8px 14px",
            borderRadius: "10px",
            fontSize: "15px",
            pointerEvents: "none",
            zIndex: 1000,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          <strong>{tooltip.name}</strong>
          <br />
          Now: {tooltip.status === "none" ? "Not selected" : tooltip.status}
        </div>
      )}
    </div>
  );
};

export default Map;