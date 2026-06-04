import { useState } from "react";
import { analyzeVideo } from "../services/api";

export function useAnalysis() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async (url) => {
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      const data = await analyzeVideo(url);
      setResult(data);
      setStatus("success");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ?? "Analysis failed. Please try again.";
      setError(msg);
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
  };

  return { status, result, error, analyze, reset };
}
