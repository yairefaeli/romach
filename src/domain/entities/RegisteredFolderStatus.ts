export type RegisteredFolderErrorStatus =
  | 'worng-password'
  | 'general-error'
  | 'not-found'
  | 'loading';

export type RegisteredFolderStatus = 'valid' | RegisteredFolderErrorStatus;