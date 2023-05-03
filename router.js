import Router from "express";
import ScheduleController from "./controllers/ScheduleController.js";
import SearchController from "./controllers/SearchController.js";

const router = new Router();

router.get("/schedule/g/:id", ScheduleController.getSchedule);
router.get("/schedule/t/:id", ScheduleController.getSchedule);
router.get("/schedule/l/:id", ScheduleController.getSchedule);
router.get("/search/:q", SearchController.getSearch);

export default router;
