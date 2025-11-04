import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

type UserCreate = typeof usersTable.$inferInsert;
export class UserService {
  createUser(userCreate: UserCreate) {
    return db.insert(usersTable).values(userCreate).onConflictDoNothing();
  }

  getFavorites(uesrId: string) {

  }
}
