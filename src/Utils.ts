import { Request } from "express";
import pool from "./dbconfig";

const checkIfUserExists = async (req: Request) => {
  const { username } = req.body;
  const users = await pool.query("SELECT * FROM users");
  const result = users.rows;
  const user = result.find((user) => user.username === username);
  return user;
};

export { checkIfUserExists };
