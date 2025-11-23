import { useEffect } from "react";

export default function AdBanner() {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
            console.error("AdSense error:", error);
        }
    }, []);

    return (
        <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-8577803779611074"
            data-ad-slot="8041673942"
            data-ad-format="auto"
            data-full-width-responsive="true"
        ></ins>
    );
}
