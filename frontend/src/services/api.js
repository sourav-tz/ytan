import axios from "axios";

const client = axios.create({
  baseURL: "/api/v1",
  timeout: 300_000,
});

export async function analyzeVideo(url) {
  const { data } = await client.post("/analyze", { url });
  return data;
}

export async function healthCheck() {
  try {
    await client.get("/health");
    return true;
  } catch {
    return false;
  }
}
