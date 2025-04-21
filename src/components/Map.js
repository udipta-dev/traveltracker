import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const extraMarkers = [
  { name: "Andorra", coordinates: [1.5218, 42.5063] },
  { name: "Antigua and Barbuda", coordinates: [-61.8468, 17.1124] },
  { name: "Bahrain", coordinates: [50.5884, 26.0273] },
  { name: "Barbados", coordinates: [-59.5432, 13.1939] },
  { name: "Belau", coordinates: [134.5825, 7.4207] },
  { name: "Brunei", coordinates: [114.7277, 4.5353] },
  { name: "Comoros", coordinates: [43.8723, -11.6455] },
  { name: "Dominica", coordinates: [-61.3710, 15.4150] },
  { name: "Kiribati", coordinates: [-173.0236, 1.3297] },
  { name: "Liechtenstein", coordinates: [9.5554, 47.1419] },
  { name: "Maldives", coordinates: [73.2207, 3.2028] },
  { name: "Marshall Islands", coordinates: [171.1845, 7.1315] },
  { name: "Micronesia", coordinates: [151.9167, 7.4247] },
  { name: "Monaco", coordinates: [7.4246, 43.7384] },
  { name: "Nauru", coordinates: [166.9315, -0.5228] },
  { name: "Oman", coordinates: [55.9232, 21.5137] },
  { name: "Saint Kitts and Nevis", coordinates: [-62.782998, 17.357822] },
  { name: "Saint Lucia", coordinates: [-60.9789, 13.9094] },
  { name: "Saint Vincent and the Grenadines", coordinates: [-61.2872, 12.9843] },
  { name: "Samoa", coordinates: [-172.1046, -13.7590] },
  { name: "San Marino", coordinates: [12.4578, 43.9333] },
  { name: "São Tomé and Príncipe", coordinates: [6.6159, 0.1864] },
  { name: "Seychelles", coordinates: [55.4521, -4.6796] },
  { name: "Singapore", coordinates: [103.8198, 1.3521] },
  { name: "Solomon Islands", coordinates: [159.4682, -9.6457] },
  { name: "Timor-Leste", coordinates: [125.7275, -8.8742] },
  { name: "Tonga", coordinates: [-175.2027, -21.1790] },
  { name: "Tuvalu", coordinates: [179.194, -7.1095] },
  { name: "Vatican City", coordinates: [12.4534, 41.9029] },
];

const Map = ({ onCountrySelect, countryStatuses = {} }) => {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    name: "",
    status: "",
  });

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    if (event.deltaY < 0) {
      setPosition((prev) => ({
        ...prev,
        zoom: Math.min(prev.zoom * 1.02, 8),
      }));
    } else {
      setPosition((prev) => ({
        ...prev,
        zoom: Math.max(prev.zoom / 1.02, 1),
      }));
    }
  };

  const nextStatus = (current) => {
    if (current === "none") return "wishlist";
    if (current === "wishlist") return "visited";
    return "none";
  };

  const handleCountryClick = (name) => {
    onCountrySelect(name);
    const current = countryStatuses[name] || "none";
    const upcoming = nextStatus(current);

    // Show toast tooltip near bottom center on mobile
    setTooltip({
      visible: true,
      x: window.innerWidth / 2,
      y: window.innerHeight - 100,
      name,
      status: upcoming,
    });

    setTimeout(() => setTooltip({ visible: false }), 2000);
  };

  return (
    <div
  style={{
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    aspectRatio: "2 / 1", // keeps map proportional
    margin: "0 auto",
  }}
  onWheel={handleWheel}
>

<ComposableMap style={{ width: "100%", height: "auto" }}>
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name;
                const status = countryStatuses[name] || "none";
                let fill = "#f0f4ff";
                if (status === "wishlist") fill = "#a5d8ff";
                if (status === "visited") fill = "#ffc9de";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(name)}
                    onMouseEnter={(e) => {
                      const { clientX, clientY } = e;
                      setTooltip({
                        visible: true,
                        x: clientX,
                        y: clientY,
                        name,
                        status,
                      });
                    }}
                    onMouseLeave={() => setTooltip({ visible: false })}
                    style={{
                      default: {
                        fill,
                        outline: "none",
                        stroke: "#ccc",
                        strokeWidth: 0.3,
                      },
                      hover: {
                        fill: "#c5e4ff",
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#fab8d9",
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
                    setTooltip({
                      visible: true,
                      x: clientX,
                      y: clientY,
                      name,
                      status,
                    });
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
