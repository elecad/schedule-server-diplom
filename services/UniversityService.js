import db from "../database/db.js";

class UniversityService {
  async getInfo(id) {
    const query = await db.query(
      `SELECT * FROM university WHERE id=$1 LIMIT 1`,
      [id]
    );
    return query.rows[0];
  }
}

export default new UniversityService();
