const XLSX = require("xlsx");
const dayjs = require("dayjs");

function readTasks(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets["Tasks"];
  const rows = XLSX.utils.sheet_to_json(sheet);

  return rows.map((r) => ({
    taskId: r.EpicNo,
    taskName: r.Story,
    assignee: r.Assignee,
    storyPoints: Number(r.StoryPoints),
    duration: Number(r.StoryPoints) * 1.5,
    deadline: r.Deadline,
    offDays: r.AssigneeOffDays
      ? r.AssigneeOffDays.split(",").map((d) => d.trim())
      : [],
  }));
}

module.exports = { readTasks };
