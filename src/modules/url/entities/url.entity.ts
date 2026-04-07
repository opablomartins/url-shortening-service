import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('urls')
export class Url {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_url', type: 'text' })
  originalUrl: string;

  @Column({ name: 'short_code', type: 'varchar', length: 10, unique: true })
  shortCode: string;

  @Column({ name: 'access_count', type: 'int', default: 0 })
  accessCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
