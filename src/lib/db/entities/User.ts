import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  type Relation,
} from "typeorm";
import { Post } from "./Post";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 30, unique: true })
  username!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  displayName?: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  avatarUrl?: string | null;

  @Column({ type: "text", nullable: true })
  bio?: string | null;

  @Column({ type: "varchar", length: 20, default: UserRole.USER })
  role!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts!: Relation<Post>[];
}