"use client";

/**
 * Diagnostic Page
 * Ultra-simple page to test if ANYTHING renders
 */

export default function DiagnosticPage() {
  console.log("🔍 DIAGNOSTIC PAGE RENDERING");

  return (
    <>
      {/* Absolute simplest possible element */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "magenta",
          zIndex: 9999999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "48px",
          fontWeight: "bold",
          color: "white",
          textAlign: "center",
          padding: "20px",
        }}
      >
        DIAGNOSTIC PAGE
        <br />
        <span style={{ fontSize: "24px" }}>
          If you see this, React is rendering
        </span>
      </div>

      {/* Alternative test element */}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(45deg, red, blue, green, yellow)",
          fontSize: "72px",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          textShadow: "0 0 10px black",
        }}
      >
        🚨 TEST PAGE 🚨
      </div>
    </>
  );
}
