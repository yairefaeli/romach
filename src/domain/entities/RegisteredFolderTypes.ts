import { RegisteredFolderProps } from "./RegisteredFolder";

export type RegisteredFolderErrorStatus =
  | 'wrong-password'
  | 'general-error'
  | 'not-found'
  | 'loading';

export type RegisteredFolderStatus = 'valid' | RegisteredFolderErrorStatus;

export type ValidRegisteredFolderInput = Pick<
  RegisteredFolderProps,
  'upn' | 'folder' | 'password' | 'lastValidPasswordTimestamp'
>;

export type InvalidRegisteredFolderInput = Pick<
  RegisteredFolderProps,
  'upn' | 'folderId' | 'isPasswordProtected' | 'password' | 'lastValidPasswordTimestamp' | 'status'
>;

export type RegisteredFolderInput = ValidRegisteredFolderInput | InvalidRegisteredFolderInput;


export type PasswordProtectedValidSpecificationProps = Pick<
  RegisteredFolderProps,
  'isPasswordProtected' | 'password' | 'lastValidPasswordTimestamp'
>;
