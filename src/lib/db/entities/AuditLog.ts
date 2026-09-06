import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from "typeorm";
import { User } from "./User";

export enum AuditAction {
  USER_REGISTER = "USER_REGISTER",
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  POST_CREATE = "POST_CREATE",
  POST_UPDATE = "POST_UPDATE",
  POST_DELETE = "POST_DELETE",
  PROFILE_UPDATE = "PROFILE_UPDATE",
  AVATAR_UPLOAD = "AVATAR_UPLOAD",
}

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "varchar", length: 50 })
  action!: string;

  @Column({ type: "varchar", length: 50 })
  targetType!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  targetId?: string | null;

  @Column({ type: "uuid", nullable: true })
  userId?: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "userId" })
  user?: Relation<User> | null;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any> | null;

  @Index()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}