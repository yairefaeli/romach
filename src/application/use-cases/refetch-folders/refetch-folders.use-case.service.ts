// // RefetchFoldersService.ts
// import { Injectable } from "@nestjs/common";
// import { RomachEntitiesApiInterface } from "../../interfaces/romach-entities-api.interface";
// import { RomachRepositoryInterface } from "../../interfaces/romach-repository.interface";
// import { AppLoggerService } from "../../../infra/logging/app-logger.service";
// import { RealityId } from "../../entities/reality-id";
// import { Folder } from "src/domain/entities/Folder";
// import { partition } from "lodash";
// import { BasicFolder } from "src/domain/entities/BasicFolder";

// export interface RefetchFoldersServiceOptions {
//   romachApi: RomachEntitiesApiInterface;
//   repository: RomachRepositoryInterface;
//   logger: AppLoggerService;
//   reality: RealityId;
//   interval: number;
//   chunkSize: number;
// }

// @Injectable()
// export class RefetchFoldersService {
//   constructor(private options: RefetchFoldersServiceOptions) { }

//   // This function handles the refetch operation when folders are updated
//   async execute(basicFolderDeleted: string[], basicFolderUpdatedOrAdded: BasicFolder[]): Promise<void> {
//     this.options.logger.info(`Starting refetch for folders in reality ${this.options.reality}.`);

//     // Divide the folders into protected and unprotected
//     const { protectedFolders, unprotectedFolders } = this.divideFoldersByProtection(basicFolderUpdatedOrAdded);

//     // Refetch folders based on their protection status
//     await this.refetchFolders(protectedFolders, unprotectedFolders);
//   }

//   // Divide folders into protected and unprotected
//   private divideFoldersByProtection(basicFolderUpdatedOrAdded: BasicFolder[]): { protectedFolders: BasicFolder[]; unprotectedFolders: BasicFolder[] } {
//     const [protectedFolders, unprotectedFolders] = partition(basicFolderUpdatedOrAdded, (folder) => folder.getProps().isPasswordProtected);

//     this.options.logger.debug(`Protected folders: ${protectedFolders.length}, Unprotected folders: ${unprotectedFolders.length}`);

//     return {
//       protectedFolders: protectedFolders.map(folder => folder.getProps().id),
//       unprotectedFolders: unprotectedFolders.map(folder => folder.getProps().id),
//     };
//   }

//   // Refetch the folders that need to be updated
//   private async refetchFolders(protectedFolders: BasicFolder[], unprotectedFolders: BasicFolder[]): Promise<void> {
//     await this.handleUnprotectedFolders(unprotectedFolders);
//     await this.handleProtectedFolders(protectedFolders);
//   }

//   private async handleUnprotectedFolders(unprotectedFolders: BasicFolder[]): Promise<void> {
//     const chunks = this.chunkArray(unprotectedFolders, this.options.chunkSize);

//     for (const chunk of chunks) {
//       await Promise.all(
//         chunk.map(async folderId => {
//           const folderResult = await this.options.romachApi.fetchFolderById(folderId);
//           if (folderResult.isOk()) {
//             const folder = folderResult.value() as Folder;
//             await this.options.repository.updateFolderForAllUsers(folder);
//           }
//         })
//       );
//     }
//   }

//   private async handleProtectedFolders(basicFolders: BasicFolder[]): Promise<void> {
//     for (const folderId of protectedFolders) {
//       const passwords = await this.options.repository.findUniquePasswordsForFolder(folderId);

//       for (const password of passwords) {
//         try {
//           const folderResult = await this.options.romachApi.fetchFolderByIdWithPassword(folderId, password);

//           if (folderResult && folderResult.isOk && folderResult.isOk()) {
//             const folder = folderResult.value() as Folder;
//             await this.options.repository.updateFolderForUsersWithPassword(folder, password);
//           } else {
//             await this.options.repository.markPasswordInvalidForUsers(folderId, password);
//           }
//         } catch (error) {
//           await this.options.repository.markPasswordInvalidForUsers(folderId, password);
//         }
//       }
//     }
//   }

//   // Utility function to split an array into chunks for batch processing
//   private chunkArray(arr: string[], chunkSize: number): string[][] {
//     const chunks = [];
//     for (let i = 0; i < arr.length; i += chunkSize) {
//       chunks.push(arr.slice(i, i + chunkSize));
//     }
//     return chunks;
//   }
// }