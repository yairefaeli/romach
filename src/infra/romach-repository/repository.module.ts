import { RomachRepositoryFactoryService } from './romach-repository-factory.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [RomachRepositoryFactoryService],
  exports: [RomachRepositoryFactoryService],
})
export class RomachRepositoryModule { }
