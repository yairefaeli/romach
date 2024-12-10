import { ValidationResult } from '../../utils/ValidationUtils/ValidationResult';
import { ValidationUtils } from '../../utils/ValidationUtils/ValidationUtils';
import { Result } from 'rich-domain';
import { z } from 'zod';

export interface HierarchyProps {
    id: string;
    name: string;
    displayName: string;
    children: Hierarchy[];
}

export class Hierarchy {
    private constructor(private props: HierarchyProps) {
        this.props = props;
    }

    static create(props: HierarchyProps): Result<Hierarchy> {
        const validationResult = Hierarchy.isValid(props);
        if (!validationResult.value()) {
            return Result.fail(validationResult.error().join('\n'));
        }
        return Result.Ok(new Hierarchy(props));
    }

    getProps(): HierarchyProps {
        return this.props;
    }

    static isValid(props: HierarchyProps): ValidationResult {
        const schema = z.object({
            id: ValidationUtils.MANDATORY_STRING,
            name: z.string().nullable(),
            displayName: z.string().min(1),
            children: z.array(z.lazy(() => schema)),
        });
        return ValidationUtils.calcValidation(props, schema);
    }
}
