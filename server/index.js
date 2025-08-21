require("dotenv").config();
const app = require("./app");
app.set("trust proxy", 1);
app.use(require("./middleware/cors"));

const PORT = process.env.PORT || 8000; // Koyeb
app.listen(PORT, "0.0.0.0", () => {
  console.log("server listening on port", PORT);
});
