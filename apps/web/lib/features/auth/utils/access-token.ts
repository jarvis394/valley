import { Tokens } from '@valley/shared'

const TOKENS_KEY = 'tokens'

function getAuthTokensFromLocalStorage(): Tokens | null {
  const tokens = localStorage.getItem(TOKENS_KEY) || ''

  try {
    return JSON.parse(tokens) as Tokens
  } catch (e) {
    console.warn('Cannot parse user tokens, got:', tokens)
    return null
  }
}

function setAuthTokensToLocalStorage(tokens: Tokens) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

function removeAuthTokensFromLocalStorage() {
  localStorage.removeItem(TOKENS_KEY)
}

function getAuthTokens() {
  return getAuthTokensFromLocalStorage()
}

export {
  getAuthTokensFromLocalStorage,
  setAuthTokensToLocalStorage,
  removeAuthTokensFromLocalStorage,
  getAuthTokens,
}
