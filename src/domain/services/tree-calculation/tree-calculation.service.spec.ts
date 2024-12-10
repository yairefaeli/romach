import { TreeCalculationService } from './tree-calculation.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('TreeCalcService', () => {
    let service: TreeCalculationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TreeCalculationService],
        }).compile();

        service = module.get<TreeCalculationService>(TreeCalculationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
