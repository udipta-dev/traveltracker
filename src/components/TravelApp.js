"use client";
import React, { useState } from "react";
import styles from "../pages/Home.module.css";

const dummyCountries = ["France", "Japan", "Brazil", "Canada"];

export default function TravelApp() {
  const [countryStatuses, setCountryStatuses] = useState({});

  const handleToggleCountry = (country) => {
    setCountryStatuses((prev) => {
      const current = prev[country] || "none";
      const next =
        current === "none"
          ? "wishlist"
          : current === "wishlist"
          ? "visited"
          : "none";
      return { ...prev, [country]: next };
    });
  };

  const wishlist = Object.entries(countryStatuses)
    .filter(([_, status]) => status === "wishlist")
    .map(([name]) => name);

  const visited = Object.entries(countryStatuses)
    .filter(([_, status]) => status === "visited")
    .map(([name]) => name);

  return (
    <div className={styles.innerContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Travel Tracker</h1>
      </div>

      <div className={styles.statsBar}>
        <span>✅ Visited: {visited.length}</span>
        <span>✈️ Wishlist: {wishlist.length}</span>
      </div>

      <div style={{ paddingTop: "20px" }}>
        <h2>Click to toggle:</h2>
        <ul>
          {dummyCountries.map((country) => {
            const status = countryStatuses[country] || "none";
            return (
              <li
                key={country}
                style={{ cursor: "pointer", color: status === "visited" ? "lightgreen" : status === "wishlist" ? "gold" : "#aaa" }}
                onClick={() => handleToggleCountry(country)}
              >
                {country} — {status}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
