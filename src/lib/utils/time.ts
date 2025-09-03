export const getCurrentDate = (): Date => {
  return new Date();
};

export const getCurrentYear = (): number => {
  return getCurrentDate().getFullYear();
};

/**
 * Formats a duration in seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted string in MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Formats a duration in seconds to a human-readable string
 * @param seconds - Duration in seconds
 * @returns Human-readable duration string (e.g., "2 minutes 30 seconds")
 */
export const formatDurationLong = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  }

  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(
      `${remainingSeconds} second${remainingSeconds !== 1 ? "s" : ""}`
    );
  }

  return parts.join(" ");
};

/**
 * Converts a time string (MM:SS) to seconds
 * @param timeStr - Time string in MM:SS format
 * @returns Duration in seconds
 */
export const timeStringToSeconds = (timeStr: string): number => {
  const [minutes, seconds] = timeStr.split(":").map(Number);
  return minutes * 60 + seconds;
};
