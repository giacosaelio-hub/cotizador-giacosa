import path from "path";
import app from "./app";

const PORT = Number(process.env["PORT"]) || 3000;

if (Number.isNaN(PORT) || PORT <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`  API:    http://localhost:${PORT}/api`);
  if (process.env.NODE_ENV === "production") {
    console.log(`  Client: http://localhost:${PORT}/`);
  }
});
