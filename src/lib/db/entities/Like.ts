import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  type Relation,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity("likes")
@Unique(["userId", "postId"])
export class Like {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: Relation<User>;

  @Column({ type: "uuid" })
  postId!: string;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "postId" })
  post!: Relation<Post>;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}