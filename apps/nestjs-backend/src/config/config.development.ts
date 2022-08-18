/*
 * @Author: Sheng.Jiang
 * @Date: 2021-09-03 11:32:52
 * @LastEditTime: 2022-05-23 09:06:25
 * @LastEditors: Please set LastEditors
 * @Description: 测试环境配置文件
 * @FilePath: \meimei-admin\src\config\config.development.ts
 * You can you up，no can no bb！！
 */
import { defineConfig } from './defineConfig';

export default defineConfig({
  jwt: {
    secret: process.env.JWT_SECRET || '123456',
  },
  // typeorm 配置
  database: {
    type: 'mysql',
    host: process.env.MYSQL_HOST || '47.102.218.158',
    port: process.env.MYSQL_PORT || 3306,
    username: process.env.MYSQL_USERNAME || 'meimei',
    password: process.env.MYSQL_PASSWORD || 'meimei123',
    database: process.env.MYSQL_DATABASE || 'mei_mei_dev',
    autoLoadModels: true,
    synchronize: true,
    logging: false,
  },
  // redis 配置
  redis: {
    config: {
      url: 'redis://:123456@localhost:6379/11'
    }
  },

  // 队列reids 配置
  bullRedis: {
    host: 'localhost',
    port: '6379',
    password: '123456'
  },

  tencentSMS: {
    SecretId: process.env.SecretId,
    SecretKey: process.env.SecretKey,
    CosDomain: 'https://img.startland.top',
    CosBucket: 'startland-1312838165',
    CosRegion: 'ap-shanghai',
    SmsSdkAppId: '1400706961',
    TemplateLoginId: '1473029',
    TemplateRegId: '1473032',
    SignName: '启洲数字'
  },

  crichain: {
    tokenUrl: 'http://api.startland.top/api/token/',
    platformAddress: '0x8fa5914ae97735b19d5cfaac0bf4e04ab55a4dab',
    platformPrivateKey: 'e6779259efd057970aa83ea5cc9db62d72695ce95de9cb117c8b635418605e5d',
    contractAddress: '0x10a35e43698ca65009c61550b5e9f20226042609'
  },

  isDemoEnvironment: false,
});
