/**
 * Color maths for the token pipeline.
 *
 * Tones are CIELAB L* (0 = black, 100 = white), the same "tone" axis Material 3 uses:
 * a difference of ~50 tones between text and background lands near the WCAG 4.5:1 contrast ratio.
 * Hue and chroma are CIELCh(ab), D65.
 */

export type Hex = `#${string}`

export interface Lch {
  /** Lightness, 0–100 */
  l: number
  /** Chroma, 0–~130 */
  c: number
  /** Hue angle in degrees, 0–360 */
  h: number
}

const D65 = { x: 0.95047, y: 1, z: 1.08883 }
const EPSILON = 216 / 24389
const KAPPA = 24389 / 27

const toLinear = (channel: number): number =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4

const toGamma = (channel: number): number =>
  channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

export function hexToRgb(hex: Hex): [number, number, number] {
  const value = hex.slice(1)
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255) as [number, number, number]
}

export function rgbToHex(rgb: readonly [number, number, number]): Hex {
  const byte = (channel: number) => Math.round(clamp01(channel) * 255).toString(16).padStart(2, '0')
  return `#${rgb.map(byte).join('').toUpperCase()}` as Hex
}

function hexToLab(hex: Hex): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map(toLinear)
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / D65.x
  const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / D65.y
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / D65.z
  const f = (t: number) => (t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116)
  const [fx, fy, fz] = [f(x), f(y), f(z)]
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

function labToHex(l: number, a: number, b: number): Hex {
  const fy = (l + 16) / 116
  const fx = fy + a / 500
  const fz = fy - b / 200
  const inverse = (t: number) => (t ** 3 > EPSILON ? t ** 3 : (116 * t - 16) / KAPPA)
  const x = inverse(fx) * D65.x
  const y = inverse(fy) * D65.y
  const z = inverse(fz) * D65.z
  const r = 3.2406 * x - 1.5372 * y - 0.4986 * z
  const g = -0.9689 * x + 1.8758 * y + 0.0415 * z
  const bl = 0.0557 * x - 0.204 * y + 1.057 * z
  return rgbToHex([r, g, bl].map((channel) => toGamma(clamp01(channel))) as [number, number, number])
}

export function hexToLch(hex: Hex): Lch {
  const [l, a, b] = hexToLab(hex)
  return { l, c: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 }
}

export function lchToHex({ l, c, h }: Lch): Hex {
  const angle = (h * Math.PI) / 180
  return labToHex(l, c * Math.cos(angle), c * Math.sin(angle))
}

/** WCAG 2.x relative luminance */
export function luminance(hex: Hex): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** A translucent color (#RRGGBBAA) laid over an opaque one, as the screen shows it */
export function over(top: string, base: Hex): Hex {
  if (top.length === 7) return top as Hex
  const alpha = parseInt(top.slice(7, 9), 16) / 255
  const front = hexToRgb(top.slice(0, 7) as Hex)
  const back = hexToRgb(base)
  return rgbToHex(front.map((channel, index) => channel * alpha + back[index]! * (1 - alpha)) as [number, number, number])
}

/** WCAG 2.x contrast ratio between two opaque colors, 1–21 */
export function contrast(foreground: Hex, background: Hex): number {
  const [darker, lighter] = [luminance(foreground), luminance(background)].sort((a, b) => a - b)
  return (lighter + 0.05) / (darker + 0.05)
}

/** CIEDE2000 color difference. Below ~1 is invisible; below ~2 needs a side-by-side comparison to notice. */
export function deltaE(first: Hex, second: Hex): number {
  const [l1, a1, b1] = hexToLab(first)
  const [l2, a2, b2] = hexToLab(second)
  const rad = Math.PI / 180
  const meanC = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2
  const g = 0.5 * (1 - Math.sqrt(meanC ** 7 / (meanC ** 7 + 25 ** 7)))
  const [a1p, a2p] = [(1 + g) * a1, (1 + g) * a2]
  const [c1p, c2p] = [Math.hypot(a1p, b1), Math.hypot(a2p, b2)]
  const hue = (b: number, a: number) => ((Math.atan2(b, a) / rad) + 360) % 360
  const [h1p, h2p] = [hue(b1, a1p), hue(b2, a2p)]
  let dh = h2p - h1p
  if (c1p * c2p === 0) dh = 0
  else if (dh > 180) dh -= 360
  else if (dh < -180) dh += 360
  const dL = l2 - l1
  const dC = c2p - c1p
  const dH = 2 * Math.sqrt(c1p * c2p) * Math.sin((dh / 2) * rad)
  const meanL = (l1 + l2) / 2
  const meanCp = (c1p + c2p) / 2
  let meanH = Math.abs(h1p - h2p) <= 180 ? (h1p + h2p) / 2 : (h1p + h2p + 360) / 2
  if (c1p * c2p === 0) meanH = h1p + h2p
  const t = 1 - 0.17 * Math.cos((meanH - 30) * rad) + 0.24 * Math.cos(2 * meanH * rad)
    + 0.32 * Math.cos((3 * meanH + 6) * rad) - 0.2 * Math.cos((4 * meanH - 63) * rad)
  const dTheta = 30 * Math.exp(-(((meanH - 275) / 25) ** 2))
  const rc = 2 * Math.sqrt(meanCp ** 7 / (meanCp ** 7 + 25 ** 7))
  const sl = 1 + (0.015 * (meanL - 50) ** 2) / Math.sqrt(20 + (meanL - 50) ** 2)
  const sc = 1 + 0.045 * meanCp
  const sh = 1 + 0.015 * meanCp * t
  const rt = -Math.sin(2 * dTheta * rad) * rc
  return Math.sqrt((dL / sl) ** 2 + (dC / sc) ** 2 + (dH / sh) ** 2 + rt * (dC / sc) * (dH / sh))
}
