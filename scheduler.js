const dayjs = require("dayjs");
const { nextWorkingDay, calculateEndDate } = require("./dateUtils");
const config = require("./config.json");

const MAX_ITERATIONS = config.MAX_ITERATIONS || 3;
const ITERATION_DURATION = config.ITERATION_DURATION || 15;
const MAX_DATE_LOOKAHEAD = config.MAX_DATE_LOOKAHEAD || 30;

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
 * Schedules tasks across assignees, assigning iterations and calculating dates.
 * @param {Array} tasks - Array of task objects.
 * @param {string} projectStart - Project start date in YYYY-MM-DD format.
 * @param {Array} developers - Array of developer names.
 * @param {Array} qas - Array of QA names.
 * @returns {Array} The scheduled tasks with added properties like iteration, startDate, endDate, status.
 */
function scheduleTasks(tasks, projectStart, developers, qas) {
  const startDate = dayjs(projectStart);
  if (!startDate.isValid()) {
    throw new Error("Invalid PROJECT_START date");
  }

  // Split tasks
  const devTasks = tasks.filter((t) => !t.taskName.startsWith("[QA]"));
  const qaTasks = tasks.filter((t) => t.taskName.startsWith("[QA]"));

  // Sort DEV tasks by deadline
  devTasks.sort((a, b) =>
    deadlineToDayjs(a.deadline).diff(deadlineToDayjs(b.deadline))
  );

  // ----------------------
  // DEV SCHEDULING
  // ----------------------
  const devEndMap = {}; // Story -> end date

  developers.forEach((developer) => {
    const developerTasks = devTasks.filter(
      (task) => task.assignee === developer
    );

    let globalCursor = startDate.clone();

    developerTasks.forEach((task) => {
      const start = nextWorkingDay(
        globalCursor,
        task.offDays,
        MAX_DATE_LOOKAHEAD
      );

      const end = calculateEndDate(
        start,
        task.duration,
        task.offDays,
        MAX_DATE_LOOKAHEAD
      );

      const daysFromStart = start.diff(startDate, "day");
      const iteration = Math.floor(daysFromStart / ITERATION_DURATION) + 1;

      if (iteration > MAX_ITERATIONS) {
        task.status = "Unscheduled";
      } else {
        task.iteration = iteration;
        task.startDate = start.format("YYYY-MM-DD");
        task.endDate = end.format("YYYY-MM-DD");
        task.isOverdue = end.isAfter(deadlineToDayjs(task.deadline));
        task.status =
          deadlineToDayjs(task.deadline).diff(end, "day") < 14
            ? "At Risk"
            : "On Track";

        globalCursor = end.add(1, "day");

        // Track DEV completion for QA dependency
        devEndMap[task.taskName] = end.clone();
      }
    });
  });

  // ----------------------
  // QA SCHEDULING
  // ----------------------
  qaTasks.sort((a, b) =>
    deadlineToDayjs(a.deadline).diff(deadlineToDayjs(b.deadline))
  );

  qas.forEach((qa) => {
    const qaStories = qaTasks.filter((task) => task.assignee === qa);

    let globalCursor = startDate.clone();

    qaStories.forEach((task) => {
      const devStoryName = task.taskName.replace("[QA]", "");
      const devEnd = devEndMap[devStoryName];

      if (!devEnd) {
        task.status = "Blocked (DEV not scheduled)";
        return;
      }

      // QA starts AFTER dev ends
      const dependencyStart = devEnd.add(1, "day");
      const effectiveStart = globalCursor.isAfter(dependencyStart)
        ? globalCursor
        : dependencyStart;

      const start = nextWorkingDay(
        effectiveStart,
        task.offDays,
        MAX_DATE_LOOKAHEAD
      );

      const end = calculateEndDate(
        start,
        task.duration,
        task.offDays,
        MAX_DATE_LOOKAHEAD
      );

      const daysFromStart = start.diff(startDate, "day");
      const iteration = Math.floor(daysFromStart / ITERATION_DURATION) + 1;

      if (iteration > MAX_ITERATIONS) {
        task.status = "Unscheduled";
      } else {
        task.iteration = iteration;
        task.startDate = start.format("YYYY-MM-DD");
        task.endDate = end.format("YYYY-MM-DD");
        task.isOverdue = end.isAfter(deadlineToDayjs(task.deadline));

        task.status =
          deadlineToDayjs(task.deadline).diff(end, "day") < 7
            ? "At Risk"
            : "On Track";

        globalCursor = end.add(1, "day");
      }
    });
  });

  return tasks;
}

module.exports = { scheduleTasks };
