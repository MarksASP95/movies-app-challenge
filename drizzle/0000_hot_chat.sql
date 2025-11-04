CREATE TABLE "favorites" (
	"userAuth0Id" varchar NOT NULL,
	"movieId" integer NOT NULL,
	CONSTRAINT "favorites_movieId_userAuth0Id_pk" PRIMARY KEY("movieId","userAuth0Id")
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "movies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"posterUrl" varchar(255),
	"year" integer,
	"day" integer,
	"month" integer,
	"rating" double precision,
	"tmdbId" integer NOT NULL,
	CONSTRAINT "movies_tmdbId_unique" UNIQUE("tmdbId")
);
--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_movieId_movies_id_fk" FOREIGN KEY ("movieId") REFERENCES "public"."movies"("id") ON DELETE no action ON UPDATE no action;