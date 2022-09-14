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
    synchronize: false,
    logging: false,
  },
  // redis 配置
  redis: {
    config: {
      url: 'redis://:123456@localhost:6379/12'
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
    SignName: 'Startland'
  },

  crichain: {
    apiUrl: 'https://openapi.crichain.cn/',
    tokenUrl: 'https://api.startland.top/api/token/',
    contractAddr: '0x6073ec873f48099ab2818b3c3089e7f339c4787f',
    platformAddress: '0x95aba0fdff121a98dd8007c96d3324f64b8db467',
    platformPrivateKey: process.env.PlatformPrivateKey,
  },

  payment: {
    baseUrl: 'https://Pay.Heepay.com/',
    platformPublicKey: process.env.PLATFORM_PUBLICKEY || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3jSzrlNHBuZEME7Mbg0RFcgNvq6VCcx3UEmjLkWO4PdCHLTNP27a4+fjtbyndIPLYDe52SbiIq6SY0LUG0xLR0o1aXESVxpp/04CXuURhlsngmkzFqetkey60QhXKWWf+bC8EnLbcew9Z49yAgwPjsiAOikMZ8Yq8WBH+6iza8EnVGXGrH6Et0Qv5CheTUZY1/sgMg+2niCpJQxDTviQGmmhIJZM8an3/nq0insbqARmiIseLlqFloiuhP54o8tP3z2ddCloWWzd+ZtuWG9AOd+vkZNkiDM4oex934oR/G7qbNBa5i6hIKZ3JJBVkGnuVA7tftVCRCsqCvgwpL6R/QIDAQAB',
    merchSecretKey: process.env.MERCH_SECRETKEY || 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5XkR5gTRgWLAUeyCvnQZA4pdZ6ayV8R+//KzQjDW18SEaFb/g+9b4jX6tyWniEXWYhXrHXyTbI6ZvykRpD2HfMo1Bvb1OKIVZYKG9chJmcekGKufbmQ4Pxuoy72I8Qhi8zmO29pROE7nM7EHgh1aYtcpJIBmq9Zuc8BddIk6t4Cxo6NMtHSbgzXCcqw67zCRDyf8mLZIc+o5ObzNZqbqAwD7bRUctCbYlUumXNJYBzbQ3aNQxZow1GDw23zbqqPgRVI3iXyNX5FWipTMUgGDpo6wDF3hOT1Z0xRdtBfEkdT6UyruRKGbbWiDd9roa75W4mlmvM0y7g7ZhuVkoaJn7AgMBAAECggEAFGeKBg3w5AIfL8H18R7Jx26p1l3gf4jRQ+Leav5kEyj9yc9HFc7i9O0uWpbnLtlZJnba8wNIHU8pTPjo2t+0mEsKPYhTRD01oIcAhsf9uoUjb2hdqVCJubbdpMmw+I0WCAJ3+3XdEVMeiq4e+kYrhBfOson0CVuLy5SqHbhfDMiF6SzRiTFMAELos7SwfjXZ0VAclGP7do/XWyUp2b2l9Z0nnaeKU2ecNBZlDXKcpsZ2Omz8HIXyJpeKooN63DSkjobPm6+/saNAL5118ZC8SxnvbZ61gsEk8/feHoYr58g6zgllLEb5uR7DJjmxrCF/bMqGv2OQ35s0cnPwUds/cQKBgQD7JACTjg2D/mvBSeZxsmOiLqJIoxeUOlH7OliPe6uF9XAJat2LJCpN5UPbUqgBC280SvzhJG103WeZIBNYiRqxC0qQUw1qUkpavJ1TkYw7lO5m/9b5TebQ05qTiBWd1DmJYbXfPQRjwjAG2/MkGIvdnZ43NhqnQeNXUHtr7T1RrQKBgQC89HgDymVmgHo1Ffc1z1cMOdnJzIXr6O3Gtj5Zhra+98qqKT/HAIAIhKsn9zNLUGT+XbkB1J5K68A1JlXc1LEZIiq0TEXAEerTH3XlplhdZ8qvRnVm48hqwyIQ+ZTllzOYloH5cHQkBsPkCIN7rz0N+P2SC7cw5Uo1Rr3vS+8fRwKBgC8lSBJrNXBU/8eOZvtrILceiAqYy2FhPWirQFrXPZDtTXYHIMXxKRvscTuoHa/shJjNhwGBBCdPNRaS5e7V9jPMSdgkLz2JaznzdJlulmPNBqBBYQr2K+GCB9+wSVaSs6ZtuGXLH5rWpotzGQbqsL8OytfUiVZi0RngGvtc0wkVAoGADb5+iFANhiIsQXZCkBBv1XzTwaD10M4VlZGmAV8SJdviSvRLJk98AKKdzH9npL/JSNNKZL6xcOOrDHKoZjK2WwyoLIsru6fR+99a9QRfgxPMo2ktmvlQl6tv6+orkXOpFh1EgP9UA1bWotyXq8R4XW7SCvB9N7pF5pApuqE8WHsCgYEAvKir/VM1K9Qhk78EshIXygL9F8LQxhpRkquZ3w/81fchn+/xLJv6HHpGLaGywAPM/kONcDkvJFLmHJDQ2cwLgrX2x0bUFRxNjQ0RLT7zjIuJq/WxECLVh6xDI8yGqT6OU0wfMEzinzm5eLaIwqRQLZoI0Qxvvn0nBjSh6/+iJD0=',
    merchPublicKey: process.env.MERCH_PUBLICKEY || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuV5EeYE0YFiwFHsgr50GQOKXWemslfEfv/ys0Iw1tfEhGhW/4PvW+I1+rclp4hF1mIV6x18k2yOmb8pEaQ9h3zKNQb29TiiFWWChvXISZnHpBirn25kOD8bqMu9iPEIYvM5jtvaUThO5zOxB4IdWmLXKSSAZqvWbnPAXXSJOreAsaOjTLR0m4M1wnKsOu8wkQ8n/Ji2SHPqOTm8zWam6gMA+20VHLQm2JVLplzSWAc20N2jUMWaMNRg8Nt826qj4EVSN4l8jV+RVoqUzFIBg6aOsAxd4Tk9WdMUXbQXxJHU+lMq7kShm21og3fa6Gu+VuJpZrzNMu4O2YblZKGiZ+wIDAQAB',
    merchId: process.env.MERCH_ID || '1664502',
  },
  fund: {
    baseCertUrl: 'https://www.heepay.com/',
    basePayUrl: 'https://Pay.heepay.com/',
    platformCert3DESKey: process.env.PLATFORM_CERT_3DESKEY,
    platformCertMD5Key: process.env.PLATFORM_CERT_MD5KEY,
    platformPay3DESKey: process.env.PLATFORM_PAY_3DESKEY,
    platformPayMD5Key: process.env.PLATFORM_PAY_MD5KEY,
    merchId: process.env.MERCH_ID || '1664502',
  },


  isDemoEnvironment: false,
});
