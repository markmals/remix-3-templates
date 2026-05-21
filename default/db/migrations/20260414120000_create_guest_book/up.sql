CREATE TABLE IF NOT EXISTS "guest_book" (
    "id" integer,
    "name" text NOT NULL,
    "message" text NOT NULL,
    "createdAt" text DEFAULT current_timestamp,
    CONSTRAINT "guest_book_pk" PRIMARY KEY ("id")
);
