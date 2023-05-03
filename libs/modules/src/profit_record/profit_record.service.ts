import { Injectable } from '@nestjs/common';
import { CreateProfitRecordDto } from './dto/create-profit_record.dto';
import { UpdateProfitRecordDto } from './dto/update-profit_record.dto';

@Injectable()
export class ProfitRecordService {
  create(createProfitRecordDto: CreateProfitRecordDto) {
    return 'This action adds a new profitRecord';
  }

  findAll() {
    return `This action returns all profitRecord`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profitRecord`;
  }

  update(id: number, updateProfitRecordDto: UpdateProfitRecordDto) {
    return `This action updates a #${id} profitRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} profitRecord`;
  }
}
