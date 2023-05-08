import Router from "express";
import ScheduleController from "./controllers/ScheduleController.js";
import SearchController from "./controllers/SearchController.js";
import UniversityController from "./controllers/UniversityController.js";

const router = new Router();

router.get("/schedule/g/:id", ScheduleController.getSchedule);
router.get("/schedule/t/:id", ScheduleController.getSchedule);
router.get("/schedule/l/:id", ScheduleController.getSchedule);
router.get("/search/:q", SearchController.getSearch);
router.get("/university/:id", UniversityController.getUniversity);

export default router;
