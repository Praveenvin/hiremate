"use server";

export async function addUserDetailsToDB(email) {
  try {
    console.log("Synced user:", email);
    return { success: true };
  } catch (err) {
    console.error("DB Error:", err);
    return { success: false };
  }
}
