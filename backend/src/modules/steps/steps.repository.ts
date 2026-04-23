import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class StepsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: {
    guideId: string;
    index: number;
    actionType: string;
    selector?: string | null;
    url: string;
    textContent?: string | null;
    inputPreview?: string | null;
    screenshotKey?: string | null;
    title: string;
    description?: string;
    metadata?: any;
  }) {
    return this.prisma.step.create({ data });
  }

  async findById(id: string) {
    return this.prisma.step.findUnique({ where: { id } });
  }

  async findByGuideId(guideId: string) {
    return this.prisma.step.findMany({
      where: { guideId },
      orderBy: { index: 'asc' },
    });
  }

  async getMaxIndex(guideId: string): Promise<number> {
    const result = await this.prisma.step.aggregate({
      where: { guideId },
      _max: { index: true },
    });
    return result._max.index ?? -1;
  }

  async update(id: string, data: { title?: string; description?: string; index?: number }) {
    return this.prisma.step.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.step.delete({ where: { id } });
  }

  async reorder(guideId: string, updates: { id: string; index: number }[]) {
    await this.prisma.$transaction(
      updates.map((u) =>
        this.prisma.step.update({
          where: { id: u.id },
          data: { index: u.index },
        }),
      ),
    );
  }
}