import { NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import db from "../db/databse";
import dotenv from "dotenv";

dotenv.config();

const getAllTasks = async (req: Request, res: Response) => {
  try {
    const { id } = req.body.user;
    const tasks = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM tasks WHERE userID = ?",
        [id],
        (err: Error, tasks: any) => {
          if (err) return reject(err);
          resolve(tasks);
        }
      );
    });

    if (!tasks) {
      return res.send({ tasks: [] });
    }

    res.send({ tasks });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.body.user;
    const { newTask } = req.body;
    await db.run("INSERT INTO tasks (content, userID) VALUES (?, ?)", [
      newTask,
      id,
    ]);

    const tasks = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM tasks WHERE userID = ?",
        [id],
        (err: Error, tasks: any) => {
          if (err) return reject(err);
          resolve(tasks);
        }
      );
    });

    if (!tasks) {
      return res.send({ tasks: [] });
    }

    res.send({ tasks });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401);
  jwt.verify(
    token,
    String(process.env.ACCESS_TOKEN_SECRET),
    (err: Error | null, decoder) => {
      if (err) {
        console.log("err :>> ", err);
        return res.status(403);
      }
      req.body.user = decoder;

      next();
    }
  );
};

const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userID = req.body.user.id;

    await db.run("DELETE from tasks WHERE id = (?) AND userID = (?)", [
      id,
      userID,
    ]);

    const tasks = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM tasks WHERE userID = ?",
        [userID],
        (err: Error, tasks: any) => {
          if (err) return reject(err);
          resolve(tasks);
        }
      );
    });

    if (!tasks) {
      return res.send({ tasks: [] });
    }

    res.send({ tasks });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userID = req.body.user.id;
    const content = req.body.updatedTask;

    await db.run(
      "UPDATE tasks SET content = (?) WHERE id = (?) AND userID = (?)",
      [content, id, userID]
    );

    const tasks = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM tasks WHERE userID = ?",
        [userID],
        (err: Error, tasks: any) => {
          if (err) return reject(err);
          resolve(tasks);
        }
      );
    });

    if (!tasks) {
      return res.send({ tasks: [] });
    }

    res.send({ tasks });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { getAllTasks, authenticateToken, addTask, deleteTask, updateTask };
