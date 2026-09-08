import { prisma } from "../../db/prisma";

export function getUserById(id: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}
