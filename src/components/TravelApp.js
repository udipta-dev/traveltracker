"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";

export default function TravelApp() {
  const [user] = useAuthState(auth);
  const [countryStatuses, setCountryStatuses] = useState({});
  const dummyCountries = ["France", "Japan", "Brazil", "Canada"];
  const hasLoadedFromFirestore = useRef(false);

  // Load saved country statuses from Firestore
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

  // Save to Firestore on state change (skip first load)
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

          <h2>Click to toggle:</h2>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {dummyCountries.map((country) => {
              const status = countryStatuses[country] || "none";
              return (
                <li
                  key={country}
                  onClick={() => handleToggleCountry(country)}
                  style={{
                    cursor: "pointer",
                    padding: "4px 0",
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
