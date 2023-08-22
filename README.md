程序框架

```
后端框架 nestjs
前端框架 vue
数据库 mysql
Email SES服务
```

后段框架说明

```
apps/giftcard 目录是本项目相关的模块
libs/modules	是所有项目的公共模块
config.production.ts 是项目配置文件
```

还有一些设置是通过环境变量进行设置的

后端编译

```
npm install
npm run build giftcard
```

后端部署

```
拷贝 dist 到 ~/nestjs-backend/dist
```
