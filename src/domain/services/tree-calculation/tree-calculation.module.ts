import { TreeCalculationService } from './tree-calculation.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [TreeCalculationService],
    exports: [TreeCalculationService],
})
export class TreeCalculationModule {}
