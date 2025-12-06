import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Manufacturer } from './schemas/manufacturer.schema';
import { Vehicle } from './schemas/vehicle.schema';
import { VehicleTrim } from './schemas/vehicle_trim.schema';
import { VehicleOption } from './schemas/vehicle_option.schema';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    constructor(
        @InjectModel(Manufacturer.name) private manufacturerModel: Model<Manufacturer>,
        @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
        @InjectModel(VehicleTrim.name) private trimModel: Model<VehicleTrim>,
        @InjectModel(VehicleOption.name) private optionModel: Model<VehicleOption>,
    ) {}

    // 1. 제조사 목록
    async getManufacturers() {
        return this.manufacturerModel.find({}, { name: 1, _id: 1 }).lean().exec();
    }

    // 2. 모델 목록
    async getModelsByManufacturer(makerId: string) {
        if (!makerId || !Types.ObjectId.isValid(makerId)) return [];
        return this.vehicleModel
            .find({ manufacturer_id: new Types.ObjectId(makerId) }, { model_name: 1, _id: 1 })
            .lean()
            .exec();
    }

    // 3. 트림 목록
    async getTrimsByModel(vehicleId: string) {
        if (!vehicleId || !Types.ObjectId.isValid(vehicleId)) return [];

        return this.trimModel
            .find({ vehicle_id: new Types.ObjectId(vehicleId) }, { name: 1, base_price: 1, _id: 1 })
            .lean()
            .exec();
    }

    // 4. ⭐ 트림 상세 정보 (수정됨: _id로 조회)
    async getTrimDetail(trimId: string) {
        console.log(`\n======================================================`);
        console.log(`[!!! START DEBUG: GET DETAIL !!!] 요청 Trim ID: ${trimId}`);
        this.logger.log(`[DETAIL] 조회 시작: ID=${trimId}`);
        
        if (!trimId || !Types.ObjectId.isValid(trimId)) {
            console.warn(`[!!! DEBUG WARN !!!] ID 형식 오류: ${trimId}`);
            this.logger.warn(`[DETAIL] ID 형식 오류: ${trimId}`);
            throw new NotFoundException(`유효하지 않은 Trim ID: ${trimId}`);
        }
        const searchObjectId = new Types.ObjectId(trimId);

        try {
            // ✅ 핵심 수정: vehicle_id 대신 findById(_id) 사용
            console.log(`[!!! DEBUG INFO !!!] DB 쿼리: findById('${searchObjectId}')`);
            this.logger.debug(`[DETAIL] DB: _id ${searchObjectId}로 트림 검색 시작...`);
            
            let trimData: any = await this.trimModel
                .findById(searchObjectId) 
                .lean()
                .exec();

            if (!trimData) {
                console.error(`[!!! DEBUG END: 404 !!!] 데이터 없음.`);
                this.logger.error(`[DETAIL] 트림 데이터 없음: ID=${trimId}`);
                throw new NotFoundException(`Trim ID ${trimId}에 해당하는 데이터를 찾을 수 없습니다.`);
            }
            console.log(`[!!! DEBUG INFO !!!] 트림 찾음: ${trimData.name}`);
            this.logger.debug(`[DETAIL] 트림 데이터 찾음: Trim _id=${trimData._id.toString()}`);

            // 2. 옵션 수동 조회
            const foundOptions = await this.optionModel.find({
                trim_id: trimData._id 
            }).lean().exec();
            trimData.options = foundOptions;
            this.logger.debug(`[DETAIL] 옵션 ${foundOptions.length}개 로드 완료.`);

            // 3. 차량(부모 모델) 및 제조사 정보 조회
            const vehicleId = trimData.vehicle_id || trimData.vehicle;
            if (vehicleId) {
                this.logger.debug(`[DETAIL] DB: 차량 ID ${vehicleId}로 모델/이미지 검색...`);
                const vehicle: any = await this.vehicleModel.findById(vehicleId).lean().exec();
                if (vehicle) {
                    trimData.image_url = vehicle.image_url || vehicle.image || '';
                    trimData.model_name = vehicle.model_name || vehicle.name || '';

                    const makerId = vehicle.manufacturer_id || vehicle.manufacturer;
                    if (makerId && Types.ObjectId.isValid(makerId)) {
                        this.logger.debug(`[DETAIL] DB: 제조사 ID ${makerId}로 이름 검색...`);
                        const maker = await this.manufacturerModel.findById(makerId).lean().exec();
                        if (maker) trimData.manufacturer = maker.name; 
                    } else {
                        trimData.manufacturer = makerId || "제조사 없음";
                    }
                }
            } else {
                trimData.manufacturer = "제조사 없음";
                trimData.model_name = "모델명 없음";
            }

            // 프론트엔드 호환성 유지
            trimData.id = trimId;
            trimData.trimId = trimId;

            console.log(`[!!! DEBUG END: SUCCESS !!!] 조회 완료: ID=${trimId}`);
            console.log(`======================================================\n`);
            this.logger.log(`[DETAIL] 조회 성공: ID=${trimId}`);
            return trimData;
        } catch (e) {
            if (e instanceof NotFoundException) {
                throw e; 
            }
            console.error(`[!!! DEBUG ERROR !!!] 서버 오류: ${e.message}`, e);
            this.logger.error(`[DETAIL] 서버 오류 발생: ID=${trimId}`, e.stack);
            throw new InternalServerErrorException("차량 상세 정보 조회 중 서버 오류 발생");
        }
    }

    // 5. 비교 데이터 조회 (수정됨: _id로 조회)
    async getCompareData(ids: string) {
        console.log(`\n======================================================`);
        console.log(`[!!! START DEBUG: GET COMPARE !!!] 요청 IDs: ${ids}`);
        this.logger.log(`[COMPARE] 조회 시작: IDs=${ids}`);

        if (!ids) return [];

        const idList = ids.split(',').filter(id => id && id.trim() !== '' && Types.ObjectId.isValid(id));
        console.log(`[!!! DEBUG INFO !!!] 유효 ID 목록: ${idList.join(', ')}`);
        this.logger.debug(`[COMPARE] 유효한 ID 목록: ${idList.join(', ')}`);

        const promises = idList.map(async (trimId) => {
            const searchObjectId = new Types.ObjectId(trimId);

            // ✅ 핵심 수정: vehicle_id 대신 findById(_id) 사용
            const trim: any = await this.trimModel
                .findById(searchObjectId)
                .lean()
                .exec();
            
            if (!trim) {
                console.warn(`[!!! DEBUG WARN !!!] 비교 트림 데이터 없음 (ID: ${trimId})`);
                this.logger.warn(`[COMPARE] 트림 데이터 없음 (ID: ${trimId})`);
                return null;
            }
            
            // 옵션 수동 조회
            const foundOptions = await this.optionModel.find({
                trim_id: trim._id 
            }).lean().exec();
            trim.options = foundOptions;

            // 모델/제조사 정보 조회
            let modelName = 'Unknown Model';
            let makerName = 'Unknown Maker';
            let imageUrl = '';

            const vehicleId = trim.vehicle_id || trim.vehicle;
            if (vehicleId) {
                const vehicle: any = await this.vehicleModel.findById(vehicleId).lean().exec();
                if (vehicle) {
                    modelName = vehicle.model_name || vehicle.name || modelName;
                    imageUrl = vehicle.image_url || vehicle.image || '';

                    const makerId = vehicle.manufacturer_id || vehicle.manufacturer;
                    if (makerId && Types.ObjectId.isValid(makerId)) {
                        const maker = await this.manufacturerModel.findById(makerId).lean().exec();
                        if (maker) makerName = maker.name;
                    }
                }
            }

            return {
                ...trim,
                model_name: modelName,
                manufacturer: makerName,
                image_url: imageUrl,
                options: foundOptions, 
            };
        });

        const results = await Promise.all(promises);
        console.log(`[!!! DEBUG END: COMPARE SUCCESS !!!] 최종 결과 ${results.filter(item => item !== null).length}개`);
        console.log(`======================================================\n`);
        this.logger.log(`[COMPARE] 최종 결과 ${results.filter(item => item !== null).length}개 반환`);
        return results.filter(item => item !== null);
    }
    
    // 6. 비교 견적 상세 정보 조회 (저장용) - (기존 로직 유지)
    async getCompareDetails(trimId: string, optionIds: string[]) {
        const trim: any = await this.trimModel.findById(trimId).lean().exec();
        if (!trim) {
            throw new NotFoundException('Trim Not Found for Comparison');
        }
        
        let selectedOptions: any[] = [];
        if (optionIds && optionIds.length > 0) {
            const validIds = optionIds
                .filter((id) => Types.ObjectId.isValid(id))
                .map((id) => new Types.ObjectId(id));

            if (validIds.length > 0) {
                selectedOptions = await this.optionModel.find({
                    _id: { $in: validIds },
                }).lean().exec();
            }
        }
        
        let modelName = '모델명';
        let makerName = '제조사';
        let imageUrl = '';
        
        const vehicleId = trim.vehicle_id || trim.vehicle;
        if (vehicleId) {
             const vehicle: any = await this.vehicleModel.findById(vehicleId).lean().exec();
             if (vehicle) {
                 modelName = vehicle.model_name || vehicle.name || '';
                 imageUrl = vehicle.image_url || vehicle.image || '';
                 const makerId = vehicle.manufacturer_id || vehicle.manufacturer;
                 if (makerId && Types.ObjectId.isValid(makerId)) {
                     const maker = await this.manufacturerModel.findById(makerId).lean().exec();
                     if (maker) makerName = maker.name;
                 }
             }
        }

        const basePrice = trim.base_price || 0;
        const totalOptionPrice = selectedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0);

        return {
            car: {
                manufacturer: makerName,
                model: modelName,
                trim_name: trim.name,
                base_price: basePrice,
                image_url: imageUrl,
            },
            selectedOptions: selectedOptions.map(opt => ({
                id: opt._id,
                name: opt.name,
                price: opt.price || 0
            })),
            totalOptionPrice,
            finalPrice: basePrice + totalOptionPrice,
        };
    }
}
