import { ValidationResult } from '../../utils/ValidationUtils/ValidationResult';
import { ValidationUtils } from '../../utils/ValidationUtils/ValidationUtils';
import { BasicFolder } from './BasicFolder';
import { Result } from 'rich-domain';
import { Point } from './Point';
import { Area } from './Area';
import { z } from 'zod';

export interface FolderProps {
    type: 'folder';
    basicFolder?: BasicFolder;
    entities: {
        areas: Area[];
        points: Point[];
    };
}
export class Folder {
    private constructor(private props: FolderProps) {
        this.props = props;
    }

    static create(props: FolderProps): Result<Folder, string> {
        const validationResult = this.isValid(props);
        if (!validationResult.value()) return Result.fail(validationResult.error().join('\n'));
        return Result.Ok(new Folder(props));
    }

    private static isValid(props: FolderProps): ValidationResult {
        const schema = z.object({
            basicFolder: z.any(),
            entities: z.object({
                areas: z.array(z.any()).default([]),
                points: z.array(z.any()).default([]),
            }),
        });
        return ValidationUtils.calcValidation(props, schema);
    }

    getProps(): FolderProps {
        return this.props;
    }
}
