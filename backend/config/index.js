import dotenv from 'dotenv'
dotenv.config();
dotenv.config({ path: './.env.local' });

export const TOKEN = process.env.TOKEN;
export const DATABASE_ID_PLAYERS = process.env.DATABASE_ID_PLAYERS;
export const DATABASE_ID_TEAMS = process.env.DATABASE_ID_TEAMS;
export const DATABASE_ID_VIDEOS = process.env.DATABASE_ID_VIDEOS;
export const DATABASE_ID_GAMES = process.env.DATABASE_ID_GAMES;
export const DATABASE_ID_SPORTS = process.env.DATABASE_ID_SPORTS;
export const DATABASE_ID_POSITIONS = process.env.DATABASE_ID_POSITIONS;

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const AWS_REGION = process.env.AWS_REGION;
export const AWS_BUCKET_NAME= process.env.AWS_BUCKET_NAME;