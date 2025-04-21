"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";
import Map from "./Map";
import useCountryNames from "../hooks/useCountryNames";
import countryList from "../data/countryList"; // ⬅ new import

const extraCountryNames = [/*...your extra country list*/];

export default function TravelApp() {
    const [user] = useAuthState(auth);
    const [countryStatuses, setCountryStatuses] = useState({});
    const hasLoadedFromFirestore = useRef(false);
    const listRef = useRef(null);
    const countries = countryList;

    const scrollToList = () => {
        if (listRef.current) {
            listRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        const resetAndFetch = async () => {
            setCountryStatuses({});
            hasLoadedFromFirestore.current = false;

            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCountryStatuses(docSnap.data().countryStatuses || {});
                }
                hasLoadedFromFirestore.current = true;
            }
        };
        resetAndFetch();
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
            const next = current === "none" ? "wishlist" : current === "wishlist" ? "visited" : "none";
            return { ...prev, [country]: next };
        });
    };

    const wishlist = Object.entries(countryStatuses).filter(([, status]) => status === "wishlist");
    const visited = Object.entries(countryStatuses).filter(([, status]) => status === "visited");
    const [searchTerm, setSearchTerm] = useState("");

    const buttonStyle = {
        padding: "6px 12px",
        backgroundColor: "#334155",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    };

    const avatarStyle = {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        objectFit: "cover"
    };

    const totalMarked = wishlist.length + visited.length;
    const totalCountries = countries.length;
    const progressPercent = Math.round((totalMarked / totalCountries) * 100);

    return (
        <div style={{ padding: "16px", color: "#fff", maxWidth: "100%", boxSizing: "border-box", margin: "0 auto" }}>
            <style>{`
    @media (min-width: 768px) {
      .desktop-header-right {
        display: flex !important;
        flex-direction: row;
        align-items: center;
        gap: 10px;
      }
      .mobile-header {
        display: none !important;
      }
    }

    @media (max-width: 767px) {
      .desktop-header-right {
        display: none !important;
      }
      .mobile-header {
        display: flex !important;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 12px;
      }
    }
  `}</style>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
                <h1 style={{ fontFamily: 'Lobster, cursive', fontSize: '2rem', margin: 0 }}>
                🌍 JourneyMap</h1>

                {user ? (
                    <div className="desktop-header-right" style={{ display: "none" }}>
                        <button onClick={scrollToList} style={buttonStyle}>↓ List View</button>
                        <img src={user.photoURL} alt={user.displayName} style={avatarStyle} />
                        <span>{user.displayName}</span>
                        <button onClick={() => signOut(auth)} style={buttonStyle}>Sign out</button>
                    </div>
                ) : (
                    <button onClick={() => signInWithPopup(auth, googleProvider)} style={buttonStyle}>Sign in with Google</button>
                )}
            </div>

            {/* Mobile-only header (List button + user info) */}
            {user && (
                <div className="mobile-header" style={{ display: "none" }}>
                    <button onClick={scrollToList} style={buttonStyle}>↓ List View</button>
                    <img src={user.photoURL} alt={user.displayName} style={avatarStyle} />
                    <span>{user.displayName}</span>
                    <button onClick={() => signOut(auth)} style={buttonStyle}>Sign out</button>
                </div>
            )}

            {/* Stats */}
            {user && (
                <div
                    style={{
                        margin: "20px auto",
                        padding: "10px 20px",
                        maxWidth: 400,
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        fontSize: "16px",
                        backdropFilter: "blur(4px)",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "10px",
                            alignItems: "center",
                        }}
                    >
                        <span>✅ Visited: {visited.length}</span>
                        <span>✈️ Wishlist: {wishlist.length}</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginTop: "10px" }}>
                        <div style={{
                            height: "10px",
                            width: "100%",
                            backgroundColor: "#334155",
                            borderRadius: "5px",
                            overflow: "hidden"
                        }}>
                            <div style={{
                                height: "100%",
                                width: `${progressPercent}%`,
                                backgroundColor: "#10b981",
                                transition: "width 0.4s ease"
                            }} />
                        </div>
                        <div style={{ textAlign: "center", fontSize: "14px", marginTop: "6px" }}>
                            {progressPercent}% complete
                        </div>
                    </div>
                </div>
            )}

            {/* Map */}
            <div style={{ marginBottom: "24px" }}>
                <Map
                    onCountrySelect={handleToggleCountry}
                    countryStatuses={countryStatuses}
                />
            </div>

            {/* Country List */}

            <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "8px 12px",
                    marginBottom: "16px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                    boxSizing: "border-box"
                }}
            />

            <h2 ref={listRef} style={{ marginTop: "30px" }}>All Countries</h2>
            <ul style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "8px 16px",
                listStyle: "none",
                paddingLeft: 0,
                marginTop: "20px"
            }}>
                {countries
                    .filter((country) =>
                        country.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((country) => {

                        const status = countryStatuses[country] || "none";
                        let color = "#94a3b8";
                        if (status === "wishlist") color = "#a5d8ff";
                        if (status === "visited") color = "#ffc9de";
                        const emoji = status === "wishlist" ? "✈️" : status === "visited" ? "✅" : "";

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
                                    transition: "color 0.3s ease"
                                }}
                                title="Click to toggle status"
                            >
                                {emoji} {country}
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
}
