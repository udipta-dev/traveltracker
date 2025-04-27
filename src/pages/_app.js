import "@/styles/globals.css";
import Script from "next/script";
import Head from "next/head"; // <--- Add this import

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>JourneyMap</title>
        <meta name="description" content="Track your travels, see your map, and share your journey." />
        {/* Open Graph */}
        <meta property="og:title" content="JourneyMap" />
        <meta property="og:description" content="Track your travels, see your map, and share your journey." />
        <meta property="og:image" content="https://raw.githubusercontent.com/udipta-dev/geojson-host/refs/heads/main/JourneyMap%20Card.png" />
        <meta property="og:url" content="https://journeymap.me" />
        <meta property="og:type" content="website" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="JourneyMap" />
        <meta name="twitter:description" content="Track your travels, see your map, and share your journey." />
        <meta name="twitter:image" content="https://raw.githubusercontent.com/udipta-dev/geojson-host/refs/heads/main/JourneyMap%20Card.png" />
        <link rel="icon" type="image/png" href="https://raw.githubusercontent.com/udipta-dev/geojson-host/refs/heads/main/JourneyMap%20Favicon%20(1).png" />
      </Head>
      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-L0TPMB7QHJ"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L0TPMB7QHJ', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Component {...pageProps} />
    </>
  );
}