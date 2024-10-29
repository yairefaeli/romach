import { BasicFolder } from "src/domain/entities/BasicFolder";

export interface BasicFolderChange {
    inserted: BasicFolder[];
    updated: BasicFolder[];
    deleted: string[];
}