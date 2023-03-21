import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { SubmitterService } from '@app/modules/submitter/submitter.service';
import { CreateSubmitterDto, ListSubmitterDto, UpdateSubmitterDto } from '@app/modules/submitter/dto/request-submitter.dto';
import { Submitter } from '@app/modules/submitter/entities/submitter.entity';

@ApiTags('IP藏品提交')
@ApiBearerAuth()
@Controller('submitter')
export class SubmitterController {
    constructor(private readonly submitterService: SubmitterService) { }

    @Post()
    @Public()
    create(@Body() createSubmitterDto: CreateSubmitterDto) {
        return this.submitterService.create(createSubmitterDto);
    }

    @Get('list')
    @ApiPaginatedResponse(Submitter)
    async list(@Query() listSubmitterDto: ListSubmitterDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.submitterService.list(listSubmitterDto, paginationDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.submitterService.findOne(+id);
    }

    @Put(':id/read')
    @RequiresRoles(['admin', 'system'])
    invalidate(@Param('id') id: string) {
        return this.submitterService.setRead(+id);
    }

    @Patch(':id')
    @RequiresRoles(['admin', 'system'])
    update(@Param('id') id: string, @Body() updateSubmitterDto: UpdateSubmitterDto) {
        return this.submitterService.update(+id, updateSubmitterDto);
    }

    @Delete(':id')
    @RequiresRoles(['admin', 'system'])
    remove(@Param('id') id: string) {
        return this.submitterService.deleteOne(+id);
    }
}

