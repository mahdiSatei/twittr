import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from "typeorm";
import { User } from "./User";

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 280 })
  content!: string;

  @Column({ type: "uuid" })
  authorId!: string;

  // استفاده از تابعی (() => User) همراه با Relation<> مشکل وابستگی چرخه‌ای را کامل حل می‌کند
  @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "authorId" })
  author!: Relation<User>;

  @Index()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}