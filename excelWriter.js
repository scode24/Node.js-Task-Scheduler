const XLSX = require("xlsx");
const dayjs = require("dayjs");
const generateTimelineExcel = require("./generateTimelineExcel");

function deadlineToDateString(deadline) {
  if (typeof deadline === "number") {
    const date = new Date((deadline - 25569) * 86400 * 1000);
    return dayjs(date).format("YYYY-MM-DD");
  }
  return dayjs(deadline).format("YYYY-MM-DD");
}

function writeOutput(tasks, outputPath) {
  const distribution = tasks.map((t) => ({
    "Epic No": t.taskId,
    Story: t.taskName,
    Assignee: t.assignee,
    Iteration: t.iteration,
    "Start Date": t.startDate,
    "End Date": t.endDate,
    Deadline: deadlineToDateString(t.deadline), // Keep in
    Status: t.status,
  }));

  // const timeline = tasks.map((t) => ({
  //   id: t.taskId,
  //   text: t.taskName,
  //   start_date: t.startDate,
  //   end_date: t.endDate,
  //   iteration: `Iteration ${t.iteration}`,
  // }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(distribution),
    "Task Distribution"
  );
  // XLSX.utils.book_append_sheet(
  //   wb,
  //   XLSX.utils.json_to_sheet(timeline),
  //   "Timeline"
  // );

  XLSX.writeFile(wb, outputPath);

  generateTimelineExcel(distribution);
}

module.exports = { writeOutput };
