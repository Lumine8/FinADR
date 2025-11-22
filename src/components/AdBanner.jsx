import { useEffect } from "react";

export default function AdBanner() {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return (
        <ins className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-8577803779611074"
            data-ad-slot="YOUR_AD_SLOT_HERE"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
    );
}
