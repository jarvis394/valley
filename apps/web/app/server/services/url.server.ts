import { slugify } from 'transliteration'

export class UrlService {
  constructor() {}

  /** Generate random strings of length 5 */
  static generateRandomString() {
    return (Math.random() + 1).toString(36).substring(2, 7)
  }

  /**
   * Generate a URL path for a given project title
   * DOES NOT start with a forward slash (/)
   */
  static generateURL(title: string) {
    return (
      UrlService.generateRandomString() +
      '-' +
      slugify(title, {
        trim: true,
      })
    )
  }
}
