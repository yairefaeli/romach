import { ValidationResult } from '../../utils/ValidationUtils/ValidationResult';
import { ValidationUtils } from '../../utils/ValidationUtils/ValidationUtils';
import { Result } from 'rich-domain';
import { z } from 'zod';

export interface PointProps {
    id: string;
    name: string;
    other?: string;
}

export class Point {
    private constructor(private props: PointProps) {
        this.props = props;
    }

    static create(props: PointProps): Result<Point, string> {
        const validationResult = this.isValid(props);
        if (!validationResult.value()) return Result.fail(validationResult.error().join('\n'));
        return Result.Ok(new Point(props));
    }

    getProps(): PointProps {
        return this.props;
    }

    private static isValid(props: PointProps): ValidationResult {
        const schema = z.object({
            id: ValidationUtils.MANDATORY_STRING,
            name: ValidationUtils.MANDATORY_STRING,
            other: z.string().nullable(),
        });
        return ValidationUtils.calcValidation(props, schema);
    }
}
