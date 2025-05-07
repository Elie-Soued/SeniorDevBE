import express from "express";
import {
  getAllTasks,
  authenticateToken,
  addTask,
  deleteTask,
} from "../Controllers/tasks";

const router = express.Router();

router.get("/", authenticateToken, getAllTasks);
router.post("/", authenticateToken, addTask);
router.delete("/:id", authenticateToken, deleteTask);

export default router;
