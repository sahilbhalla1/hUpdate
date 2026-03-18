const Fallback = ({ error }) => {
  return (
    <div
      style={{
        marginTop: "8%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "#333",
        fontFamily: "Arial, sans-serif",
        padding: "0 20px",
      }}
    >
      <svg
        width="90"
        height="90"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#E76448"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginBottom: "20px" }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>

      <h3 style={{ color: "#2e5faa", marginBottom: "10px" }}>Oops! Something went wrong.</h3>
      <p style={{ fontSize: ".9rem", textAlign: "center", maxWidth: "480px" }}>
        Please hard refresh the page or try again later. If the problem persists, share the error below with your administrator.
      </p>

      {error && (
        <div
          style={{
            marginTop: "20px",
            background: "#f9eaea",
            color: "#E76448",
            padding: "10px 15px",
            border: "1px solid #e0b4b4",
            borderRadius: "6px",
            maxWidth: "90%",
            wordBreak: "break-word",
            fontSize: "0.9rem",
          }}
        >
          <strong>Error:</strong> {error.message || String(error)}
        </div>
      )}
    </div>
  );
};

export default Fallback;
