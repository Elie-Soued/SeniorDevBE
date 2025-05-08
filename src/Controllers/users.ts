import jwt from "jsonwebtoken";
import { type Request, type Response } from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { type user } from "../types";
import db from "../db/databse";
import { addDefaultTasks } from "./tasks";
import { RunResult } from "sqlite3";

dotenv.config();

const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullname, username } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the user already exists
    const user = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err: Error, user: user) => {
          if (err) return reject(err);
          resolve(user);
        }
      );
    });

    if (user) {
      return res.status(409).json({ error: "User already exists" });
    }

    // If user does not exist add it to the database

    const insertedId = await new Promise<number>((resolve, reject) => {
      db.run(
        "INSERT INTO users (username, fullname, password, email) VALUES (?, ?, ?, ?)",
        [username, fullname, hashedPassword, email],
        function (this: RunResult, err: Error | null) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });

    await addDefaultTasks(res, insertedId);

    res.status(200).json({ message: "User registered successfully" });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Check that the username exists in the database
    const user: user = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err: Error, user: user) => {
          if (err) return reject(err);
          resolve(user);
        }
      );
    });

    if (!user) {
      return res.json({ code: 404, message: "Invalid username or password" });
    }

    const passwordIsMatching = await bcrypt.compare(password, user.password);

    // Make sure the password matches
    if (passwordIsMatching) {
      const accessToken = jwt.sign(
        user,
        String(process.env.ACCESS_TOKEN_SECRET)
      );
      res.send({ accessToken, code: 200, user });
    } else {
      res.json({
        code: 401,
        message: "Invalid username or password",
      });
      return;
    }
  } catch (error: unknown) {
    console.error("login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { register, login };
