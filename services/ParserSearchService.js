import jsdom from "jsdom";
const { JSDOM } = jsdom;

class ParserSearchService {
  parsing(html) {
    const { document } = new JSDOM(html).window;
    const nodes = document.querySelectorAll(".typo-page > h2, table.search");

    const result = [];
    let type = "";

    if (nodes.length) {
      for (const node of nodes) {
        if (node.className) {
          // если список с результатом
          const table = node;

          let length = table.rows.length;

          if (length > 5) length = 5;

          for (let i = 0; i < length; i++) {
            const row = table.rows[i];
            const column = row.cells[0];
            const a = column.querySelector("a");
            const status = column.querySelector("small").textContent;
            let name = a.textContent;
            const id = a.href.split("=")[1] ?? "";
            name = this.capitalizeFirstLetter(status) + " " + name;
            result.push({
              id,
              name,
              type,
            });
          }
        } else {
          // если заголовок поиска
          const stringType = node.textContent.split(",")[0];
          switch (stringType) {
            case "Группы":
              type = "g";
              break;
            case "Преподаватели":
              type = "t";
              break;
            case "Аудитории":
              type = "l";
              break;
            default:
              throw Error("Неизвестный тип поисковых данных");
          }
        }
      }
    }
    return result;
  }
  capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default new ParserSearchService();
