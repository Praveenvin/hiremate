"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResumeUploadPage() {
  const router = useRouter();
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /** ------------------------------
   * Handle File Selection
   * ------------------------------ */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // Reset previous errors
    setError("");

    // Validate file size (< 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF and DOCX files are allowed");
      return;
    }

    setFile(selectedFile);
  };

  /** ------------------------------
   * Handle File Upload
   * ------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();
      console.log("Upload response:\n", responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);

        alert(
          `Upload successful!\n\nExtracted Data:\n${JSON.stringify(
            data.extractedData,
            null,
            2
          )}`
        );

        router.push("/dashboard");
      } else {
        try {
          const errJSON = JSON.parse(responseText);
          setError(errJSON.error || "Upload failed");
        } catch {
          setError("Upload failed – invalid server response");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Upload Your Resume</h1>

        <p className="mb-4 text-gray-600">
          Upload your resume (PDF or DOCX, max 5MB) to get started with personalized interviews.
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Resume File</label>

            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className={`w-full rounded bg-blue-600 text-white py-2 transition ${
              loading || !file ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {loading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>
      </div>
    </main>
  );
}
