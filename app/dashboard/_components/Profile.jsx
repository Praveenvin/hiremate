"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/simpleAuth";

const Profile = () => {
  const { user } = useUser();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  /** ============================
   * FETCH RESUME DATA
   * ============================ */
  useEffect(() => {
    if (user?.email) fetchResumeData();
  }, [user]);

  const fetchResumeData = async () => {
    try {
      const response = await fetch("/api/resume/get");

      if (response.ok) {
        const data = await response.json();
        console.log("Resume data received:", data);

        setResumeData(data);
      } else {
        console.log("Failed to fetch resume data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching resume data:", error);
    } finally {
      setLoading(false);
    }
  };

  /** ============================
   * LOADING PLACEHOLDER
   * ============================ */
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Profile</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  /** ============================
   * NO RESUME FOUND
   * ============================ */
  if (!resumeData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Profile</h3>

        <p className="text-gray-500 mb-4">
          No resume data found. Please upload your resume.
        </p>

        <a
          href="/resume-upload"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Upload Resume
        </a>
      </div>
    );
  }

  /** ============================
   * DATA CLEANING HELPERS
   * ============================ */
  const isValidText = (value, fallbackText) => {
    if (!value) return fallbackText;
    if (typeof value !== "string") return fallbackText;
    if (value.trim().length === 0) return fallbackText;

    // ignore placeholder extraction messages
    if (value.includes("extracted from resume")) return fallbackText;

    return value;
  };

  const validExperience = isValidText(
    resumeData?.experience,
    'No experience extracted. Ensure your resume has a clear "Experience" section.'
  );

  const validEducation = isValidText(
    resumeData?.education,
    'No education extracted. Ensure your resume has a clear "Education" section.'
  );

  const validProjects = isValidText(
    resumeData?.projects,
    'No projects extracted. Ensure your resume has a clear "Projects" section.'
  );

  const validSkills =
    resumeData?.skills &&
    Array.isArray(resumeData.skills) &&
    resumeData.skills.length > 0 &&
    !resumeData.skills.includes("Extracted from resume")
      ? resumeData.skills
      : [];

  /** ============================
   * FINAL RENDER
   * ============================ */
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Profile</h3>

        <a
          href="/resume-upload"
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Re-upload Resume
        </a>
      </div>

      {/* Data sections */}
      <div className="space-y-6">
        {/* Skills */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {validSkills.length > 0 ? (
              validSkills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 italic">
                No skills extracted. Ensure your resume has a proper "Skills"
                section.
              </p>
            )}
          </div>
        </div>

        {/* Experience */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Experience</h4>
          <p className="text-gray-600">{validExperience}</p>
        </div>

        {/* Education */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Education</h4>
          <p className="text-gray-600">{validEducation}</p>
        </div>

        {/* Projects */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Projects</h4>
          <p className="text-gray-600">{validProjects}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
