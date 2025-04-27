"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";
import Map from "./Map";
import useCountryNames from "../hooks/useCountryNames";
import countryList from "../data/countryList"; // ⬅ new import
import SharePanel from "./SharePanel";

console.log("TravelApp rendered");

const extraCountryNames = [/*...your extra country list*/];

export default function TravelApp() {
    const [user] = useAuthState(auth);
    const [countryStatuses, setCountryStatuses] = useState({});
    const hasLoadedFromFirestore = useRef(false);
    const listRef = useRef(null);
    const countries = countryList;

    const getAvatarUrl = (user) => {
        const defaultAvatar = "https://raw.githubusercontent.com/udipta-dev/geojson-host/refs/heads/main/traveler-default.png";
        return user?.photoURL || defaultAvatar;
    };

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
        const checkNickname = async () => {
            console.log(">>> checkNickname CALLED. user:", user); // 👈 ADD THIS LOG
    
            if (!user) {
                console.log(">>> No user, exiting checkNickname");
                return;
            }
    
            if (user?.email) {
                console.log(">>> Saving email to Firestore:", user.email, "uid:", user.uid); // 👈 ADD THIS LOG
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email
                }, { merge: true });
            } else {
                console.log(">>> NO user.email on user:", user); // 👈 ALREADY PRESENT, GOOD!
            }

            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
                const nicknameFromProfile = userSnap.data()?.profile?.nickname;

                if (nicknameFromProfile) {
                    const nicknameDocRef = doc(db, "nicknames", nicknameFromProfile);
                    const nicknameSnap = await getDoc(nicknameDocRef);

                    if (nicknameSnap.exists() && nicknameSnap.data()?.uid === user.uid) {
                        // ✅ Valid nickname already assigned to this user
                        setNickname(nicknameFromProfile);
                        return; // ✅ Exit early — don't show modal
                    }
                }
            }

            // ❌ Either no nickname or not owned by user
            setShowNicknameModal(true);
        };

        checkNickname();
    }, [user]);

    useEffect(() => {
        if (user && hasLoadedFromFirestore.current) {
            const saveData = async () => {
                await setDoc(doc(db, "users", user.uid), { countryStatuses }, { merge: true });
            };
            saveData();
        }
    }, [countryStatuses, user]);

    const [showIntro, setShowIntro] = useState(false);

    useEffect(() => {
        const seenIntro = localStorage.getItem("hasSeenIntro");
        if (!seenIntro) {
            setShowIntro(true);
        }
    }, []);

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

    const [nickname, setNickname] = useState("");
    const [showNicknameModal, setShowNicknameModal] = useState(false);
    const [isNicknameTaken, setIsNicknameTaken] = useState(false);

    const buttonStyle = {
        padding: "6px 12px",
        backgroundColor: "#334155",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    };

    const avatarStyle = {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid white"
    };

    const totalMarked = visited.length; // only count visited
    const totalCountries = countries.length;
    const progressPercent = Math.round((totalMarked / totalCountries) * 100);

    return (
        <>
            {showIntro && (
                <div
                    onClick={() => {
                        localStorage.setItem("hasSeenIntro", "true");
                        setShowIntro(false);
                    }}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.8)",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                        textAlign: "center",
                        padding: "20px",
                        boxSizing: "border-box",
                        cursor: "pointer",
                    }}
                >
                    <div style={{ maxWidth: "500px", fontSize: "18px", lineHeight: "1.6" }}>
                        <h2 style={{ marginBottom: "12px" }}>🌍 Welcome to JourneyMap!</h2>
                        <p>Track the countries you've visited or dream to visit.</p>
                        <p>Your progress stays saved — just click on any country to get started!</p>
                        <p style={{ marginTop: "24px", fontWeight: "bold" }}>Click anywhere to begin</p>
                    </div>
                </div>
            )}

            {showNicknameModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.8)",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                        textAlign: "center",
                        padding: "20px",
                        boxSizing: "border-box",
                    }}
                >
                    <div style={{ background: "#1e293b", padding: "24px", borderRadius: "12px", maxWidth: "400px", width: "100%" }}>
                        <h2 style={{ marginBottom: "16px" }}>Choose a nickname</h2>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => {
                                const val = e.target.value.toLowerCase();
                                if (/^[a-z0-9_]{0,10}$/.test(val)) {
                                    setNickname(val);
                                }
                            }}
                            placeholder="e.g. neo88"
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                marginBottom: "12px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                fontSize: "16px",
                            }}
                        />
                        <p style={{ fontSize: "13px", marginBottom: "10px", color: "#cbd5e1" }}>
                            Your nickname is <strong>permanent</strong> and cannot be changed.
                        </p>
                        {isNicknameTaken && (
                            <p style={{ color: "#f87171", marginBottom: "10px" }}>❌ That nickname is taken</p>
                        )}
                        <button
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#10b981",
                                border: "none",
                                borderRadius: "6px",
                                color: "#fff",
                                fontWeight: "bold",
                                cursor: "pointer",
                                width: "100%",
                            }}
                            onClick={async () => {
                                const nicknameRef = doc(db, "nicknames", nickname);
                                const existing = await getDoc(nicknameRef);

                                if (existing.exists()) {
                                    const owner = existing.data()?.uid;
                                    if (owner !== user.uid) {
                                        setIsNicknameTaken(true);
                                        return;
                                    }
                                }

                                // Save nickname once (permanent)
                                await setDoc(nicknameRef, { uid: user.uid });
                                await setDoc(doc(db, "users", user.uid), {
                                    profile: { nickname },
                                }, { merge: true });

                                setShowNicknameModal(false);
                            }}
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}

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

    .country-search-wrap {
  flex-direction: row !important;
  align-items: center !important;
  gap: 16px;
}

    .country-search-wrap input {
      margin-top: 0 !important;
      max-width: 300px !important;
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
                        🌍 JourneyMap
                    </h1>

                    {user ? (
                        <div className="desktop-header-right" style={{ display: "none" }}>
                            <button onClick={scrollToList} style={buttonStyle}>↓ List View</button>
                            <img src={getAvatarUrl(user)} alt="Avatar" style={avatarStyle} />
                            <span style={{ fontWeight: "bold" }}>@{nickname}</span>
                            <button onClick={() => signOut(auth)} style={buttonStyle}>Sign out</button>
                        </div>
                    ) : (
                        <button onClick={() => signInWithPopup(auth, googleProvider)} style={buttonStyle}>
                            Sign in with Google
                        </button>
                    )}
                </div>

                {/* Mobile-only header */}
                {user && (
                    <div className="mobile-header" style={{
                        display: "none",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        width: "100%", // so we can push "Sign out" to the right
                        marginTop: "12px",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <button onClick={scrollToList} style={buttonStyle}>↓ List View</button>
                            <img src={getAvatarUrl(user)} alt="Avatar" style={avatarStyle} />
                            <span style={{ fontWeight: "bold" }}>@{nickname}</span>
                        </div>
                        <button onClick={() => signOut(auth)} style={buttonStyle}>Sign out</button>
                    </div>
                )}

                {/* Stats */}
                {user && (
                    <div style={{
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
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "10px",
                            alignItems: "center",
                        }}>
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
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        alignItems: "flex-start",
                        marginTop: "30px",
                        width: "100%", // ✅ important for desktop spacing
                    }}
                    className="country-search-wrap"
                >
                    <h2
                        ref={listRef}
                        style={{
                            margin: 0,
                            flexShrink: 0,
                            fontSize: "20px",
                            fontWeight: "700",
                        }}
                    >
                        All Countries
                    </h2>
                    <input
                        type="text"
                        placeholder="Search countries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "16px",
                            boxSizing: "border-box",
                            flexGrow: 1,
                        }}
                    />
                </div>
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

                <hr style={{ marginTop: "40px", borderColor: "#334155" }} />

                <footer style={{
                    marginTop: "20px",
                    paddingBottom: "30px",
                    fontSize: "14px",
                    color: "#94a3b8",
                    textAlign: "center"
                }}>
                    <div style={{ marginBottom: "8px" }}>
                        <a
                            href="https://x.com/stokonomic"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginRight: "8px", color: "#94a3b8", textDecoration: "none" }}
                        >X</a>
                        |
                        <a
                            href="https://www.instagram.com/thelandloper_/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: "8px", color: "#94a3b8", textDecoration: "none" }}
                        >IG</a>
                    </div>
                    <div>
                        Made by <a href="https://udipta-basumatari.me/" target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", textDecoration: "underline" }}>Udipta Basumatari</a>
                    </div>
                </footer>

                <div
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        display: "flex",
                        gap: "10px",
                        zIndex: 1000,
                        alignItems: "center",
                    }}
                >
                    <SharePanel />
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        style={{
                            width: "36px",
                            height: "36px",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            color: "#fff",
                            borderRadius: "10px",
                            fontSize: "20px",
                            cursor: "pointer",
                            backdropFilter: "blur(4px)",
                        }}
                        title="Scroll to top"
                    >
                        ↑
                    </button>
                </div>
            </div>
        </>
    );
}