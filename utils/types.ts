export type Game = {
  id: number;
  game_name: string;
  genre: string;
  pacing: string;
  setting: string;
  business_model: string;
  media_type: string;
  maturity_rating: string;
  moby_score: number;
  critics_rating: number;
  player_rating: number;
  player_count: number;
  perspective: string;
  interface: string;
  director: string;
};

export type developer = {
    ID: number,
    name: string
}

export type gameDeveloper = {
    gameID: number,
    developerID: number
}

export type gameInputDevices = {
    gameID: number,
    input_device: string
}

export type gamePublisher = {
    gameID: number,
    publisherID: number
}

export type gameReleaseDates = {
    gameID: number,
    platformName: string,
    releaseDate: string
}

export type publisher = {
    ID: number,
    name: string
}

export type userRating = {
    userID: string,
    gameID: number,
    rating: number
}