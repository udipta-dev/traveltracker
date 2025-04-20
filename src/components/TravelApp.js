"use client";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, googleProvider } from "../firebase";
import styles from "../pages/Home.module.css";

export default function TravelApp() {
  const [user] = useAuthState(auth);
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

  const wishlist = Object.entries(countryStatuses).filter(
    ([, status]) => status === "wishlist"
  );
  const visited = Object.entries(countryStatuses).filter(
    ([, status]) => status === "visited"
  );

  const dummyCountries = ["France", "Japan", "Brazil", "Canada"];

  return (
    <div className={styles.innerContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Travel Tracker</h1>
        {user ? (
          <div className={styles.userInfo}>
            <img
              src={user.photoURL}
              alt={user.displayName}
              className={styles.avatar}
            />
            <span>{user.displayName}</span>
            <button onClick={() => auth.signOut()}>Sign out</button>
          </div>
        ) : (
          <button onClick={() => auth.signInWithPopup(googleProvider)}>
            Sign in with Google
          </button>
        )}
      </div>

      <div className={styles.statsBar}>
        <span>✅ Visited: {visited.length}</span>
        <span>✈️ Wishlist: {wishlist.length}</span>
      </div>

      {user && (
        <>
          <h2>Click to toggle:</h2>
          <ul>
            {dummyCountries.map((country) => {
              const status = countryStatuses[country] || "none";
              return (
                <li
                  key={country}
                  onClick={() => handleToggleCountry(country)}
                  style={{
                    cursor: "pointer",
                    color:
                      status === "visited"
                        ? "lightgreen"
                        : status === "wishlist"
                        ? "gold"
                        : "#aaa",
                  }}
                >
                  {country} — {status}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
