export {
  loadEnvFiles,
  readAuthEnv,
  readEnv,
  SIGNUP_MODES,
  type AuthEnv,
  type BackendEnv,
  type SignupMode,
} from './env'

export { contentTypeFor, StorageError, writeBodyToFile, type Storage } from '@valley/storage'

export { getAuth, getDb, getMailer, getSignupMode, getStorage } from './context'

export { BackendError, type BackendErrorCode } from './errors'

export * from './refs'

export {
  canAccessMediaKey,
  cleanupUserStorage,
  firstAccount,
  getAccountViews,
  hasCredentialAccount,
  MAX_AVATAR_BYTES,
  updateProfileAvatar,
  updateProfileName,
} from './accounts'

export { completeSetup, isSetupComplete, setupToken, type SetupInput } from './setup'

export {
  approveUser,
  countPendingUsers,
  declineUser,
  deleteAdminUser,
  listUsers,
  setUserRole,
} from './admin-users'

export {
  createAuth,
  isApproved,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  resolveNewUserAccess,
  type Auth,
} from './auth'

export {
  approvedMail,
  confirmEmailMail,
  createMailer,
  escapeHtml,
  resetPasswordMail,
  verifyEmailMail,
  type Mail,
  type Mailer,
} from './mail'

export { assetRef, recordAsset } from './assets'

export { createProject, deleteProject, getProject, listProjects, saveProject } from './projects'

export { createUploadServer, type UploadedAsset } from './uploads'

export { serveMedia } from './media'

export {
  getPortfolio,
  getPublishedProject,
  isPublishedKey,
  publishedKeys,
  recordView,
} from './gallery'
