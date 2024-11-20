import { Knex } from 'knex';
import { Result } from 'rich-domain';
import { Hierarchy } from 'src/domain/entities/Hierarchy';
import { RealityId } from 'src/application/entities/reality-id';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { HierarchiesRepositoryInterface } from 'src/application/interfaces/hierarchies-interface';

export class HierarchiesRepository implements HierarchiesRepositoryInterface {
    constructor(private readonly knex: Knex, private readonly logger: AppLoggerService, private readonly reality: RealityId) { }

    async saveHierarchies(hierarchy: Hierarchy[]): Promise<Result<void>> {
        try {
            await this.knex('hierarchy').insert(hierarchy).onConflict('id').merge();
            this.logger.info(`Saved ${hierarchy.length} hierarchies for reality ${this.reality}`);
            return Result.Ok();
        } catch (error) {
            this.logger.error('Error saving hierarchies', error);
            return Result.fail('DatabaseError');
        }
    }

    async getHierarchies(): Promise<Result<Hierarchy[]>> {
        try {
            const hierarchies = await this.knex<Hierarchy>('hierarchy').select('*');
            return Result.Ok(hierarchies);
        } catch (error) {
            this.logger.error('Error fetching hierarchies', error);
            return Result.fail('DatabaseError');
        }
    }
}
