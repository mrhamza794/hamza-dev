import { sendJson } from "@/lib/pagesApi";

export function isDbConnectionError(error) {
  if (!error) return false;
  const code = error.code;
  const name = error.name;
  return (
    name === "MongoServerSelectionError" ||
    name === "MongooseServerSelectionError" ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    error.syscall === "querySrv"
  );
}

export function handleApiError(res, error, label = "API") {
  console.error(`${label} error:`, error);
  if (isDbConnectionError(error)) {
    return sendJson(res, 503, {
      success: false,
      error:
        "Database is unavailable. Check MONGO_URI in .env, your internet connection, and MongoDB Atlas IP access.",
    });
  }
  return sendJson(res, 500, { success: false, error: "Internal server error" });
}
