// index.js - Main entry point for the task scheduler application
const { readTasks } = require("./excelReader");
const { scheduleTasks } = require("./scheduler");
const { writeOutput } = require("./excelWriter");
const config = require("./config.json");

const PROJECT_START = config.PROJECT_START_DATE || process.argv[2];

if (!PROJECT_START) {
  console.error("❌ Please provide project start date (YYYY-MM-DD)");
  console.error("Usage: node index.js 2026-02-01 OR specify in config.json");
  process.exit(1);
}

const DEVELOPERS = config.DEVELOPERS || [];
const QAS = config.QAS || [];
const INPUT_FILE = config.INPUT_FILE || "TaskInfo.xlsx";
const OUTPUT_FILE = config.OUTPUT_FILE || "TaskScheduleOutput.xlsx";

const tasks = readTasks(INPUT_FILE);
const scheduled = scheduleTasks(tasks, PROJECT_START, DEVELOPERS, QAS);

writeOutput(scheduled, OUTPUT_FILE);

console.log(`✅ Scheduling completed (Project Start: ${PROJECT_START})`);
