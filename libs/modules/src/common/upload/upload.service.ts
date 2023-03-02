import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere } from 'typeorm';
import * as COS from 'cos-nodejs-sdk-v5';
import { ConfigService } from '@nestjs/config';
import path, { join } from 'path';

@Injectable()
export class UploadService {
    logger = new Logger(UploadService.name)
    cos: COS
    bucket: string
    region: string
    cosDomain: string

    constructor(
        private readonly configService: ConfigService,
    ) {
        const secretId = this.configService.get<string>('tencentCOS.SecretId')
        const secretKey = this.configService.get<string>('tencentCOS.SecretKey')
        this.cosDomain = this.configService.get<string>('tencentCOS.CosDomain')
        this.bucket = this.configService.get<string>('tencentCOS.CosBucket')
        this.region = this.configService.get<string>('tencentCOS.CosRegion')
        this.logger.debug('secretId ' + secretId)
        this.cos = new COS({
            SecretId: secretId,
            SecretKey: secretKey,
        });

    }

    async uploadToCos(fileName: string, localPath: string): Promise<string> {
        // 分片上传
        await this.cos.sliceUploadFile({
            Bucket: this.bucket,
            Region: this.region,
            Key: fileName,
            ChunkSize: 2 * 1024 * 1024,
            FilePath: localPath // 本地文件地址，需自行替换
        });

        return this.cosDomain + '/' + fileName
    }

    async thumbnail(fileName: string, scale: string) {
        // 生成带图片处理参数的文件 URL，不带签名。
        const url = await new Promise((resolve, reject) => {
            this.cos.getObjectUrl({
                Bucket: this.bucket,
                Region: this.region,
                Key: fileName,
                QueryString: `imageMogr2/thumbnail/${scale}/`,
                Sign: false,
            }, (err, data) => {
                if (data) {
                    resolve(data.Url)
                }
            })
        })
        return url
    }
}