import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { stubObject } from 'lodash';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateEmailDto, ListEmailDto, SendEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { Email } from './entities/email.entity';
const AWS = require('aws-sdk');
const nodemailer = require("nodemailer");

@Injectable()
export class EmailService {
  logger = new Logger(EmailService.name)

  constructor(
    @InjectRepository(Email) private readonly emailRepository: Repository<Email>,
  ) {}


  create(createEmailDto: CreateEmailDto, userId: number) {
    const email = {
      ...createEmailDto,
      userId
    }
    return this.emailRepository.save(email)
  }

  
  /* 分页查询 */
  async list(listMailList: ListEmailDto, paginationDto: PaginationDto): Promise<PaginatedDto<Email>> {
    let where: FindOptionsWhere<Email> = {}
    let result: any;
    where = listMailList

    result = await this.emailRepository.findAndCount({
      where,
      relations: { user: true,},
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} email`;
  }

  update(id: number, updateEmailDto: UpdateEmailDto) {
    return `This action updates a #${id} email`;
  }

  remove(id: number) {
    return `This action removes a #${id} email`;
  }
  
  async send(sendEmailDto: SendEmailDto) {

    let transporter = nodemailer.createTransport({
      SES: new AWS.SES({ region: 'us-east-1', apiVersion: "2010-12-01" })
    });
    

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: sendEmailDto.from,
      to: sendEmailDto.to,
      subject: stubObject,                // Subject line
      text: sendEmailDto.text,                      // plaintext version
      html: '<div>' + sendEmailDto.text + '</div>', // html version
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    return info; // or something
  }

  async sendWithAttach(sendEmailDto: SendEmailDto, userId: number) {

    let usefulData = 'some,stuff,to,send';
    
    let transporter = nodemailer.createTransport({
      SES: new AWS.SES({ region: 'us-east-1', apiVersion: "2010-12-01" })
    });
    

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: sendEmailDto.from,
      to: sendEmailDto.to,
      subject: stubObject,                // Subject line
      text: sendEmailDto.text,                      // plaintext version
      html: '<div>' + sendEmailDto.text + '</div>', // html version
    });

    this.create(sendEmailDto as CreateEmailDto, userId)
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    return info; // or something
  }
}
