import z from 'zod'

export const INTERFACE_LANGUAGES = ['en', 'ru'] as const
export const InterfaceLanguagesSchema = z.enum(INTERFACE_LANGUAGES)
export type InterfaceLanguage = z.infer<typeof InterfaceLanguagesSchema>

export const INTERFACE_LANGUAGES_NAMES: Record<InterfaceLanguage, string> = {
  en: 'English',
  ru: 'Русский',
}
