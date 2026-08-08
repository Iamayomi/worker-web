"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#ffffff" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#111827",
            }}
          >
            Something went wrong
          </div>
          <p
            style={{
              marginTop: "12px",
              maxWidth: "420px",
              fontSize: "15px",
              lineHeight: "1.6",
              color: "#6b7280",
            }}
          >
            The application hit an unexpected error. Try reloading the page — if
            it keeps happening, please check back shortly.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "24px",
              padding: "10px 22px",
              background: "#111827",
              color: "#ffffff",
              borderRadius: "8px",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
