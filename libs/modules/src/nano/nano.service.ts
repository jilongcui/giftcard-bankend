import { Injectable } from '@nestjs/common';
import { CreateNanoDto } from './dto/create-nano.dto';
import { UpdateNanoDto } from './dto/update-nano.dto';

@Injectable()
export class NanoService {
  create(createNanoDto: CreateNanoDto) {
    return 'This action adds a new nano';
  }

  findAll() {
    return `This action returns all nano`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nano`;
  }

  update(id: number, updateNanoDto: UpdateNanoDto) {
    return `This action updates a #${id} nano`;
  }

  remove(id: number) {
    return `This action removes a #${id} nano`;
  }
}
