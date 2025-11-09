import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";

export const moviesTable = pgTable("movies", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1024 }).notNull(),
  posterUrl: varchar({ length: 255 }),
  year: integer(),
  day: integer(),
  month: integer(),
  rating: doublePrecision(),
  tmdbId: integer().unique().notNull(),
});

export const favoritesTable = pgTable(
  "favorites",
  {
    userAuth0Id: varchar().notNull(),
    movieId: integer()
      .notNull()
      .references(() => moviesTable.id),
    isActive: boolean().default(true),
    userTake: varchar({ length: 1000 }),
    userRating: integer(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.movieId, table.userAuth0Id] }),
    };
  }
);
