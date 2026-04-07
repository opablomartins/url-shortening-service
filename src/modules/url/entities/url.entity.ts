import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('urls')
export class Url {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'https://www.example.com/some/very/long/path' })
  @Column({ name: 'original_url', type: 'text' })
  originalUrl: string;

  @ApiProperty({ example: 'xK9mNp' })
  @Column({ name: 'short_code', type: 'varchar', length: 10, unique: true })
  shortCode: string;

  @ApiProperty({ example: 42 })
  @Column({ name: 'access_count', type: 'int', default: 0 })
  accessCount: number;

  @ApiProperty({ example: '2026-04-07T12:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-07T13:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
