export type ProfileAppearance = {
  colors?: {
    primary?: string
    background?: string
    text?: string
  }
  font?: string
  layout?: "list" | "grid" | "carousel"
  darkMode?: boolean
}

export type SectionConditions = {
  time?: {
    start?: string // HH:mm
    end?: string // HH:mm
    timezone?: string
  }
  country?: string[] // ISO codes
  language?: string[] // "fr", "en"...
  device?: ("mobile" | "tablet" | "desktop")[]
}

export type PixelConfig = {
  facebook?: string
  google?: string
  tiktok?: string
}
