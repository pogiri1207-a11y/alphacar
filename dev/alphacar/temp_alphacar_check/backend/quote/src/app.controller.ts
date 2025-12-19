// kevin@devserver:~/alphacar/backend/quote/src$ cat app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // 루트 경로만 담당
export class AppController {
    constructor(private readonly appService: AppService) {
        console.log('--- AppController (루트) 초기화 완료 ---');
    }

    @Get('test-log')
    testLog() {
        console.log('--- [DEBUG] AppController: /api/test-log 라우트 도달 ---');
        return { message: 'Root Log check OK' };
    }

    @Get()
    getHello(): string {
        console.log('--- AppController: /api/ 라우트 도달 ---');
        return 'Backend Service is Running';
    }
}
