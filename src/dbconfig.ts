import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config(); // Ensure this is at the top

const { DBUSER, DBHOST, DBNAME, DBPASS } = process.env;

const pool: Pool = new Pool({
  user: DBUSER,
  host: DBHOST,
  database: DBNAME,
  password: DBPASS,
  port: 5432,
});

export default pool;
