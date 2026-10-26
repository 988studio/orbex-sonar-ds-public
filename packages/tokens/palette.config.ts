/**
 * The palette, described rather than listed.
 *
 * Brand and status colors are anchors: exact values chosen by design.
 * Extra tones of an anchor's hue are derived when a role needs them (for example, text that must reach 4.5:1).
 * Neutrals are not picked one by one: they are the brand green at very low chroma, generated from one formula.
 *
 * Every tone is named by its CIELAB lightness L* (0 black … 100 white).
 */
import type { Hex } from './lib/color.ts'

export interface NeutralFamily {
  description: string
  /** Chroma at a given tone, before the family adjustment */
  chromaScale: number
  chromaOffset: number
  tones: number[]
}

/** Hue drifts from 144° in the darks to 135° in the lights, as the original hand-picked neutrals did. */
export const neutralHue = (tone: number): number => 144 - 0.09 * tone

/** Chroma peaks in the mid tones and eases off towards black and white, where tint reads as dirt. */
export const neutralChroma = (tone: number): number => 8.2 - 0.00125 * (tone - 55) ** 2

export const neutrals: Record<string, NeutralFamily> = {
  neutral: {
    description: 'Brand-tinted neutral. Text, lines and most surfaces.',
    chromaScale: 1,
    chromaOffset: 0,
    tones: [5, 6, 10, 12, 14, 16, 18, 21, 22, 24, 27, 28, 31, 33, 34, 43, 46, 47, 48, 57, 59, 60, 65, 67, 72, 74, 76, 78, 80, 84, 85, 88, 90, 91, 92, 93, 95, 96],
  },
  'neutral-tinted': {
    description: 'A greener neutral for map land use, chart remainders and hover fills on dark surfaces.',
    chromaScale: 1,
    chromaOffset: 2.4,
    tones: [19, 23, 27, 36, 41],
  },
  'neutral-subdued': {
    description: 'A quieter neutral for the dark canvas, the inverse surface and the search field.',
    chromaScale: 0.5,
    chromaOffset: 0,
    tones: [2, 20, 96],
  },
}

/** Achromatic grays: the light page, sidebar and card surfaces. */
export const grays = { description: 'Achromatic grays for light surfaces.', tones: [91, 94, 96, 97, 99] }

export interface HueFamily {
  description: string
  /** Exact brand or status colors, keyed by tone. */
  anchors: Record<number, Hex>
  /** Tones derived from the hue and chroma of `from`. `chroma` lowers the chroma where the lighter tone would leave sRGB. */
  derived?: Record<number, { from: number; reason: string; chroma?: number }>
}

export const hues: Record<string, HueFamily> = {
  green: {
    description: 'Brand accent. Green 50 was darkened by half a tone from #1E8A3A (0.8 ΔE, invisible) so white text on it reaches 4.5:1.',
    anchors: {
      11: '#0F2112', 20: '#00390F', 29: '#2F4B31', 37: '#33603B', 40: '#1E6B30', 50: '#1A8838',
      67: '#76B27C', 81: '#97D99C', 89: '#CFE6CF', 90: '#D0E8CE', 91: '#CDEFD0',
    },
    derived: { 46: { from: 50, reason: 'Accent text: 4.5:1 on light surfaces.' } },
  },
  red: {
    description: 'Danger: delays, overdue items, destructive actions.',
    anchors: { 50: '#DD3535', 56: '#F04B4B' },
    derived: {
      46: { from: 50, reason: 'Danger text: 4.5:1 on light surfaces.' },
      64: { from: 56, chroma: 60, reason: 'Danger text: 4.5:1 on dark surfaces, selected rows included.' },
    },
  },
  orange: {
    description: 'Warning: pending and on-hold states.',
    anchors: { 66: '#DD8E35', 73: '#F2A23F', 77: '#FFAC32', 78: '#FFB040' },
    derived: { 46: { from: 66, reason: 'Warning text: 4.5:1 on light surfaces.' } },
  },
  'neutral-dark': {
    description: 'The exact neutrals of the product’s dark theme, where the formula lands one RGB step away: surfaces, lines and the text levels it names, and the search results’ head and highlighted row (1.1).',
    anchors: {
      2: '#050705', 6: '#0F150F', 12: '#1B221B', 14: '#1F251F', 15: '#212921', 16: '#222B22', 17: '#252C25', 21: '#2C342B', 22: '#2E362E', 23: '#2E392E',
      27: '#3A433A', 48: '#6C766A', 59: '#889285', 67: '#9CA699', 80: '#C0C8BC', 88: '#D5DFD2', 90: '#DCE5D9',
    },
  },
  'neutral-light': {
    description: 'The exact text levels of the product’s light theme, the ink of its scrim, and the search results’ head and highlighted row (1.1).',
    anchors: { 7: '#141618', 28: '#3D453B', 30: '#424A40', 76: '#B4BEB1', 91: '#E0E9DD', 96: '#F1F4F0' },
  },
  blue: {
    description: 'Water on the route map.',
    anchors: { 36: '#2E5B70', 89: '#D1E2E8' },
  },
}
