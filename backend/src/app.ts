import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import corsOptions from "./lib/corsOptions.js";
import { authRouter } from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);

app.use(errorHandler);
export { app };
