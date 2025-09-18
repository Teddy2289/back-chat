// models/UserModel.ts
import prisma from "../config/prisma";
import { User, UserType, CreateUserRequest, UpdateUserRequest } from "../types";
import bcrypt from "bcrypt";
export class UserModel {
  static async create(userData: CreateUserRequest): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        first_name: userData.first_name,
        last_name: userData.last_name,
        type: (userData.type || "User") as any, // Assertion as any
        is_verified: userData.is_verified || false,
      },
    });

    return user as unknown as User; // Assertion ici
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user as unknown as User | null; // Assertion ici
  }

  static async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user as unknown as User | null; // Assertion ici
  }

  static async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        type: true,
        is_verified: true,
        created_at: true,
        updated_at: true,
      },
    });

    return users as unknown as User[]; // Assertion ici
  }

  static async update(id: number, userData: UpdateUserRequest): Promise<User> {
    const data: any = { ...userData };
    if (userData.type) {
      data.type = userData.type as any; // Assertion ici
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return user as unknown as User; // Assertion ici
  }

  static async search(criteria: {
    email?: string;
    first_name?: string;
    last_name?: string;
    type?: UserType;
    is_verified?: boolean;
  }): Promise<User[]> {
    const where: any = {};

    if (criteria.email) {
      where.email = { contains: criteria.email };
    }

    if (criteria.first_name) {
      where.first_name = { contains: criteria.first_name };
    }

    if (criteria.last_name) {
      where.last_name = { contains: criteria.last_name };
    }

    if (criteria.type) {
      where.type = criteria.type as any; // Assertion ici
    }

    if (criteria.is_verified !== undefined) {
      where.is_verified = criteria.is_verified;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        type: true,
        is_verified: true,
        created_at: true,
        updated_at: true,
      },
    });

    return users as unknown as User[];
  }

  // Les méthodes suivantes n'ont pas besoin de changement
  static async updateVerificationStatus(
    id: number,
    isVerified: boolean
  ): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { is_verified: isVerified },
    });
  }

  static async delete(id: number): Promise<boolean> {
    const result = await prisma.user.delete({
      where: { id },
    });
    return result !== null;
  }
}
