import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import corsOptions from "./lib/corsOptions.js";
import { authRouter } from "./routes/auth.js";
import { workspacesRouter } from "./routes/workspaces.js";
import { collectionsRouter } from "./routes/collections.js";
import { collectionRequestRouter } from "./routes/collectionRequests.js";
import { environmentsRouter } from "./routes/environments.js";
import { workspaceRequestsRouter } from "./routes/requests.js";
import { proxyRouter } from "./routes/proxy.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/workspaces", workspacesRouter);
app.use("/api/v1", collectionsRouter);
app.use("/api/v1", collectionRequestRouter);
app.use("/api/v1", environmentsRouter);
app.use("/api/v1", workspaceRequestsRouter);
app.use("/api/v1/proxy", proxyRouter);

app.use(errorHandler);
export { app };
