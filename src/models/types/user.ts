import type { UserRole, UserStatus } from "@/models/enums";

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  status: UserStatus;
}
