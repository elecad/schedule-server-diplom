import validator from "validator";
import ScheduleService from "../services/ScheduleService.js";
import ParserScheduleService from "../services/ParserScheduleService.js";
import axios from "axios";

class ScheduleController {
  async getSchedule(req, res) {
    // Валидация данных
    const validation =
      validator.isNumeric(req.params.id) &&
      validator.isDate(req.query.to) &&
      validator.isDate(req.query.from);

    if (!validation) {
      res.status(400).json({ message: "Некорректные параметры запроса" });
      return;
    }

    const scheduleType = req.route.path.split("/")[2];

    const url = ScheduleService.getURL(
      req.params.id,
      req.query.to,
      req.query.from,
      scheduleType
    );

    try {
      const response = await axios({
        timeout: 3000,
        method: "get",
        url,
      });
      const html = response.data;
      const schedule = ParserScheduleService.parsing(html);
      res.json(schedule);
      schedule.actual = false;
      ScheduleService.create({
        bsu_id: req.params.id,
        start_date: req.query.to,
        end_date: req.query.from,
        get_date: new Date().toISOString(),
        type_name: scheduleType,
        schedule_json: JSON.stringify(schedule),
      });
    } catch (e) {
      const type_id = await ScheduleService.getTypeID(scheduleType);
      const cache = await ScheduleService.getCache({
        bsu_id: req.params.id,
        start_date: req.query.to,
        end_date: req.query.from,
        type_id,
      });
      if (cache) {
        const json_text = cache.schedule_json;
        const obj = JSON.parse(json_text);
        res.json(obj);
      } else {
        res.sendStatus(404);
      }
    }
  }
}

export default new ScheduleController();
