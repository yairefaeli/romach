import { Result } from "rich-domain";

export class ResultUtils {
    public static resultsToValues<T>(results: Result<T | void>[]): T[] {
        return results.map((result) => {
            const value = result.value();
            if (value) return value;
        });
    }
}
