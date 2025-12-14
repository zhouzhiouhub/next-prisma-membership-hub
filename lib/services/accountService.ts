import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  type UpdateProfileInput,
  type ChangePasswordInput,
  type RequestEmailChangeInput,
  type ConfirmEmailChangeInput,
} from "@/lib/utils/accountValidators";
import { generateEmailVerificationCode } from "@/lib/utils/codeGenerator";
import { sendVerificationEmail } from "@/lib/services/emailService";

export async function updateUserProfile(
  email: string,
  input: UpdateProfileInput,
) {
  const data: { name?: string } = {};

  if (typeof input.name === "string") {
    data.name = input.name;
  }

  if (Object.keys(data).length === 0) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        number: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return prisma.user.update({
    where: { email },
    data,
    select: {
      number: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function changeUserPassword(
  email: string,
  input: ChangePasswordInput,
) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const ok = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!ok) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
    },
  });
}

export async function requestEmailChange(
  email: string,
  input: RequestEmailChangeInput,
) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const ok = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!ok) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: input.newEmail },
  });

  if (existingByEmail && existingByEmail.email !== input.newEmail) {
    throw new Error("EMAIL_ALREADY_IN_USE");
  }

  const verificationCode = generateEmailVerificationCode();
  const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      verificationCode,
      verificationExpiresAt,
    },
  });

  await sendVerificationEmail(input.newEmail, verificationCode);
}

export async function confirmEmailChange(
  email: string,
  input: ConfirmEmailChangeInput,
) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.verificationCode) {
    throw new Error("VERIFICATION_NOT_FOUND");
  }

  if (
    user.verificationExpiresAt &&
    user.verificationExpiresAt.getTime() < Date.now()
  ) {
    throw new Error("VERIFICATION_EXPIRED");
  }

  if (user.verificationCode !== input.code) {
    throw new Error("VERIFICATION_CODE_INVALID");
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: input.newEmail },
  });

  if (existingByEmail && existingByEmail.email !== input.newEmail) {
    throw new Error("EMAIL_ALREADY_IN_USE");
  }

  return prisma.user.update({
    where: { email },
    data: {
      email: input.newEmail,
      verificationCode: null,
      verificationExpiresAt: null,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
    select: {
      number: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}


