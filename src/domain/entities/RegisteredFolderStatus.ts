export type RegisteredFolderErrorStatus =
  | 'wrong-password'
  | 'general-error'
  | 'not-found'
  | 'loading';

export type RegisteredFolderStatus = 'valid' | RegisteredFolderErrorStatus;