const dayjs = require("dayjs");
const { nextWorkingDay, calculateEndDate } = require("./dateUtils");
const config = require("./config.json");

const MAX_ITERATIONS = config.MAX_ITERATIONS || 3;
const ITERATION_DURATION = config.ITERATION_DURATION || 15;
const MAX_DATE_LOOKAHEAD = config.MAX_DATE_LOOKAHEAD || 30;

function deadlineToDayjs(deadline) {
  if (typeof deadline === "number") {
    const date = new Date((deadline - 25569) * 86400 * 1000);
    return dayjs(date);
  }
  return dayjs(deadline);
}

function scheduleTasks(tasks, projectStart, assignees) {
  const startDate = dayjs(projectStart);
  if (!startDate.isValid()) {
    throw new Error("Invalid PROJECT_START date");
  }

  // Sort by deadline
  tasks.sort((a, b) =>
    deadlineToDayjs(a.deadline).diff(deadlineToDayjs(b.deadline))
  );

  assignees.forEach((assignee) => {
    const assigneeTasks = tasks.filter((task) => task.assignee === assignee);

    let globalCursor = startDate.clone();

    assigneeTasks.forEach((task) => {
      let start = nextWorkingDay(
        globalCursor,
        task.offDays,
        MAX_DATE_LOOKAHEAD
      );
      let end = calculateEndDate(
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
      }
    });
  });

  return tasks;
}

module.exports = { scheduleTasks };
