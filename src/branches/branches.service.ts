import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) { }

  private createResponse(message: string, data: any = null) {
    return { message, data };
  }

  async create(createBranchDto: CreateBranchDto) {
    try {
      const newBranch = await this.prisma.branch.create({ data: createBranchDto });
      return this.createResponse('Branch created successfully', newBranch);
    } catch (error) {
      throw new Error('Error creating branch: ' + error.message);
    }
  }

  async findAll() {
    try {
      const branches = await this.prisma.branch.findMany();
      return this.createResponse('Branches retrieved successfully', branches);
    } catch (error) {
      throw new Error('Error retrieving branches: ' + error.message);
    }
  }

  async findOne(id: number) {
    try {
      const branch = await this.prisma.branch.findUnique({ where: { id } });
      if (!branch) {
        return this.createResponse('Branch not found');
      }
      return this.createResponse('Branch retrieved successfully', branch);
    } catch (error) {
      throw new Error('Error retrieving branch: ' + error.message);
    }
  }

  async update(id: number, updateBranchDto: UpdateBranchDto) {
    try {
      const existingBranch = await this.prisma.branch.findUnique({ where: { id } });
      if (!existingBranch) {
        return this.createResponse('Branch not found');
      }

      const updatedBranch = await this.prisma.branch.update({
        where: { id },
        data: updateBranchDto,
      });
      return this.createResponse('Branch updated successfully', updatedBranch);
    } catch (error) {
      throw new Error('Error updating branch: ' + error.message);
    }
  }

  async remove(id: number) {
    try {
      const existingBranch = await this.prisma.branch.findUnique({ where: { id } });
      if (!existingBranch) {
        return this.createResponse('Branch not found');
      }

      const deletedBranch = await this.prisma.branch.delete({ where: { id } });
      return this.createResponse('Branch deleted successfully', deletedBranch);
    } catch (error) {
      throw new Error('Error deleting branch: ' + error.message);
    }
  }
}
