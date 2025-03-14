import jwt from "jsonwebtoken";
import { type Request, type Response } from "express";
import pool from "../dbconfig";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { checkIfUserExists } from "../Utils";

dotenv.config();

const register = async (req: Request, res: Response) => {
  const userExists = !!(await checkIfUserExists(req));

  if (userExists) {
    return res.status(409).json({ error: "Username already exists" });
  } else {
    try {
      const { email, password, fullname, username } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const queryString =
        'INSERT INTO "users" (email,password, fullname, username) VALUES ($1, $2, $3, $4) RETURNING *';
      const result = await pool.query(queryString, [
        email,
        hashedPassword,
        fullname,
        username,
      ]);

      res.json({
        code: 200,
        message: "inserted user correctly",
        data: result.rows[0],
      });
    } catch (e) {
      res.status(500).json({
        code: 500,
        message: "Error trying to insert a new user",
      });
    }
  }
};

const login = async (req: Request, res: Response) => {
  const { password } = req.body;
  const user = await checkIfUserExists(req);

  if (user === undefined) {
    res.json({
      code: 404,
      message: "Account does not exist",
    });
    return;
  }

  try {
    const passwordIsMatching = await bcrypt.compare(password, user.password);

    if (passwordIsMatching) {
      const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET);
      res.send({ accessToken });
    } else {
      res.json({
        code: 401,
        message: "Wrong Password",
      });
      return;
    }
  } catch (e) {
    res.status(500).send();
  }
};

const getAll = async (req: Request, res: Response) => {
  try {
    const response = await pool.query("SELECT * FROM users;");
    res.status(200).json(response.rows); // Return all rows
    console.log("Data retrieved:", response.rows);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ error: "An error occurred while fetching users" });
  }
};

export { register, login, getAll };
