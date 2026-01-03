const ExcelJS = require("exceljs");
const dayjs = require("dayjs");
const config = require("./config.json");

async function generateTimelineExcel(tasks) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Timeline");

  const startDate = dayjs(config.PROJECT_START_DATE) || dayjs(process.argv[2]);
  const endDate = dayjs("2026-12-30");

  sheet.columns = [{ header: "Assignee", key: "assignee", width: 20 }];

  let colIndex = 2;
  for (
    let date = startDate.clone();
    date.isBefore(endDate) || date.isSame(endDate);
    date = date.add(1, "day")
  ) {
    sheet.getColumn(colIndex).width = 7;
    sheet.getCell(1, colIndex).value = date.format("YYYY-MM-DD");
    colIndex++;
  }

  const grouped = {};
  tasks.forEach((t) => {
    if (!grouped[t.Assignee]) grouped[t.Assignee] = [];
    grouped[t.Assignee].push(t);
  });

  // Color map for stories
  const colors = [
    "FF4F81BD",
    "FFFF0000",
    "FF00FF00",
    "FF0000FF",
    "FFFFFF00",
    "FFFF00FF",
    "FF00FFFF",
    "FF800080",
  ];
  const storyColors = {};
  let colorIndex = 0;

  let rowIndex = 2;

  for (const assignee in grouped) {
    sheet.getCell(rowIndex, 1).value = assignee;

    grouped[assignee].forEach((task) => {
      if (!storyColors[task.Story]) {
        storyColors[task.Story] = colors[colorIndex % colors.length];
        colorIndex++;
      }

      let currentCol = 2;

      for (
        let date = startDate.clone();
        date.isBefore(endDate) || date.isSame(endDate);
        date = date.add(1, "day")
      ) {
        if (
          (date.isSame(dayjs(task["Start Date"])) ||
            date.isAfter(dayjs(task["Start Date"]))) &&
          (date.isSame(dayjs(task["End Date"])) ||
            date.isBefore(dayjs(task["End Date"])))
        ) {
          sheet.getCell(rowIndex, currentCol).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: storyColors[task.Story] },
          };
          sheet.getCell(rowIndex, currentCol).value = task.Story;
        }
        currentCol++;
      }
    });

    rowIndex++;
  }

  await workbook.xlsx.writeFile("TaskScheduleTimeline.xlsx");
  console.log("✅ Timeline Excel generated");
}

module.exports = generateTimelineExcel;
