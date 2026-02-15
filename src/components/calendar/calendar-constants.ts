export const HOUR_HEIGHT = 60; // pixels per hour
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60; // 1px per minute
export const DAY_START_HOUR = 6; // 6 AM
export const DAY_END_HOUR = 22; // 10 PM
export const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;
export const GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;
export const SNAP_MINUTES = 15;

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTop(minutes: number): number {
  return (minutes - DAY_START_HOUR * 60) * MINUTE_HEIGHT;
}

export function minutesToHeight(minutes: number): number {
  return minutes * MINUTE_HEIGHT;
}

export function positionToMinutes(yOffset: number): number {
  const raw = (yOffset / MINUTE_HEIGHT) + DAY_START_HOUR * 60;
  return Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/** Local-timezone date string (YYYY-MM-DD) — avoids UTC date drift from toISOString(). */
export function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatTimeDisplay(time: string): string {
  const mins = timeToMinutes(time);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}
