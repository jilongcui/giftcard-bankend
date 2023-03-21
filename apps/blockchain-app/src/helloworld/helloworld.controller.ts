import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller('hello')
export class HelloworldController {
    @MessagePattern({ cmd: 'hello' })
    async printHello(data: string) {
        return `Hello ${data}`
    }
}
