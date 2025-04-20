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

    return (
        <div style={{ padding: "40px", textAlign: "center", color: "#fff" }}>
            <h1>🌍 Travel Tracker</h1>

            {!user ? (
                <>
                    <p>You're not signed in.</p>
                    <button onClick={() => signInWithPopup(auth, googleProvider)}>
                        Sign in with Google
                    </button>
                </>
            ) : (
                <>
                    <div style={{ marginBottom: "20px" }}>
                        <p>Welcome, {user.displayName}</p>
                        <button onClick={() => signOut(auth)}>Sign out</button>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <strong>✅ Visited:</strong> {visited.length} &nbsp;&nbsp;
                        <strong>✈️ Wishlist:</strong> {wishlist.length}
                    </div>

                    <Map
                        onCountrySelect={handleToggleCountry}
                        countryStatuses={countryStatuses}
                    />

<h2 style={{ marginTop: "30px" }}>All Countries</h2>
<ul style={{ columns: 3, listStyle: "none", paddingLeft: 0 }}>
  {countries.map((country) => {
    const status = countryStatuses[country] || "none";
    let color = "#94a3b8"; // soft slate for "none"
    if (status === "wishlist") color = "#a5d8ff"; // pastel blue
    if (status === "visited") color = "#ffc9de"; // pastel pink

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
            )}
        </div>
    );
}
