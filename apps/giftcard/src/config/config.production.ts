/*
 * @Author: Sheng.Jiang
 * @Date: 2021-09-03 11:32:52
 * @LastEditTime: 2022-05-23 09:20:26
 * @LastEditors: Please set LastEditors
 * @Description: 正式环境配置文件
 * @FilePath: \meimei-admin\src\config\config.production.ts
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
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    username: process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD || 'admin',
    database: process.env.MYSQL_DATABASE || 'mei-mei',
    autoLoadModels: true,
    synchronize: true,
    logging: false,
  },
  // redis 配置
  redis: {
    config: {
      url: `redis://:123456@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`
    }
  },

  // 队列reids 配置
  bullRedis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
    password: '123456'
  },

  tencentSMS: {
    SecretId: process.env.SecretId,
    SecretKey: process.env.SecretKey,
    SmsSdkAppId: process.env.SmsSdkAppId,
    TemplateLoginId: process.env.TemplateLoginId,
    TemplateRegId: process.env.TemplateRegId,
    SignName: process.env.SignName
  },

  tencentCOS: {
    SecretId: process.env.CosSecretId,
    SecretKey: process.env.CosSecretKey,
    CosDomain: process.env.CosDomain,
    CosGlobalDomain: process.env.CosGlobalDomain,
    CosBucket: process.env.CosBucket,
    CosRegion: process.env.CosRegion,
  },

  wallet: {
    baseUrl: process.env.WALLET_BASEURL || 'https://wallet.base.com/',
    withdrawUrl: process.env.WALLET_WITHDRAW_URL
  },

  aws: {
    platformEmail: process.env.PLATFORM_EMAIL || 'service@88wallet.com',
    emailRegion: process.env.EMAIL_REGION || 'ap-southeast-1',
    emailVersion: process.env.EMAIL_VERSION || '2010-12-01',
  },

  email: {
    systemEmail: process.env.SYSTEM_EMAIL,
    regCodeTemplate: {
      subject: {
        'CN': '注册验证码 {code}',
        'EN': 'Register Code {code}',
        'HK': '註冊驗證碼 {code}',
      },
      content: {
        'CN': '注册验证码 {code}',
        'EN': 'Register Code {code}',
        'HK': '註冊驗證碼 {code}',
      }
    },

    loginCodeTemplate: {
      subject: {
        'CN': '登录验证码 {code}',
        'EN': 'Login Code {code}',
        'HK': '登錄驗證碼 {code}',
      },
      content: {
        'CN': '登录验证码 {code}',
        'EN': 'Login Code {code}',
        'HK': '登錄驗證碼 {code}',
      }
    },
  },

  fund33: {
    baseUrl: process.env.FUND33_BASEURL,
    notifyUrl: process.env.FUND33_NOTIFY_URL,
    appId: process.env.FUND33_APPID,
    appKey: process.env.FUND33_APPKEY,
    appSecret: process.env.FUND33_APPSECRET,
  },

  kyc: {
    notifyUrl: process.env.KYC_NOTIFY_URL
  },

  platform: {
    secret: process.env.PlatformSecret || '156duv'
  },

  isDemoEnvironment: false,
  isBlockchainAddress: false,
});
