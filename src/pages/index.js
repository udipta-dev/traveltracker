import React, { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import Map from "../components/Map";
import LoginButton from "../components/LoginButton";
import styles from "./Home.module.css";
import CountryList from "../components/CountryList";
import useCountryNames from "../hooks/useCountryNames";

const extraCountryNames = [ /* ... your list ... */];

export default function Home() {
  const [countryStatuses, setCountryStatuses] = useState({});
  const countriesFromMap = useCountryNames();
  const countries = Array.from(new Set([...countriesFromMap, ...extraCountryNames])).sort();
  const [user, loading, error] = useAuthState(auth);

  const hasLoadedFromFirestore = useRef(false);

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

  const handleCountrySelect = (countryName) => {
    setCountryStatuses((prev) => {
      const current = prev[countryName] || "none";
      const next =
        current === "none"
          ? "wishlist"
          : current === "wishlist"
          ? "visited"
          : "none";
      return { ...prev, [countryName]: next };
    });
  };

  const wishlist = Object.entries(countryStatuses)
    .filter(([_, status]) => status === "wishlist")
    .map(([name]) => name);

  const visited = Object.entries(countryStatuses)
    .filter(([_, status]) => status === "visited")
    .map(([name]) => name);

  return (
    <div className={styles.pageWrapper}>
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
            <LoginButton />
          )}
        </div>

        <div className={styles.statsBar}>
          <span>✅ Visited: {visited.length}</span>
          <span>✈️ Wishlist: {wishlist.length}</span>
        </div>

        <Map
          onCountrySelect={handleCountrySelect}
          countryStatuses={countryStatuses}
        />
        <CountryList
          countries={countries}
          countryStatuses={countryStatuses}
          onToggleCountry={handleCountrySelect}
        />

        <h2>Wishlist:</h2>
        <ul>
          {wishlist.length === 0 ? (
            <li>No countries in wishlist.</li>
          ) : (
            wishlist.map((country) => <li key={country}>{country}</li>)
          )}
        </ul>

        <h2>Visited:</h2>
        <ul>
          {visited.length === 0 ? (
            <li>No countries visited yet.</li>
          ) : (
            visited.map((country) => <li key={country}>{country}</li>)
          )}
        </ul>
      </div>
    </div>
  );
}
