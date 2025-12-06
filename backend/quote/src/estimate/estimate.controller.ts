// kevin@devserver:~/alphacar/backend/quote/src/estimate$ cat estimate.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Delete, 
  Param, 
  HttpCode, 
  HttpStatus, 
  UsePipes, 
  ValidationPipe, 
  Logger,
  NotFoundException 
} from '@nestjs/common'; 
import { EstimateService } from './estimate.service';
import { CreateEstimateDto } from './dto/create-estimate.dto'; 

@Controller('estimate')
export class EstimateController {
    private readonly logger = new Logger(EstimateController.name);

    constructor(private readonly estimateService: EstimateService) {}

    /**
     * 1. 견적 저장 API
     * @POST /estimate (응답: 201 Created)
     */
    @Post()
    @HttpCode(HttpStatus.CREATED) 
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true })) 
    async create(@Body() createEstimateDto: CreateEstimateDto) {
        return this.estimateService.create(createEstimateDto);
    }

    /**
     * 2. 내 견적 목록 조회 API
     * @GET /estimate/list?userId=...
     */
    @Get('list')
    async findAll(@Query('userId') userId: string) {
        if (!userId) return [];
        return this.estimateService.findAll(userId);
    }

    /**
     * 3. 내 견적 개수 조회 API
     * @GET /estimate/count?userId=...
     */
    @Get('count')
    async count(@Query('userId') userId: string): Promise<{ count: number }> {
        if (!userId) return { count: 0 };
        const count = await this.estimateService.count(userId);
        return { count };
    }

    /**
     * 4. 견적 삭제 API
     * @DELETE /estimate/:id (응답: 200 OK)
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK) 
    async delete(@Param('id') id: string): Promise<{ success: boolean; message: string; deletedId: string }> {
        const result = await this.estimateService.delete(id);
        
        if (!result) {
            throw new NotFoundException(`삭제할 견적 ID ${id}를 찾을 수 없습니다.`);
        }

        return { 
            success: true, 
            message: '견적이 성공적으로 삭제되었습니다.',
            deletedId: id
        };
    }
}
