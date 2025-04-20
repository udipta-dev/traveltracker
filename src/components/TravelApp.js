"use client";
import React from "react";
import styles from "../pages/Home.module.css";

export default function TravelApp() {
  console.log("🧱 TravelApp: layout + styles loaded");

  return (
    <div className={styles.innerContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Travel Tracker</h1>
      </div>

      <div className={styles.statsBar}>
        <span>✅ Visited: 0</span>
        <span>✈️ Wishlist: 0</span>
      </div>
    </div>
  );
}
