/** Mirror of Prisma enums for use in client code and Zod without importing @prisma/client */

export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const StoryStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type StoryStatus = (typeof StoryStatus)[keyof typeof StoryStatus];

export const ReportStatus = {
  OPEN: "OPEN",
  RESOLVED: "RESOLVED",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const ReportReason = {
  FALSE_INFO: "FALSE_INFO",
  INAPPROPRIATE: "INAPPROPRIATE",
  COPYRIGHT: "COPYRIGHT",
  PRIVACY: "PRIVACY",
  SPAM: "SPAM",
  OTHER: "OTHER",
} as const;
export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason];
