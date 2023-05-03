import jsdom from "jsdom";
const { JSDOM } = jsdom;

class ParserScheduleService {
  parsing(html) {
    const { document } = new JSDOM(html).window;

    const tables = document.querySelectorAll("table");

    if (!tables.length) throw Error("Отсутствие таблиц в ответе сайта");

    const headerTable = tables[0];
    const scheduleTable = tables[1];

    const result = {
      actual: false,
      timeReceiving: 0,
      header: headerTable.querySelector("#h2").textContent,
      schedule: [],
    };

    for (const row of scheduleTable.rows) {
      switch (row.cells.length) {
        case 1:
          this.parseDayHeader(row, result);
          break;
        case 4:
          this.parseLesson(row, false, result);
          break;
        case 6:
          this.parseLesson(row, true, result);
          break;
        default:
          throw Error("Необработанное число столбцов в таблице");
      }
    }
    result.actual = true;
    result.timeReceiving = +new Date();
    return result;
  }

  parseDayHeader(row, result) {
    const headerArray = row.textContent.trim().split(" ");
    const dateString = headerArray[0];
    const dayWeekName = headerArray[1];
    result.schedule.push({
      name: dayWeekName,
      date: dateString,
      pairs: [],
    });
  }

  parseLesson(row, isFullLesson, result) {
    const pair = {
      number: 0,
      times: {
        start: 0,
        end: 0,
      },
      lessons: [],
    };
    const lesson = {
      discipline: "",
      types: [],
      characteristics: [],
      courses: [],
    };
    const currentDay = result.schedule[result.schedule.length - 1];
    for (const tr of row.cells) {
      switch (tr.id) {
        case "num":
          this.parseNumber(tr, pair);
          break;
        case "time":
          this.parseTime(tr, currentDay.date, pair);
          break;
        case "lesson":
          if (tr.width == "1%") {
            // тип занятия
            this.parseType(tr, lesson);
          } else {
            // занятие
            this.parseDiscipline(tr, lesson);
            this.parseCourse(tr, lesson);
          }
          break;
        case "teacher":
          this.parseTeacher(tr, lesson);
          break;
        case "aud":
          this.parseLocation(tr, lesson);
          break;
        case "group":
          this.parseGroup(tr, lesson);
          break;
        default:
          throw Error(`Необработанный id элемента: ${tr.outerHTML}`);
      }
    }
    if (isFullLesson) {
      pair.lessons.push(lesson);
      currentDay.pairs.push(pair);
    } else {
      currentDay.pairs[currentDay.pairs.length - 1].lessons.push(lesson);
    }
  }

  parseNumber(tr, pair) {
    const numString = tr.textContent.trim().split(" ")[0];
    pair.number = Number(numString);
  }

  parseTime(tr, currentDate, pair) {
    const times = tr.textContent
      .trim()
      .split("-")
      .map((t) => t.trim());

    const startString = times[0];
    const endString = times[1];

    pair.times.start = this.toISO8601({ time: startString, date: currentDate });
    pair.times.end = this.toISO8601({ time: endString, date: currentDate });
  }

  toISO8601({ time, date }) {
    const ds = date.split(".");
    const [day, month, year] = ds;
    return +new Date(
      `${year}-${month}-${day}T${time.length == 5 ? time : "0" + time}+03:00`
    );
  }

  parseType(tr, lesson) {
    lesson.types.push(tr.textContent.trim());
  }

  parseDiscipline(tr, lesson) {
    lesson.discipline = tr.textContent.trim().replace(/ +/g, " ");
  }

  parseCourse(tr, lesson) {
    const mainCourse = tr.querySelector("#lesson > a");
    if (mainCourse) {
      lesson.courses.push({ name: "В курс", link: mainCourse.href });
    }
    const optionallyCourse = tr.querySelectorAll("#lesson > small > a");
    for (let el of optionallyCourse) {
      lesson.courses.push({ name: el.textContent, link: el.href });
    }
  }

  parseTeacher(tr, lesson) {
    const teacherLink = tr.querySelector("a");
    // если есть преподаватель
    if (teacherLink.textContent) {
      const fullName = teacherLink.textContent.trim();
      const status = tr.querySelector("small").textContent.trim();
      const id = teacherLink.href.split("=")[1];
      const promt = tr.querySelector("img").title.trim();
      lesson.characteristics.push({
        type: "t",
        id: id,
        text: status + " " + fullName,
        info: promt,
      });
    }
  }

  parseLocation(tr, lesson) {
    const locationElement = tr.querySelector("a");

    const location = {
      type: "l",
      id: 0,
      text: "",
      info: "",
    };

    if (locationElement) {
      // Аудитория
      const area = tr.querySelector("nobr").textContent.trim();
      const adress = tr.querySelector("nobr").querySelector("img").title.trim();
      const id = locationElement.href.split("=")[1];
      const aud = locationElement.textContent.trim();
      location.id = id;
      location.text = "Ауд. " + aud + " " + area;
      location.info = adress;
    } else {
      // Онлайн / МООК
      location.text = "Онлайн курс";
      lesson.types.push("Онлайн");
    }
    lesson.characteristics.push(location);
  }

  parseGroup(tr, lesson) {
    const group = tr.querySelector("a").textContent.trim();
    const information = tr.querySelector("img").title;
    lesson.characteristics.push({
      type: "g",
      id: group,
      text: group,
      info: information,
    });
  }
}

export default new ParserScheduleService();
