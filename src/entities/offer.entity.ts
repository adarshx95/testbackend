import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript';
import { OfferClick } from './offer-click.entity';

export enum OfferStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Table({
  tableName: 'offers',
})
export class Offer extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  bankName: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  bonusAmount: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  requirements: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  applicationUrl: string;

  @Column({
    type: DataType.ENUM(...Object.values(OfferStatus)),
    defaultValue: OfferStatus.ACTIVE,
  })
  status: OfferStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiryDate: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  clickCount: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  applicationCount: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @HasMany(() => OfferClick)
  offerClicks: OfferClick[];
}