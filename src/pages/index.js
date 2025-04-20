import dynamic from "next/dynamic";
import styles from "./Home.module.css";

const TravelApp = dynamic(() => import("../components/TravelApp"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className={styles.pageWrapper}>
      <TravelApp />
    </div>
  );
}
