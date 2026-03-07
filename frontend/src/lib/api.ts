const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function runInferenceAPI(params: {
  encryptedPrompt: string;
  model: string;
  walletAddress: string;
  encryptionKey: string;
}) {
  const res = await fetch(`${API_URL}/api/inference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getJobs(address: string) {
  const res = await fetch(`${API_URL}/api/jobs/${address}`);
  return res.json();
}

export async function getProof(jobId: string) {
  const res = await fetch(`${API_URL}/api/proofs/${jobId}`);
  return res.json();
}

export async function confirmProof(params: {
  jobId: string;
  inputHash: string;
  outputHash: string;
  onChainTxHash: string;
}) {
  const res = await fetch(`${API_URL}/api/proofs/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function getStats(address: string) {
  const res = await fetch(`${API_URL}/api/stats/${address}`);
  return res.json();
}
