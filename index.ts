import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./src/routes/index.routes";
import mongoose from "mongoose";
import { handleGlobalError } from "./src/utils/globalErrorHandler";
import { initPinecone } from "./src/services/pinecone.services";
import { scheduleDailyUpdates } from "./src/services/football/dailyUpdate.service";
import webhookRoutes from "./src/routes/webhook.routes";
import { startDiscordBot } from "./src/bot/discordBot"
dotenv.config();

// import "./src/crons";
// double-step cron is not needed in queue
import "./src/lib/agenda.services";
// import { removeAbsentStripeCustomerId, removeAbsentStripeSubscription } from "./src/lib/stripe";

const app: Express = express();
const port = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "No mongo connection string. Set MONGODB_URI environment variable."
  );
}

//Schedule daily updates in API sport
// scheduleDailyUpdates();

const initMongo = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");
  } catch (error) {
    console.log(`Could not connect to DB: ${error}`);
  }
};

const initServer = async () => {
  try {
    await initMongo();
    // await initPinecone()
    app.use("/api/webhook", webhookRoutes);
    app.use(express.json());
    app.use(
      cors({
        origin: "*",
        exposedHeaders: "location",
      })
    );
    app.use(routes);
    app.use(handleGlobalError);

    const server = app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });

    process.on("SIGTERM", () => {
      console.debug("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.debug("HTTP server closed");
      });
    });

    // await removeAbsentStripeCustomerId();
    // await removeAbsentStripeSubscription();
    const userId = 'db079464-978c-41fe-9054-523631b158cf'; // Replace with actual user ID
    startDiscordBot(userId);
    

  } catch (error) {
    console.log(`Could not start server: ${error}`);
  }
};

initServer();
