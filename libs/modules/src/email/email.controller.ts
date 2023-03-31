import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto, ListEmailDto, SendEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';

@Controller('email')
@ApiTags('邮箱')
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  create(@Body() createEmailDto: CreateEmailDto, @UserDec(UserEnum.userId) userId: number,) {
    return this.emailService.create(createEmailDto, userId);
  }

  @Get('list')
  @RequiresRoles(['admin', 'system'])
  list(@Query() listEmailDto: ListEmailDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return this.emailService.list(listEmailDto, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmailDto: UpdateEmailDto) {
    return this.emailService.update(+id, updateEmailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emailService.remove(+id);
  }

  @Post('send')
  send(@Body() sendEmailDto: SendEmailDto, @UserDec(UserEnum.userId) userId: number,) {
    return this.emailService.send(sendEmailDto, userId);
  }
}
