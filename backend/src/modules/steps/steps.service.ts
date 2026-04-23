import { Injectable, NotFoundException } from '@nestjs/common';
import { StepsRepository } from './steps.repository';

@Injectable()
export class StepsService {
  constructor(private readonly stepsRepository: StepsRepository) {}

  async create(guideId: string, data: {
    actionType: string;
    selector?: string | null;
    url: string;
    textContent?: string | null;
    inputPreview?: string | null;
    screenshotKey?: string | null;
    title?: string;
    description?: string;
    metadata?: any;
  }) {
    const maxIndex = await this.stepsRepository.getMaxIndex(guideId);
    return this.stepsRepository.create({
      guideId,
      index: maxIndex + 1,
      ...data,
      title: data.title || `Step ${maxIndex + 1}`,
    });
  }

  async update(id: string, data: { title?: string; description?: string; index?: number }) {
    const step = await this.stepsRepository.findById(id);
    if (!step) {
      throw new NotFoundException('Step not found');
    }
    return this.stepsRepository.update(id, data);
  }

  async delete(id: string) {
    const step = await this.stepsRepository.findById(id);
    if (!step) {
      throw new NotFoundException('Step not found');
    }
    return this.stepsRepository.delete(id);
  }

  async reorder(guideId: string, updates: { id: string; index: number }[]) {
    return this.stepsRepository.reorder(guideId, updates);
  }
}