class SearchService {
  getSearchURL = (q) =>
    `https://bsuedu.ru/bsu/education/schedule/search/index.php?query=${q}`;
}

export default new SearchService();
