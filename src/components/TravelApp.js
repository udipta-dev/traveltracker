"use client";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function TravelApp() {
  console.log("🔍 TravelApp mounted");

  const [user] = useAuthState(auth);
  const [countryStatuses, setCountryStatuses] = useState({});
  console.log("👤 Auth state:", user);

  const dummyCountries = ["France", "Japan", "Brazil", "Canada"];

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
          <p>Welcome, {user.displayName}</p>
          <button onClick={() => signOut(auth)}>Sign out</button>
        </>
      )}
    </div>
  );
}
