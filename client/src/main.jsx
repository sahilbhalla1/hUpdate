import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "sonner";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import Fallback from "./components/Fallback.jsx";
const errorHandler = (error, errorInfo) => {
  console.log("logging", error, errorInfo);
};
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={Fallback} onError={errorHandler}>
      <Router basename="/htm">
        <Toaster richColors position="top-right" />
        <App />
      </Router>
    </ErrorBoundary>
  </StrictMode>,
);
