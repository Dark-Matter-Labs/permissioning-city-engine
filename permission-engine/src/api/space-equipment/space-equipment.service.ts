import { Injectable } from '@nestjs/common';
import {
  CreateSpaceEquipmentDto,
  FindAllSpaceEquipmentDto,
  FindAllSpaceFacilityDto,
  UpdateSpaceEquipmentDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SpaceEquipment } from 'src/database/entity/space-equipment.entity';
import { SpaceEquipmentType } from 'src/lib/type';

@Injectable()
export class SpaceEquipmentService {
  constructor(
    @InjectRepository(SpaceEquipment)
    private spaceEquipmentRepository: Repository<SpaceEquipment>,
  ) {}

  async findAllEquipment(
    findAllSpaceEquipmentDto: FindAllSpaceEquipmentDto,
  ): Promise<{ data: SpaceEquipment[]; total: number }> {
    const { page, limit, spaceId, types, isActive } = findAllSpaceEquipmentDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;

    paramIndex++;
    where.push(`type != $${paramIndex}`);
    params.push(SpaceEquipmentType.facility);

    if (spaceId != null) {
      paramIndex++;
      where.push(`space_id = $${paramIndex}`);
      params.push(spaceId);
    }

    if (isActive != null) {
      paramIndex++;
      where.push(`is_active = $${paramIndex}`);
      params.push(isActive);
    }

    if (types != null) {
      paramIndex++;
      where.push(`type = ANY($${paramIndex})`);
      params.push(types);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
          id,
          space_id,
          name,
          type,
          quantity,
          details,
          is_active,
          created_at,
          updated_at
        ) FROM space_equipment
        WHERE 
          ${where.join(' AND ')}
      ),
      paginated_data AS (
        SELECT * FROM filtered_data
        LIMIT $2 OFFSET $1
      )
      SELECT 
        (SELECT COUNT(*) FROM filtered_data) AS total,
        json_agg(paginated_data) AS data
      FROM paginated_data;
    `;

    const [{ data, total }] = await this.spaceEquipmentRepository.query(
      query,
      params,
    );

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        return {
          id: item.row.f1,
          spaceId: item.row.f2,
          name: item.row.f3,
          type: item.row.f4,
          quantity: item.row.f5,
          details: item.row.f6,
          isActive: item.row.f7,
          createdAt: item.row.f8,
          updatedAt: item.row.f9,
        };
      });
    }
    return {
      data: result,
      total: parseInt(total),
    };
  }

  async findAllFacility(
    findAllSpaceFacilityDto: FindAllSpaceFacilityDto,
  ): Promise<{ data: SpaceEquipment[]; total: number }> {
    const { page, limit, spaceId, isActive } = findAllSpaceFacilityDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;

    paramIndex++;
    where.push(`type = $${paramIndex}`);
    params.push(SpaceEquipmentType.facility);

    if (spaceId != null) {
      paramIndex++;
      where.push(`space_id = $${paramIndex}`);
      params.push(spaceId);
    }

    if (isActive != null) {
      paramIndex++;
      where.push(`is_active = $${paramIndex}`);
      params.push(isActive);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
          id,
          space_id,
          name,
          type,
          quantity,
          details,
          is_active,
          created_at,
          updated_at
        ) FROM space_equipment
        WHERE 
          ${where.join(' AND ')}
      ),
      paginated_data AS (
        SELECT * FROM filtered_data
        LIMIT $2 OFFSET $1
      )
      SELECT 
        (SELECT COUNT(*) FROM filtered_data) AS total,
        json_agg(paginated_data) AS data
      FROM paginated_data;
    `;

    const [{ data, total }] = await this.spaceEquipmentRepository.query(
      query,
      params,
    );

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        return {
          id: item.row.f1,
          spaceId: item.row.f2,
          name: item.row.f3,
          type: item.row.f4,
          quantity: item.row.f5,
          details: item.row.f6,
          isActive: item.row.f7,
          createdAt: item.row.f8,
          updatedAt: item.row.f9,
        };
      });
    }
    return {
      data: result,
      total: parseInt(total),
    };
  }

  findOneById(id: string): Promise<SpaceEquipment> {
    return this.spaceEquipmentRepository.findOne({
      where: { id },
      relations: ['space'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.spaceEquipmentRepository.delete(id);
  }

  create(
    createSpaceEquipmentDto: CreateSpaceEquipmentDto,
  ): Promise<SpaceEquipment> {
    const spaceEquipment = this.spaceEquipmentRepository.create({
      ...createSpaceEquipmentDto,
      id: uuidv4(),
    });

    return this.spaceEquipmentRepository.save(spaceEquipment);
  }

  async update(
    id: string,
    updateSpaceEquipmentDto: UpdateSpaceEquipmentDto,
  ): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.spaceEquipmentRepository.update(id, {
      ...updateSpaceEquipmentDto,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }
}
