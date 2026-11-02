import type { getAdminUser, listAdminUsers, listUserReports } from "@/api/admin/users";
import type { Jsonify } from "@/models/types/admin";

export type UserList = Jsonify<Awaited<ReturnType<typeof listAdminUsers>>>;
export type UserRow = UserList["data"][number];
export type UserDetail = Jsonify<Awaited<ReturnType<typeof getAdminUser>>>;
export type UserReports = Jsonify<Awaited<ReturnType<typeof listUserReports>>>;
