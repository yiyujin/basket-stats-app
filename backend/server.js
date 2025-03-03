import express from "express";
import cors from "cors";
import { Client } from "@notionhq/client";

import { TOKEN, DATABASE_ID_PLAYERS, DATABASE_ID_TEAMS, DATABASE_ID_VIDEOS, DATABASE_ID_GAMES } from './config/index.js';

const app = express();
const PORT = 8000;

app.use(express.static('html'));
app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

//GET TEAMS - Query a database
export async function queryADatabaseTeams() {
    const notion = new Client({ auth: TOKEN });
  
    const response = await notion.databases.query({
      database_id: DATABASE_ID_TEAMS,
    });
  
    return response.results;
  }
  
  app.post("/api/query-a-database-teams", async (req, res) => {
    try {
      const results = await queryADatabaseTeams();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });