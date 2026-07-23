require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");
const createAdmin = require("./utils/createAdmin");

const PORT = process.env.PORT || 5000;
const startMaturityScheduler =
  require("./jobs/maturityScheduler");

connectDatabase()
  .then(async () => {
    console.log("MongoDB connected");

    await createAdmin();

    startMaturityScheduler();

    app.listen(PORT, () => {
      console.log(
        `Server Running On Port ${PORT}`,
      );
    });
  })
  .catch((err) => {
    console.error(
      "Database Connection Failed:",
      err,
    );
  });