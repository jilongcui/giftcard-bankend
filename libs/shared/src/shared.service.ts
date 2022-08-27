/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-08 17:14:57
 * @LastEditTime: 2022-05-05 16:00:15
 * @LastEditors: Please set LastEditors
 * @Description: 公共方法
 * 
 * @FilePath: \meimei-admin\src\shared\shared.service.ts
 * You can you up，no can no bb！！
 */

import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import * as CryptoJS from 'crypto-js';
import { customAlphabet, nanoid } from 'nanoid';
import { Request } from 'express'
import axios from 'axios';
import * as iconv from 'iconv-lite'
import { CAPTCHA_IMG_KEY } from '@app/common/contants/redis.contant';
import { isEmpty } from 'lodash';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { ApiException } from '@app/common/exceptions/api.exception';
import { generateKeyPairSync, publicEncrypt } from 'crypto';
const fs = require("fs");
const xml2js = require('xml2js');
const parser = new xml2js.Parser({
    explicitArray: false
});


@Injectable()
export class SharedService {
    constructor(
        @InjectRedis() private readonly redis: Redis,
    ) { }
    /**
     * 构造树型结构数据
     */
    public handleTree(data: any[], id?: string, parentId?: string, children?: string) {
        let config = {
            id: id || 'id',
            parentId: parentId || 'parentId',
            childrenList: children || 'children'
        };

        var childrenListMap = {};
        var nodeIds = {};
        var tree = [];

        for (let d of data) {
            let parentId = d[config.parentId];
            if (childrenListMap[parentId] == null) {
                childrenListMap[parentId] = [];
            }
            nodeIds[d[config.id]] = d;
            childrenListMap[parentId].push(d);
        }

        for (let d of data) {
            let parentId = d[config.parentId];
            if (nodeIds[parentId] == null) {
                tree.push(d);
            }
        }

        for (let t of tree) {
            adaptToChildrenList(t);
        }

        function adaptToChildrenList(o) {
            if (childrenListMap[o[config.id]] !== null) {
                o[config.childrenList] = childrenListMap[o[config.id]];
            }
            if (o[config.childrenList]) {
                for (let c of o[config.childrenList]) {
                    adaptToChildrenList(c);
                }
            }
        }
        return tree;
    }


    /* 获取请求IP */
    getReqIP(req: Request): string {
        return (
            // 判断是否有反向代理 IP
            (
                (req.headers['x-forwarded-for'] as string) ||
                // 判断后端的 socket 的 IP
                req.socket.remoteAddress ||
                ''
            ).replace('::ffff:', '')
        );
    }

    /* 判断IP是不是内网 */
    IsLAN(ip: string) {
        ip.toLowerCase();
        if (ip == 'localhost') return true;
        var a_ip = 0;
        if (ip == "") return false;
        var aNum = ip.split(".");
        if (aNum.length != 4) return false;
        a_ip += parseInt(aNum[0]) << 24;
        a_ip += parseInt(aNum[1]) << 16;
        a_ip += parseInt(aNum[2]) << 8;
        a_ip += parseInt(aNum[3]) << 0;
        a_ip = a_ip >> 16 & 0xFFFF;
        return (a_ip >> 8 == 0x7F || a_ip >> 8 == 0xA || a_ip == 0xC0A8 || (a_ip >= 0xAC10 && a_ip <= 0xAC1F));
    }

    /* 通过ip获取地理位置 */
    async getLocation(ip: string) {
        if (this.IsLAN(ip)) return '内网IP'
        let { data } = await axios.get(`http://whois.pconline.com.cn/ipJson.jsp?ip=${ip}&json=true`, { responseType: "arraybuffer" })
        data = JSON.parse(iconv.decode(data, 'gbk'))
        return data.pro + ' ' + data.city;
    }

    /**
     * @description: AES加密
     * @param {string} msg
     * @param {string} secret
     * @return {*}
     */
    aesEncrypt(msg: string, secret: string): string {
        return CryptoJS.AES.encrypt(msg, secret).toString();
    }

    /**
     * @description: AES解密
     * @param {string} encrypted
     * @param {string} secret
     * @return {*}
     */
    aesDecrypt(encrypted: string, secret: string): string {
        return CryptoJS.AES.decrypt(encrypted, secret).toString(CryptoJS.enc.Utf8);
    }

    /**
     * @description: md5加密
     * @param {string} msg
     * @return {*}
     */
    md5(msg: string): string {
        return CryptoJS.MD5(msg).toString();
    }

    /**
     * @description: 生成一个UUID
     * @param {*}
     * @return {*}
     */
    generateUUID(): string {
        return nanoid();
    }

    /**
     * @description: 生成随机数
     * @param {number} length
     * @param {*} placeholder
     * @return {*}
     */
    generateRandomValue(length: number, placeholder = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM',): string {
        const customNanoid = customAlphabet(placeholder, length);
        return customNanoid();
    }

    async checkImageCaptcha(uuid: string, code: string) {
        const cacheCode = await this.redis.get(`${CAPTCHA_IMG_KEY}:${uuid}`)
        if (isEmpty(cacheCode) || code.toLowerCase() !== cacheCode.toLowerCase())
            return false
        await this.redis.del(`${CAPTCHA_IMG_KEY}:${uuid}`)
        return true
    }

    compactJsonToString(data: Object) {
        let sign = '';
        for (let key in data) {
            sign += '&' + key + '=' + data[key]
        }
        return sign.slice(1)
    }
    getPublicX905FromString(str: string) {
        const rawcert = this.stringChunks(str, 64)
        const cert = "-----BEGIN CERTIFICATE-----\n" + rawcert + "\n-----END CERTIFICATE-----";
        return cert
    }

    getPublicPemFromString(str: string) {
        const rawcert = this.stringChunks(str, 64)
        const cert = "-----BEGIN PUBLIC KEY-----\n" + rawcert + "\n-----END PUBLIC KEY-----";
        return cert
    }

    getPrivateFromString(str: string) {
        const rawcert = this.stringChunks(str, 64)
        const cert = "-----BEGIN PRIVATE KEY-----\n" + rawcert + "\n-----END PRIVATE KEY-----";
        return cert
    }

    stringChunks(str, chunkSize) {
        chunkSize = (typeof chunkSize === "undefined") ? 140 : chunkSize;
        let resultString = "";

        if (str.length > 0) {
            let resultArray = [];
            let chunk = "";
            for (let i = 0; i < str.length; i = (i + chunkSize)) {
                chunk = str.substring(i, i + chunkSize);
                if (chunk.trim() != "") {
                    resultArray.push(chunk);
                }
            }
            if (resultArray.length) {
                resultString = resultArray.join("\n");
            }
        } else {
            resultString = str;
        }

        return resultString;
    }

    // Creating a function to encrypt string
    encryptString(plaintext, publicKeyFile) {
        const publicKey = fs.readFileSync(publicKeyFile, "utf8");
        // publicEncrypt() method with its parameters
        const encrypted = publicEncrypt(
            publicKey, Buffer.from(plaintext));
        return encrypted.toString("base64");
    }

    // Using a function generateKeyFiles
    generateKeyFiles() {
        const keyPair = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: ''
            }
        });

        // Creating public key file 
        fs.writeFileSync("./public_key", keyPair.publicKey);
        fs.writeFileSync("./private_key", keyPair.privateKey);
    }

    // Get bank type from bank name
    getBankType(bankName: string) {
        if (bankName.search('工商') >= 0) return ['1', '#B12117,#9D180D']
        if (bankName.search('建设') >= 0) return ['2', '#3766C9,#2954B1']
        if (bankName.search('农业') >= 0) return ['3', '#B12117,#9D180D']
        if (bankName.search('中国银行') >= 0) return ['4', '#B12117,#9D180D']
        if (bankName.search('交通') >= 0) return ['5', '#284879,#172945']
        if (bankName.search('招商') >= 0) return ['6', '#CD2C2F,#C52A2D']
        if (bankName.search('兴业') >= 0) return ['7', '#153A73,#102E5D']
        if (bankName.search('邮政') >= 0) return ['8', '#295E34,#285E34']
        if (bankName.search('中信') >= 0) return ['9', '#295E34,#285E34']
        if (bankName.search('民生') >= 0) return ['10', '#4AA495,#24569C']
        if (bankName.search('其它') >= 0) return ['11', '#AB14AF-#7149CE']
    }

    bankBgColor = {
        "ICBC": '#B12117,#9D180D',
        "CCB": '#3766C9,#2954B1',
        "ABC": '#B12117,#9D180D',
        "BOC": '#B12117,#9D180D',
        "BC": '#284879,#172945',
        "CMB": '#CD2C2F,#C52A2D',
        "CIB": '#153A73,#102E5D',
        "PSBC": '#295E34,#285E34',
        "CITIC": '#295E34,#285E34',
    }

    // Get bank type from bank name
    getBankBgColor(bankType: string) {
        if (this.bankBgColor[bankType] !== undefined) {
            return this.bankBgColor[bankType]
        }
        return '#AB14AF-#7149CE'
    }

    async xmlToJson<T>(data: string): Promise<T> {
        const res = await new Promise<T>((resolve, reject) => {
            parser.parseString(data, function (err, result) {
                if (result) {
                    resolve(result.root)
                }
            });
        })
        return res
    }
}
