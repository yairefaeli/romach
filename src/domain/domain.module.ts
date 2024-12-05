import { TreeCalculationService } from './services/tree-calculation/tree-calculation.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [TreeCalculationService],
})
export class DomainModule {}
