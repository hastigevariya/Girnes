"use strict";
import express, { json, urlencoded } from "express";
import cors from "cors";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const router = await import("./src/router/index.js");
import connectDB from "./db/dbconnect.js";
const dotenv = await import("dotenv");
dotenv.config();
import { languageMiddleware, setCurrency } from "./src/middeleware/auth.js";

const port = process.env.PORT || 4001;
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use(languageMiddleware);
app.use(setCurrency);
app.use("/api", router.default);

app.use(express.static(join(__dirname, "public")));

app.get("/start", (req, res) => {
  res.send(`<h1>Hello Girnes<h1/>`);
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});
