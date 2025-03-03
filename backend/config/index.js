import dotenv from 'dotenv'
dotenv.config();
dotenv.config({ path: './.env.local' });

export const TOKEN = process.env.TOKEN;
export const DATABASE_ID_PLAYERS = process.env.DATABASE_ID_PLAYERS;
export const DATABASE_ID_TEAMS = process.env.DATABASE_ID_TEAMS;
export const DATABASE_ID_VIDEOS = process.env.DATABASE_ID_VIDEOS;
export const DATABASE_ID_GAMES = process.env.DATABASE_ID_GAMES;