// import {
//     RomachEnemyBasicFolderDto,
//     RomachEnemyFolder,
//     RomachEnemyFoldersTree,
//     RomachEnemyFoldersTreeHierarchyDto,
//     RomachEnemyFoldersTreeNode,
// } from '@parlament/models';
// import { BasicFoldersPollerService } from '../old-romach-bff/poller/basic-folders-poller.service';
// import { HierarchyPollerService } from '../old-romach-bff/poller/hierarchy-poller.service';
// import { folderMapper } from '../old-romach-bff/folder-by-id/folder-by-ids.service';
// import { RomachConfig } from '../old-romach-bff/config';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { RealityId } from '../old-romach-bff/model';
// import { Inject, Injectable } from '@nestjs/common';
// import { groupBy, isEmpty, isNil } from 'lodash';
// import { ConfigService } from '@nestjs/config';
// import { Logger } from 'af-logger';
//
// @Injectable()
// export class TreeBuilderService {
//     romachConfig: RomachConfig;
//     private treeLastUpdateTimeMap: Map<RealityId, Date>;
//     private foldersLastUpdateTimeMap: Map<RealityId, Date>;
//     private lastBuildTimeMap: Map<RealityId, Date>;
//     private aggregatedTree: Map<RealityId, RomachEnemyFoldersTree>;
//     private categoryCount: Map<RealityId, number>;
//
//     constructor(
//         private readonly hierarchyPollerService: HierarchyPollerService,
//         private readonly foldersPollerService: BasicFoldersPollerService,
//         @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
//         private readonly configService: ConfigService,
//     ) {
//         this.aggregatedTree = new Map<RealityId, RomachEnemyFoldersTree>();
//         this.romachConfig = this.configService.get('romach');
//         this.lastBuildTimeMap = new Map<RealityId, Date>();
//         this.foldersLastUpdateTimeMap = new Map<RealityId, Date>();
//         this.treeLastUpdateTimeMap = new Map<RealityId, Date>();
//
//         this.categoryCount = new Map<RealityId, number>();
//         this.romachConfig.realities.forEach((reality) => {
//             this.categoryCount.set(reality, 0);
//         });
//     }
//
//     init() {
//         this.run();
//         setInterval(async () => {
//             this.run();
//         }, this.romachConfig.treeBuilderPollInterval);
//     }
//
//     hierarchyBuilder(
//         basicFolderDtos: RomachEnemyBasicFolderDto[],
//         hierarchies: RomachEnemyFoldersTreeHierarchyDto[],
//     ): { tree: RomachEnemyFoldersTree; categoriesCount: number } {
//         if (isEmpty(hierarchies) || isNil(basicFolderDtos)) {
//             return { tree: { nodes: [] }, categoriesCount: 0 };
//         }
//
//         let categoryCount = 0;
//
//         const folders: RomachEnemyFolder[] = basicFolderDtos.map(folderMapper);
//
//         const foldersByCategory = groupBy(folders, (folder) => folder.category);
//
//         const nodes = hierarchies.map((hierarchy) => transformNode(hierarchy));
//
//         return { tree: { nodes }, categoriesCount: categoryCount };
//
//         function transformNode(hierarchy: RomachEnemyFoldersTreeHierarchyDto): RomachEnemyFoldersTreeNode {
//             categoryCount += 1;
//             if (hierarchy.children.length === 0) {
//                 return {
//                     type: 'category',
//                     id: hierarchy.id,
//                     name: hierarchy.displayName,
//                     children: foldersByCategory[hierarchy.name] ?? [],
//                 };
//             }
//
//             return {
//                 type: 'category',
//                 id: hierarchy.id,
//                 name: hierarchy.displayName,
//                 children: [
//                     ...(foldersByCategory[hierarchy.name] ?? []),
//                     ...(hierarchy.children.map((child) => transformNode(child)) ?? []),
//                 ],
//             };
//         }
//     }
//
//     getHierarchy(realityId: RealityId) {
//         return this.aggregatedTree.get(realityId);
//     }
//
//     getLastUpdateTime(realityId: RealityId) {
//         return this.lastBuildTimeMap.get(realityId);
//     }
//
//     getCategoryCount(realityId: RealityId) {
//         return this.categoryCount.get(realityId);
//     }
//
//     getHierarchyAndUpdatedAt(realityId: RealityId) {
//         return { ...this.getHierarchy(realityId), updatedAt: this.getLastUpdateTime(realityId) };
//     }
//
//     private async checkForUpdates(realityId: RealityId) {
//         if (
//             this.hierarchyPollerService.getLastUpdateTime(realityId) !== this.treeLastUpdateTimeMap.get(realityId) ||
//             this.foldersPollerService.getLastUpdateTime(realityId) !== this.foldersLastUpdateTimeMap.get(realityId)
//         ) {
//             const hierarchyBuilder = this.hierarchyBuilder(
//                 this.foldersPollerService.getDataAsArray(realityId),
//                 this.hierarchyPollerService.getDataAsArray(realityId),
//             );
//             this.aggregatedTree.set(realityId, hierarchyBuilder.tree);
//             this.categoryCount.set(realityId, hierarchyBuilder.categoriesCount);
//
//             this.logger.debug('hierarchy built');
//             this.lastBuildTimeMap.set(realityId, new Date());
//             this.treeLastUpdateTimeMap.set(realityId, this.hierarchyPollerService.getLastUpdateTime(realityId));
//             this.foldersLastUpdateTimeMap.set(realityId, this.foldersPollerService.getLastUpdateTime(realityId));
//         }
//     }
//
//     private run() {
//         const realities = this.romachConfig.realities;
//         for (const realityId of realities) {
//             this.checkForUpdates(realityId).catch((error) => this.logger.error('hierarchy builder failed' + error));
//         }
//     }
// }
