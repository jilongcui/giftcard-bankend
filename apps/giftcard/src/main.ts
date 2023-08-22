import { AllExceptionsFilter } from '@app/common/filters/all-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { setupSwagger } from './setup-swagger';
import { join } from 'lodash';
import * as history from 'connect-history-api-fallback'
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  /* 全局异常过滤器 */
  app.useGlobalFilters(new AllExceptionsFilter())  // 全局异常过滤器

  app.setGlobalPrefix("api")

  app.disable('x-powered-by')

  // app.useWebSocketAdapter(new IoAdapter(app));

  /* 全局参数校验管道 */
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // 启用白名单，dto中没有声明的属性自动过滤
    transform: true,   // 自动类型转换
  }))

  /* 启动 vue 的 history模式 */
  app.use(history({
    rewrites: [
      {
        from: /^\/swagger-ui\/.*$/,
        to: function (context) {
          return context.parsedUrl.pathname;
        }
      }
    ]
  }))

  /* 配置静态资源目录 */
  app.useStaticAssets(join(__dirname, '../public'));

  /* 启动swagger */
  setupSwagger(app, {title: 'Giftcard', version: '1.0.1'})

  /* 监听启动端口 */
  await app.listen(process.env.APP_PORT || 3000);

  /* 打印swagger地址 */
  console.log(`http://127.0.0.1:${process.env.APP_PORT}/swagger-ui/`);
}
bootstrap();
