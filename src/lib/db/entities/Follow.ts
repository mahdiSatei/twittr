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

@Entity("follows")
@Unique(["followerId", "followingId"])
export class Follow {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  followerId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "followerId" })
  follower!: Relation<User>;

  @Column({ type: "uuid" })
  followingId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "followingId" })
  following!: Relation<User>;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}