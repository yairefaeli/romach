// import { BasicFolder } from '../../domain/entities/BasicFolder';
// import { Timestamp } from '../../domain/entities/Timestamp';
// import { Folder } from '../../domain/entities/Folder';
// import { Hierarchy } from '../../domain/entities/Hierarchy';
// import { Tree } from '../../domain/entities/Tree';
//
// export const basicFoldersMock: BasicFolder[] = [
//   BasicFolder.create({
//     id: '1',
//     name: 'folder1',
//     categoryId: '1',
//     creationDate: Timestamp.now().toString(),
//     deleted: false,
//     isLocal: false,
//     isPasswordProtected: false,
//     updatedAt: Timestamp.now(),
//   }).value(),
//
//   BasicFolder.create({
//     id: '2',
//     name: 'folder2',
//     categoryId: '1',
//     creationDate: Timestamp.now().toString(),
//     deleted: false,
//     isLocal: false,
//     isPasswordProtected: false,
//     updatedAt: Timestamp.now(),
//   }).value(),
//   BasicFolder.create({
//     id: '3',
//     name: 'folder3',
//     categoryId: '1',
//     creationDate: Timestamp.now().toString(),
//     deleted: false,
//     isLocal: false,
//     isPasswordProtected: false,
//     updatedAt: Timestamp.now(),
//   }).value(),
// ];
//
// export const folderMock: Folder[] = [
//   Folder.create({
//     basicFolder: basicFoldersMock[0],
//     entities: {
//       areas: [],
//       points: [],
//     },
//   }).value(),
//   Folder.create({
//     basicFolder: basicFoldersMock[1],
//     entities: {
//       areas: [],
//       points: [],
//     },
//   }).value(),
//   Folder.create({
//     basicFolder: basicFoldersMock[2],
//     entities: {
//       areas: [],
//       points: [],
//     },
//   }).value(),
// ];
//
//
// export const HierarchiesMock: Hierarchy[] = [
//   Hierarchy.create({
//     id: 'hierarchy1', name: 'Hierarchy 1',
//     displayName: '',
//     children: []
//   }).value(),
// ];
//
// export const TreeMock: Tree = {
//   updatedAt: Timestamp.now(),
//   nodes: [
//     {
//       id: '1',
//       name: 'matan',
//       type: 'category'
//     },
//     {
//       id: '2',
//       name: 'snir',
//       type: 'category'
//     },
//   ],
// };
