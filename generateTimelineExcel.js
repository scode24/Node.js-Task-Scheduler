const ExcelJS = require("exceljs");
const dayjs = require("dayjs");
const { isWeekend } = require("./dateUtils");
const config = require("./config.json");

/**
 * Converts a deadline (Excel date number or string) to a dayjs object.
 * @param {number|string} deadline - The deadline in Excel date format or string.
 * @returns {dayjs.Dayjs} The dayjs object representing the deadline.
 */
function deadlineToDayjs(deadline) {
  if (typeof deadline === "number") {
    const date = new Date((deadline - 25569) * 86400 * 1000);
    return dayjs(date);
  }
  return dayjs(deadline);
}

/**
 * Converts a deadline to YYYY-MM-DD string format.
 * @param {number|string} deadline - The deadline.
 * @returns {string} Formatted date string.
 */
function deadlineToDateString(deadline) {
  return deadlineToDayjs(deadline).format("YYYY-MM-DD");
}

/**
 * Generates a timeline Excel file with color-coded task bars.
 * @param {Array} tasks - Array of task objects.
 */
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
    const cell = sheet.getCell(1, colIndex);
    cell.value = date.format("YYYY-MM-DD");
    cell.alignment = {
      textRotation: 90,
      horizontal: "center",
      vertical: "middle",
    };
    colIndex++;
  }

  // Set header row height for vertical text
  sheet.getRow(1).height = 70;
  const grouped = {};
  tasks.forEach((t) => {
    if (!grouped[t.Assignee]) grouped[t.Assignee] = [];
    grouped[t.Assignee].push(t);
  });

  // Color map for stories - light colors
  const colors = [
    "FFE6F3FF", // Light blue
    "FFFFE6E6", // Light red
    "FFE6FFE6", // Light green
    "FFE6E6FF", // Light purple
    "FFFFFFE6", // Light yellow
    "FFFFE6FF", // Light pink
    "FFE6FFFF", // Light cyan
    "FFFFF0E6", // Light orange
    "FFE6F0FF", // Light lavender
    "FFE6FFF0", // Light mint
    "FFF0E6FF", // Light lilac
    "FFE6F0E6", // Light sage
    "FFF0FFE6", // Light lime
    "FFE6F0FF", // Light periwinkle
    "FFFFF0F0", // Light rose
    "FFF0F0E6", // Light peach
  ];
  const storyColors = {};
  let colorIndex = 0;

  let rowIndex = 2;

  for (const assignee in grouped) {
    const assigneeCell = sheet.getCell(rowIndex, 1);
    assigneeCell.value = assignee;
    assigneeCell.alignment = { horizontal: "center", vertical: "middle" };

    sheet.getRow(rowIndex).height = 20;

    grouped[assignee].forEach((task) => {
      if (!storyColors[task.Story]) {
        storyColors[task.Story] = colors[colorIndex % colors.length];
        colorIndex++;
      }

      let currentCol = 2;
      let storySet = false;

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
          if (isWeekend(date)) {
            const wkndCell = sheet.getCell(rowIndex, currentCol);
            wkndCell.value = "🍻";
            wkndCell.alignment = { horizontal: "center", vertical: "middle" };
          } else {
            sheet.getCell(rowIndex, currentCol).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: storyColors[task.Story] },
            };
          }
          if (!storySet) {
            const storyCell = sheet.getCell(rowIndex, currentCol);
            storyCell.value = "▶️ " + task.Story;
            storyCell.font = { size: 7 };
            storyCell.alignment = { horizontal: "left", vertical: "middle" };
            storySet = true;
          }
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
