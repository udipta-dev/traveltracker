// hooks/useCountryNames.js
import { useEffect, useState } from "react";
import { feature } from "topojson-client";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function useCountryNames() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then((data) => {
        // Convert TopoJSON to GeoJSON
        const geoFeatures = feature(data, data.objects.countries).features;
        // Extract unique country names and sort
        const countryNames = geoFeatures
          .map((f) => f.properties.name)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
        setCountries(countryNames);
      });
  }, []);

  return countries;
}
