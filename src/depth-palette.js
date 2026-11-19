// Port of the Android app's SensorVisualization.kt / DepthPalette.
// Input is millimetres; the 256-entry LUT uses a fixed 0–5000 mm range.
export const DEPTH_MAX_MM = 5000;
export const DEPTH_LUT = Array.from({ length: 256 }, (_, i) => {
  const hue = (i / 255) * 4;
  const section = Math.trunc(hue),
    f = hue - section;
  const rgb =
    section === 0
      ? [1, f, 0]
      : section === 1
        ? [1 - f, 1, 0]
        : section === 2
          ? [0, 1, f]
          : [0, 1 - Math.min(1, Math.max(0, hue - 3)), 1];
  return rgb.map((channel) => Math.trunc(channel * 255));
});
export function depthPalette(mm) {
  if (!Number.isFinite(mm) || mm <= 0) return [0, 0, 0];
  return DEPTH_LUT[
    Math.min(255, Math.max(0, Math.trunc((mm / DEPTH_MAX_MM) * 255)))
  ];
}
export const DEPTH_GRADIENT = `linear-gradient(90deg, ${[0, 64, 128, 192, 255].map((i) => `rgb(${DEPTH_LUT[i].join(",")}) ${(i / 255) * 100}%`).join(", ")})`;
