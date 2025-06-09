import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { Offer } from './offer.entity';

export enum ClickType {
  VIEW = 'view',
  APPLY = 'apply',
}

@Table({
  tableName: 'offer_clicks',
})
export class OfferClick extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @ForeignKey(() => Offer)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  offerId: string;

  @Column({
    type: DataType.ENUM(...Object.values(ClickType)),
    allowNull: false,
  })
  clickType: ClickType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  ipAddress: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  userAgent: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Offer)
  offer: Offer;
}