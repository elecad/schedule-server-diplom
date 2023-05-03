import db from "../database/db.js";

const groupLink =
  "https://bsuedu.ru/bsu/education/schedule/groups/show_schedule.php?group=12001902&week=0304202309042023";
const groupOldLink =
  "https://bsuedu.ru/bsu/education/schedule/groups/show_schedule.php?group=12001902&week=0404202210042022";

const teacherLink =
  "https://bsuedu.ru/bsu/education/schedule/teachers/show_schedule.php?teach=31989&week=1004202316042023";
const teacherOldLink =
  "https://bsuedu.ru/bsu/education/schedule/teachers/show_schedule.php?teach=31989&week=0606202212062022";

const locationLink =
  "https://bsuedu.ru/bsu/education/schedule/auditories/show_schedule.php?aud=5140&week=1704202323042023";

class ScheduleService {
  groupURL = (id, week) =>
    `https://bsuedu.ru/bsu/education/schedule/groups/show_schedule.php?group=${id}&week=${week}`;
  teacherURL = (id, week) =>
    `https://bsuedu.ru/bsu/education/schedule/teachers/show_schedule.php?teach=${id}&week=${week}`;
  locationURL = (id, week) =>
    `https://bsuedu.ru/bsu/education/schedule/auditories/show_schedule.php?aud=${id}&week=${week}`;

  getURL(id, to, from, type) {
    const transformTo = to.split("-").reverse().join("");
    const transformFrom = from.split("-").reverse().join("");
    const week = transformTo + transformFrom;
    let url;
    switch (type) {
      case "g":
        url = this.groupURL(id, week);
        break;
      case "t":
        url = this.teacherURL(id, week);
        break;
      case "l":
        url = this.locationURL(id, week);
        break;
    }
    return url;
  }

  async create({
    start_date,
    end_date,
    schedule_json,
    get_date,
    type_name,
    bsu_id,
  }) {
    const type_id = await this.getTypeID(type_name);

    const cache = await this.getCache({
      start_date,
      end_date,
      bsu_id,
      type_id,
    });
    if (cache) {
      this.updateCache({ id: cache.id, get_date, schedule_json });
    } else {
      this.createCache({
        bsu_id,
        end_date,
        get_date,
        schedule_json,
        start_date,
        type_id,
      });
    }
  }

  async getTypeID(name) {
    const query = await db.query(
      `SELECT id FROM schedule_types WHERE schedule_types.name = $1`,
      [name]
    );

    return query.rows[0].id;
  }

  async getCache({ start_date, end_date, bsu_id, type_id }) {
    const query = await db.query(
      `SELECT id, schedule_json FROM schedule WHERE start_date = $1 AND end_date= $2 AND bsu_id = $3 AND type_id = $4 LIMIT 1`,
      [start_date, end_date, bsu_id, type_id]
    );

    return query.rows[0];
  }

  updateCache({ id, schedule_json, get_date }) {
    const query = db.query(
      "UPDATE schedule SET schedule_json = $1,  get_date = $2 WHERE id = $3;",
      [schedule_json, get_date, id]
    );
  }

  async createCache({
    start_date,
    end_date,
    schedule_json,
    get_date,
    type_id,
    bsu_id,
  }) {
    const university_id = 1;
    const query = await db.query(
      "INSERT INTO schedule (start_date, end_date, schedule_json, get_date, type_id, bsu_id, university_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        start_date,
        end_date,
        schedule_json,
        get_date,
        type_id,
        bsu_id,
        university_id,
      ]
    );
  }
}

export default new ScheduleService();
