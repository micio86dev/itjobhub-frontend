import { API_URL } from "../constants";
import { request } from "./api";
import type { CvRecord, ExtractedProfile } from "../contexts/auth";

// Upload goes directly to backend (not via proxy) because the proxy reads body
// as text which breaks multipart/form-data binary streams.
export const uploadCV = async (
  token: string,
  file: File,
  language: string,
): Promise<CvRecord> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);

  const res = await fetch(`${API_URL}/users/me/cvs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Upload failed");
  }
  return data.data as CvRecord;
};

export const listCVs = async (token: string): Promise<CvRecord[]> => {
  const res = await request(`${API_URL}/users/me/cvs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.message || "Failed to list CVs");
  return data.data as CvRecord[];
};

export const deleteCV = async (token: string, cvId: string): Promise<void> => {
  const res = await request(`${API_URL}/users/me/cvs/${cvId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.message || "Failed to delete CV");
};

export const parseCV = async (
  token: string,
  cvId: string,
): Promise<ExtractedProfile> => {
  const res = await request(`${API_URL}/users/me/cvs/${cvId}/parse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.message || "Failed to parse CV");
  return data.data as ExtractedProfile;
};
