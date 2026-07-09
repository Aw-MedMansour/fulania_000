import * as React from "react";
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from "@react-email/components";

export interface BrandHeaderProps {
  siteName?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ siteName = "FulanIA" }) => (
  <Section style={headerSection}>
    <Text style={logoText}>{siteName}</Text>
    <Text style={tagline}>Pulaar · Fulfulde · Culture Peule</Text>
  </Section>
);

export const BrandFooter: React.FC = () => (
  <Section style={footerSection}>
    <Text style={footerText}>
      Aw Mohamedou Mansour · FulanIA
    </Text>
  </Section>
);

export const sharedStyles = {
  main: { backgroundColor: "#ffffff", fontFamily: '"Inter", system-ui, -apple-system, sans-serif' },
  container: { backgroundColor: "#ffffff", padding: "32px 24px", maxWidth: "520px" },
  headerSection: { backgroundColor: "#1a0f08", padding: "24px", borderRadius: "12px 12px 0 0", textAlign: "center" as const },
  logoText: { color: "#d4a44a", fontFamily: '"Fraunces", Georgia, serif', fontSize: "24px", fontWeight: "700", margin: "0 0 4px" },
  tagline: { color: "#f5ecd9", fontSize: "12px", margin: "0", letterSpacing: "0.08em" },
  contentSection: { backgroundColor: "#ffffff", padding: "28px 24px" },
  h1: { fontFamily: '"Fraunces", Georgia, serif', fontSize: "22px", fontWeight: "700", color: "#1a0f08", margin: "0 0 18px" },
  text: { fontSize: "15px", color: "#3d2a1a", lineHeight: "1.65", margin: "0 0 18px" },
  link: { color: "#c85a14", textDecoration: "underline" },
  button: {
    backgroundColor: "#c85a14",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    borderRadius: "8px",
    padding: "14px 24px",
    textDecoration: "none",
    display: "inline-block",
  },
  footerSection: { backgroundColor: "#f9f5ec", padding: "18px 24px", borderRadius: "0 0 12px 12px", textAlign: "center" as const },
  footerText: { fontSize: "12px", color: "#7a6a58", margin: "0" },
  codeStyle: {
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a0f08",
    letterSpacing: "0.1em",
    backgroundColor: "#f5ecd9",
    padding: "14px 18px",
    borderRadius: "8px",
    textAlign: "center" as const,
    margin: "0 0 20px",
  },
};

export { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text };
