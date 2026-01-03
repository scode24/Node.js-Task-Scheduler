// index.js
const { readTasks } = require("./excelReader");
const { scheduleTasks } = require("./scheduler");
const { writeOutput } = require("./excelWriter");
const config = require("./config.json");

const PROJECT_START = config.PROJECT_START_DATE || process.argv[2];
const ASSIGNEES = config.ASSIGNEES;

if (!PROJECT_START) {
  console.error("❌ Please provide project start date (YYYY-MM-DD)");
  console.error("Usage: node index.js 2026-02-01");
  process.exit(1);
}

const INPUT_FILE = "TaskInfo.xlsx";
const OUTPUT_FILE = "TaskScheduleOutput.xlsx";

const tasks = readTasks(INPUT_FILE);
const scheduled = scheduleTasks(tasks, PROJECT_START, ASSIGNEES);

writeOutput(scheduled, OUTPUT_FILE);

console.log(`✅ Scheduling completed (Project Start: ${PROJECT_START})`);
