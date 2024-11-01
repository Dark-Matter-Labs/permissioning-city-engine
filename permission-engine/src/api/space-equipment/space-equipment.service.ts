import { Injectable } from '@nestjs/common';
import {
  CreateSpaceEquipmentDto,
  FindAllSpaceEquipmentDto,
  UpdateSpaceEquipmentDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SpaceEquipment } from 'src/database/entity/space-equipment.entity';

@Injectable()
export class SpaceEquipmentService {
  constructor(
    @InjectRepository(SpaceEquipment)
    private spaceEquipmentRepository: Repository<SpaceEquipment>,
  ) {}

  async findAll(
    findAllSpaceEquipmentDto: FindAllSpaceEquipmentDto,
  ): Promise<{ data: SpaceEquipment[]; total: number }> {
    const { page, limit, spaceId, types, isActive } = findAllSpaceEquipmentDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;

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

    const whereClause = where.length > 0 ? 'WHERE' : '';
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
        ${whereClause} ${where.join(' AND ')}
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data
      LIMIT $2 OFFSET $1;
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
