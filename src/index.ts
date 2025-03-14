import express, { Express, Request, Response } from "express";
import cors from "cors";
import usersRoute from "./Routes/users";
import dotenv from "dotenv";

dotenv.config();

const { PORT } = process.env;
const app: Express = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use("/users", usersRoute);

app.get("/", (req: Request, res: Response) => res.send("Hello World"));

app.listen(PORT, () => console.log(`Server running on port${PORT}`));
