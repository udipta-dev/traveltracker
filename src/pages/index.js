import dynamic from "next/dynamic";
import styles from "./Home.module.css";
import countryList from "../data/countryList";

const TravelApp = dynamic(() => import("../components/TravelApp"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className={styles.pageWrapper}>
      <TravelApp countries={countryList} />
    </div>
  );
}
