import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GuideStatus } from '@prisma/client';
import { GuidesRepository } from './guides.repository';
import { StepsService } from '../steps/steps.service';

@Injectable()
export class GuidesService {
  constructor(
    private readonly guidesRepository: GuidesRepository,
    private readonly stepsService: StepsService,
  ) {}

  async create(ownerId: string, data: { title?: string; description?: string }) {
    return this.guidesRepository.create({ ownerId, ...data });
  }

  async findById(id: string, userId?: string) {
    const guide = await this.guidesRepository.findById(id);
    if (!guide) {
      throw new NotFoundException('Guide not found');
    }
    if (guide.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this guide');
    }
    return guide;
  }

  async findByOwner(ownerId: string) {
    return this.guidesRepository.findByOwner(ownerId);
  }

  async update(id: string, userId: string, data: { title?: string; description?: string; status?: GuideStatus; publicSlug?: string }) {
    const guide = await this.findById(id, userId);
    if (data.status === 'PUBLISHED' && !guide.publicSlug) {
      data.publicSlug = this.generateSlug();
    }
    return this.guidesRepository.update(id, data);
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    return this.guidesRepository.delete(id);
  }

  async findBySlug(slug: string) {
    const guide = await this.guidesRepository.findBySlug(slug);
    if (!guide || guide.status !== 'PUBLISHED') {
      throw new NotFoundException('Published guide not found');
    }
    return guide;
  }

  private generateSlug(): string {
    return `guide-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}