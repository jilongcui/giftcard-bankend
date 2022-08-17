import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere } from 'typeorm';
import * as COS from 'cos-nodejs-sdk-v5';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
    cos: COS
    bucket: string
    region: string

    constructor(
        private readonly configService: ConfigService,
    ) {
        const secretId = this.configService.get<string>('tencentSMS.SecretId')
        const secretKey = this.configService.get<string>('tencentSMS.SecretKey')
        this.cos = new COS({
            SecretId: secretId,
            SecretKey: secretKey,
        });

        this.bucket = 'startland-1312838165';
        this.region = 'ap-shanghai';
    }

    async uploadToCos(fileName: string, localPath: string): Promise<string> {
        // 分片上传
        const result = await this.cos.sliceUploadFile({
            Bucket: this.bucket,
            Region: this.region,
            Key: fileName,
            FilePath: localPath // 本地文件地址，需自行替换
        });

        return "https://" + result.Location
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