// components/CountryList.js
import React from "react";
import styles from "./CountryList.module.css";

export default function CountryList({ countries, countryStatuses, onToggleCountry }) {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>All Countries</h2>
      <ul className={styles.list}>
        {countries.map((country) => {
          const status = countryStatuses[country] || "none";
          return (
            <li
              key={country}
              onClick={() => onToggleCountry(country)}
              className={`${styles.countryItem} ${styles[status]}`}
              title="Click to toggle status (Wishlist → Visited → None)"
            >
              {country}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
