import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  type Relation,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity("replies")
export class Reply {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 280 })
  content!: string;

  @Column({ type: "uuid" })
  authorId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "authorId" })
  author!: Relation<User>;

  @Column({ type: "uuid" })
  postId!: string;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "postId" })
  post!: Relation<Post>;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}