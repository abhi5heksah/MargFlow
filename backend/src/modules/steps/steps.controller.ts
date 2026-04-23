import { Controller, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { StepsService } from './steps.service';
import { CreateStepDto, UpdateStepDto, ReorderStepsDto } from './dto/step.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('steps')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Post('guides/:guideId/steps')
  @ApiOperation({ summary: 'Create a new step for a guide' })
  create(@Param('guideId') guideId: string, @Body() dto: CreateStepDto) {
    return this.stepsService.create(guideId, dto);
  }

  @Patch('steps/:stepId')
  @ApiOperation({ summary: 'Update a step' })
  update(@Param('stepId') stepId: string, @Body() dto: UpdateStepDto) {
    return this.stepsService.update(stepId, dto);
  }

  @Delete('steps/:stepId')
  @ApiOperation({ summary: 'Delete a step' })
  delete(@Param('stepId') stepId: string) {
    return this.stepsService.delete(stepId);
  }

  @Patch('guides/:guideId/reorder-steps')
  @ApiOperation({ summary: 'Reorder steps in a guide' })
  reorder(@Param('guideId') guideId: string, @Body() dto: ReorderStepsDto) {
    return this.stepsService.reorder(guideId, dto.updates);
  }
}