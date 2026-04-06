import { app } from "./app.js";

(() => {
  try {
    app.listen(process.env.PORT, () => {
      console.log("Server on port: ", process.env.PORT);
      console.log(`URL: http://localhost:${process.env.port}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
    process.exit(1);
  }
})();
