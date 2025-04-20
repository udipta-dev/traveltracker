"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";
import Map from "./Map";
import useCountryNames from "../hooks/useCountryNames";

const extraCountryNames = [
  "Andorra", "Antigua and Barbuda", "Bahrain", "Barbados", "Belau",
  "Brunei", "Comoros", "Dominica", "Kiribati", "Liechtenstein",
  "Maldives", "Marshall Islands", "Micronesia", "Monaco", "Nauru",
  "Oman", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "São Tomé and Príncipe", "Seychelles", "Singapore",
  "Solomon Islands", "Timor-Leste", "Tonga", "Tuvalu", "Vatican City",
];

export default function TravelApp() {
  const [user] = useAuthState(auth);
  const [countryStatuses, setCountryStatuses] = useState({});
  const hasLoadedFromFirestore = useRef(false);

  const countriesFromMap = useCountryNames();
  const countries = Array.from(new Set([...countriesFromMap, ...extraCountryNames])).sort();

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCountryStatuses(docSnap.data().countryStatuses || {});
        } else {
          setCountryStatuses({});
        }
        hasLoadedFromFirestore.current = true;
      };
      fetchData();
    } else {
      setCountryStatuses({});
      hasLoadedFromFirestore.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (user && hasLoadedFromFirestore.current) {
      const saveData = async () => {
        await setDoc(doc(db, "users", user.uid), { countryStatuses });
      };
      saveData();
    }
  }, [countryStatuses, user]);

  const handleToggleCountry = async (country) => {
    if (!user) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (err) {
        console.error("Login cancelled or failed", err);
        return;
      }
    }

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

  return (
    <div style={{ padding: "40px", color: "#fff", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>🌍 Travel Tracker</h1>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
            <img
              src={user.photoURL}
              alt={user.displayName}
              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
            />
            <span>{user.displayName}</span>
            <button
              onClick={() => signOut(auth)}
              style={{
                padding: "6px 12px",
                backgroundColor: "#334155",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signInWithPopup(auth, googleProvider)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#334155",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Sign in with Google
          </button>
        )}
      </div>

      {/* Stats */}
      {user && (
        <div
          style={{
            margin: "20px auto",
            padding: "10px 20px",
            maxWidth: 300,
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "16px",
            backdropFilter: "blur(4px)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          <span>✅ Visited: {visited.length}</span>
          <span style={{ marginLeft: "16px" }}>✈️ Wishlist: {wishlist.length}</span>
        </div>
      )}

      {/* Map */}
      <Map
        onCountrySelect={handleToggleCountry}
        countryStatuses={countryStatuses}
      />

      {/* Country List */}
      <>
        <h2 style={{ marginTop: "30px" }}>All Countries</h2>
        <ul style={{ columns: 3, listStyle: "none", paddingLeft: 0 }}>
          {countries.map((country) => {
            const status = countryStatuses[country] || "none";
            let color = "#94a3b8";
            if (status === "wishlist") color = "#a5d8ff";
            if (status === "visited") color = "#ffc9de";

            const emoji =
              status === "wishlist"
                ? "✈️"
                : status === "visited"
                ? "✅"
                : "";

            return (
              <li
                key={country}
                onClick={() => handleToggleCountry(country)}
                style={{
                  cursor: "pointer",
                  color,
                  padding: "4px 0",
                  userSelect: "none",
                  fontWeight: status !== "none" ? "bold" : "normal",
                  transition: "color 0.3s ease",
                }}
                title="Click to toggle status"
              >
                {emoji} {country}
              </li>
            );
          })}
        </ul>
      </>
    </div>
  );
}
