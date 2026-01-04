const XLSX = require("xlsx");
const dayjs = require("dayjs");
const generateTimelineExcel = require("./generateTimelineExcel");

/**
 * Converts a deadline to YYYY-MM-DD string format.
 * @param {number|string} deadline - The deadline.
 * @returns {string} Formatted date string.
 */
function deadlineToDateString(deadline) {
  if (typeof deadline === "number") {
    const date = new Date((deadline - 25569) * 86400 * 1000);
    return dayjs(date).format("YYYY-MM-DD");
  }
  return dayjs(deadline).format("YYYY-MM-DD");
}

/**
 * Writes the scheduled tasks to Excel files.
 * @param {Array} tasks - Array of scheduled task objects.
 * @param {string} outputPath - Path for the output Excel file.
 */
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
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(distribution),
    "Task Distribution"
  );

  XLSX.writeFile(wb, outputPath);

  generateTimelineExcel(distribution);
}

module.exports = { writeOutput };
