import { Injectable } from '@nestjs/common';
import { PrismaClient, GuideStatus } from '@prisma/client';

@Injectable()
export class GuidesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: { ownerId: string; title?: string; description?: string }) {
    const title = data.title || `New Guide - ${new Date().toLocaleString()}`;
    return this.prisma.guide.create({
      data: {
        ownerId: data.ownerId,
        title,
        description: data.description,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.guide.findUnique({
      where: { id },
      include: {  
        steps: {
          orderBy: { index: 'asc' },
        },
        owner: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async findByOwner(ownerId: string) {
    return this.prisma.guide.findMany({
      where: { ownerId },
      include: {
        steps: {
          orderBy: { index: 'asc' },
          take: 1,
        },
        _count: {
          select: { steps: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async update(id: string, data: { title?: string; description?: string; status?: GuideStatus; publicSlug?: string }) {
    return this.prisma.guide.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.guide.delete({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.guide.findUnique({
      where: { publicSlug: slug },
      include: {
        steps: {
          orderBy: { index: 'asc' },
        },
        owner: {
          select: { id: true, name: true },
        },
      },
    });
  }
}