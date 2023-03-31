import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { stubObject } from 'lodash';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateEmailDto, ListEmailDto, SendEmailDto, SendEmailWithAttachDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { Email } from './entities/email.entity';
import { SES, SendRawEmailCommand } from '@aws-sdk/client-ses';
const nodemailer = require("nodemailer");

@Injectable()
export class EmailService {
  logger = new Logger(EmailService.name)
  platformEmail: string
  emailRegion: string
  emailVersion: string
  constructor(
    @InjectRepository(Email) private readonly emailRepository: Repository<Email>,
    private readonly configService: ConfigService
  ) {
    this.platformEmail = this.configService.get<string>('aws.platformEmail')
    this.emailRegion = this.configService.get<string>('aws.emailRegion')
    this.emailVersion = this.configService.get<string>('aws.emailRegion')
  }


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
  
  async send(sendEmailDto: SendEmailDto, userId: number) {

    const ses = new SES({
      region: this.emailRegion,
      apiVersion: this.emailVersion,
      credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID
      }
    });
    let transporter = nodemailer.createTransport({
      SES: {
        ses: ses,
        aws: { SendRawEmailCommand},
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: this.platformEmail,
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,                // Subject line
      text: sendEmailDto.text,                      // plaintext version
      html: '<div>' + sendEmailDto.text + '</div>', // html version
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    return info; // or something
  }

  async sendWithAttach(sendEmailDto: SendEmailWithAttachDto, userId: number) {

    let usefulData = 'some,stuff,to,send';
    
    const ses = new SES({
      region: this.emailRegion,
      apiVersion: this.emailVersion,
      credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID
      }
    });
    let transporter = nodemailer.createTransport({
      SES: {
        ses: ses,
        aws: { SendRawEmailCommand},
      }
    });
    

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: this.platformEmail,
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,                // Subject line
      text: sendEmailDto.text,                      // plaintext version
      html: '<div>' + sendEmailDto.text + '</div>', // html version
    });

    this.create(sendEmailDto as CreateEmailDto, userId)
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    return info; // or something
  }
}
