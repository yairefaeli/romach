import { ValidationResult } from '../../utils/ValidationUtils/ValidationResult';
import { ValidationUtils } from '../../utils/ValidationUtils/ValidationUtils';
import { Result } from 'rich-domain';
import { z } from 'zod';

export interface AreaProps {
    id: string;
    name: string;
    other?: string;
}

export class Area {
    private constructor(private props: AreaProps) {
        this.props = props;
    }

    static create(props: AreaProps): Result<Area, string> {
        const validationResult = this.isValid(props);
        if (!validationResult.value()) return Result.fail(validationResult.error().join('\n'));
        return Result.Ok(new Area(props));
    }

    getProps(): AreaProps {
        return this.props;
    }

    private static isValid(props: AreaProps): ValidationResult {
        const schema = z.object({
            id: ValidationUtils.MANDATORY_STRING,
            name: ValidationUtils.MANDATORY_STRING,
            other: z.string().nullable(),
            x: z.array(z.boolean()).default([]),
        });
        return ValidationUtils.calcValidation(props, schema);
    }
}
