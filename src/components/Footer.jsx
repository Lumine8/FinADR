import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.links}>
                <a href="/privacy-policy.html" style={styles.link}>Privacy Policy</a>
                <a href="/terms.html" style={styles.link}>Terms</a>
                <a href="/cookies.html" style={styles.link}>Cookies</a>
                <a href="/about.html" style={styles.link}>About</a>
                <a href="mailto:atlas.adr11@gmail.com" style={styles.link}>Contact</a>
            </div>
            <div style={styles.copy}>
                © {new Date().getFullYear()} FinADR. All rights reserved.
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        textAlign: "center",
        padding: "20px 0",
        marginTop: "40px",
        color: "#aaa",
        fontSize: "14px",
    },
    links: {
        display: "flex",
        gap: "15px",
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: "10px",
    },
    link: {
        color: "#aaa",
        textDecoration: "none",
    },
    copy: {
        marginTop: "5px",
    },
};

export default Footer;
