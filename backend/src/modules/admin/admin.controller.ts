import { Controller, Get, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UsersService } from '../users/users.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: '[Admin] Dashboard statistics' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: '[Admin] List all users' })
  getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usersService.findAll(page ? +page : 1, limit ? +limit : 20);
  }

  @Get('settings')
  @ApiOperation({ summary: '[Admin] Get brand settings' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: '[Admin] Update brand settings' })
  updateSettings(@Body() body: Record<string, string>) {
    return this.adminService.updateSettings(body);
  }
}
