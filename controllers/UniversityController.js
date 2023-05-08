import validator from "validator";
import UniversityService from "../services/UniversityService.js";

class UninersityController {
  async getUniversity(req, res) {
    const validation = validator.isNumeric(req.params.id);

    if (!validation) {
      res.status(400).json({ message: "Некорректные параметры запроса" });
      return;
    }

    const university = await UniversityService.getInfo(req.params.id);

    res.json(university);
  }
}

export default new UninersityController();
