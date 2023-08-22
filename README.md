程序框架

```
后端框架 nestjs
前端框架 vue
数据库 mysql
Email SES服务
```

后端框架说明

```
apps/giftcard 目录是本项目相关的模块
libs/modules	是项目的公共模块
config.production.ts 是项目配置文件
```

还有一些设置是通过环境变量进行设置的

后端运行环境
```
node v16.14.2
```

本地直接运行
```
npm install
npm run start:giftcard
```

后端编译，生成dist目录

```
npm install
npm run build giftcard
```

服务器端部署
```
cp dist ~/nestjs-backend/dist
pm2 reload giftcard
```
