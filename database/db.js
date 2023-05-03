import pg from "pg";

const Pool = pg.Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "belgu-schedule",
  password: "1969",
  port: 5432,
});

export default pool;
