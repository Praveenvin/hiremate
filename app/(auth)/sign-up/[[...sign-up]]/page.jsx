"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/sign-in");
      } else {
        setError(data.error || "Sign-up failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Sign up</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSignUp}>
          {/* First Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              required
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/sign-in" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
