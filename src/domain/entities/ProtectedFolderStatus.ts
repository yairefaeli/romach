export type FolderErrorStatus = 'wrong-password-for-folder' | 'general-error' | 'not-found' | 'folder-not-protected ';

export type ProtectedFolderErrorStatus = 'wrong-password-for-folder' | FolderErrorStatus;
