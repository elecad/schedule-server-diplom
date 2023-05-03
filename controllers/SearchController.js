import validator from "validator";
import SearchService from "../services/SearchService.js";
import ParserSearchService from "../services/ParserSearchService.js";

class SearchController {
  async getSearch(req, res) {
    const validation = validator.isLength(req.params.q, { min: 3 });

    if (!validation) {
      res.status(400).json({ message: "Нужно не менее 3 символов для поиска" });
      return;
    }

    const url = SearchService.getSearchURL(req.params.q);
    const response = await fetch(url);
    const html = await response.text();

    const search = ParserSearchService.parsing(html);

    res.json(search);
  }
}

export default new SearchController();
