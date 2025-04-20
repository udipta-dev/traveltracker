import React from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase"; // adjust path if needed
import GoogleButton from 'react-google-button'; // npm install react-google-button
import { useAuthState } from "react-firebase-hooks/auth"; // npm install react-firebase-hooks

function LoginButton() {
  const [user, loading, error] = useAuthState(auth);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <div>Loading...</div>;
  if (user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img src={user.photoURL} alt={user.displayName} style={{ width: 32, borderRadius: "50%" }} />
        <span>{user.displayName}</span>
        <button onClick={handleLogout} style={{ marginLeft: 16 }}>Sign out</button>
      </div>
    );
  }

  return <GoogleButton onClick={handleLogin} />;
}

export default LoginButton;
