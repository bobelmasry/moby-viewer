-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.developer (
  ID bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  CONSTRAINT developer_pkey PRIMARY KEY (ID)
);
CREATE TABLE public.game (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  game_name text NOT NULL,
  genre text,
  pacing text,
  setting text,
  business_model text,
  media_type text,
  maturity_rating text,
  player_rating real,
  player_count bigint,
  perspective text,
  interface text,
  director text,
  critics_rating text,
  moby_score real,
  CONSTRAINT game_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gameDeveloper (
  gameID bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  developerID bigint NOT NULL,
  CONSTRAINT gameDeveloper_pkey PRIMARY KEY (gameID, developerID),
  CONSTRAINT gameDeveloper_developerID_fkey FOREIGN KEY (developerID) REFERENCES public.developer(ID),
  CONSTRAINT gameDeveloper_gameID_fkey FOREIGN KEY (gameID) REFERENCES public.game(id)
);
CREATE TABLE public.gameInputDevices (
  gameID bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  input_device text NOT NULL,
  CONSTRAINT gameInputDevices_pkey PRIMARY KEY (gameID, input_device),
  CONSTRAINT gameInputDevices_gameID_fkey FOREIGN KEY (gameID) REFERENCES public.game(id)
);
CREATE TABLE public.gamePublisher (
  gameID bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  publisherID bigint NOT NULL,
  CONSTRAINT gamePublisher_pkey PRIMARY KEY (gameID, publisherID),
  CONSTRAINT gamePublisher_gameID_fkey FOREIGN KEY (gameID) REFERENCES public.game(id),
  CONSTRAINT gamePublisher_publisherID_fkey FOREIGN KEY (publisherID) REFERENCES public.publisher(ID)
);
CREATE TABLE public.gameReleaseDates (
  gameID bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  platformName text NOT NULL,
  releaseDate date NOT NULL,
  CONSTRAINT gameReleaseDates_pkey PRIMARY KEY (gameID, platformName),
  CONSTRAINT gameReleaseDates_gameID_fkey FOREIGN KEY (gameID) REFERENCES public.game(id)
);
CREATE TABLE public.publisher (
  ID bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  CONSTRAINT publisher_pkey PRIMARY KEY (ID)
);
CREATE TABLE public.userRating (
  userID uuid NOT NULL,
  gameID bigint NOT NULL,
  rating integer,
  CONSTRAINT userRating_pkey PRIMARY KEY (userID, gameID),
  CONSTRAINT userRating_gameID_fkey FOREIGN KEY (gameID) REFERENCES public.game(id),
  CONSTRAINT userRating_userID_fkey FOREIGN KEY (userID) REFERENCES auth.users(id)
);