const fs = require("fs");

const taskFile = "task.txt";
const completedFile = "completed.txt";

function readTasks() {
  try {
    const data = fs.readFileSync(taskFile, "utf8");
    if(data.length != 0){
      const lines = data.split("\n");
    const tasks = lines.map((line) => {
      const [priority, ...description] = line.split(" ");
      const task = description.join(" ");
      return { priority: parseInt(priority), task };
    });
    return tasks;
    }else{
      return [];
    }
  } catch (err) {
    return [];
  }
}

function readCompletedTasks() {
  try {
    const data = fs.readFileSync(completedFile, "utf8");
    const lines = data.split("\n");
    const tasks = lines.filter((line) => line.trim() !== "");
    return tasks;
  } catch (err) {
    return [];
  }
}

function writeCompletedTasks(tasks) {
  const data = tasks.join("\n");
  fs.writeFileSync(completedFile, data, "utf8");
}

function listTasks() {
  const tasks = readTasks();
  if (tasks && tasks.length == 0) {
    console.log("There are no pending tasks!");
  } else {
    tasks.sort((a, b) => a.priority - b.priority);
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.task} [${task.priority}]`);
    });
    
  }
}

function addTask(priority, description) {
  const tasks = readTasks();
  if (description && priority >= 0) {
    tasks.push({ priority: priority, task: description });
    tasks.sort((x, y) => x.priority - y.priority);
    writeTasks(tasks);
    console.log(`Added task: \"${description}\" with priority ${priority}`);
  } else {
    console.log(`Error: Missing tasks string. Nothing added!`);
  }
}

function writeTasks(tasks) {
  const lines = tasks.map(({ priority, task }) => {
    if (isNaN(priority)) {
      return "";
    }
    return `${priority} ${task}`;
  });
  const data = lines.filter((line) => line !== "").join("\n");
  fs.writeFileSync(taskFile, data, "utf8");
}

function deleteTask(index) {
  const tasks = readTasks();
  if (isNaN(index)) {
    console.log("Error: Missing NUMBER for deleting tasks.");
    return;
  }
  if (index < 1 || index > tasks.length) {
    console.log(
      `Error: task with index #${index} does not exist. Nothing deleted.`
    );
    return;
  }

  tasks.splice(index - 1, 1);
  writeTasks(tasks);

  console.log(`Deleted task #${index}`);
}

function markTaskAsCompleted(index) {
  const tasks = readTasks();
  const completedTasks = readCompletedTasks();
  if (isNaN(index)) {
    console.log("Error: Missing NUMBER for marking tasks as done.");
    return;
  }
  if (index < 1 || index > tasks.length) {
    console.log(`Error: no incomplete item with index #${index} exists.`);
    return;
  }

  const task = tasks[index - 1];
  completedTasks.push(task.task);
  writeCompletedTasks(completedTasks);

  tasks.splice(index - 1, 1);
  writeTasks(tasks);

  console.log("Marked item as done.");
}

function generateReport() {
  const tasks = readTasks();
  const completedTasks = readCompletedTasks();

  console.log(`Pending : ${tasks.length}`);
  tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.task} [${task.priority}]`);
  });

  console.log(`\nCompleted : ${completedTasks.length}`);
  completedTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });
}

function printUsage() {
  console.log("Usage :-");
  console.log(
    '$ ./task add 2 hello world    # Add a new item with priority 2 and text "hello world" to the list'
  );
  console.log(
    "$ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order"
  );
  console.log(
    "$ ./task del INDEX            # Delete the incomplete item with the given index"
  );
  console.log(
    "$ ./task done INDEX           # Mark the incomplete item with the given index as complete"
  );
  console.log("$ ./task help                 # Show usage");
  console.log('$ ./task report               # Statistics"');
}

function parseCommandArgs() {
  const [, , command, ...args] = process.argv;
  return { command, args };
}

function main() {
  const { command, args } = parseCommandArgs();
  switch (command) {
    case "add": {
      const [priority, task] = args;
      addTask(parseInt(priority), task);
      break;
    }
    case "ls":
      listTasks();
      break;
    case "del": {
      const [index] = args;
      deleteTask(parseInt(index));
      break;
    }
    case "done": {
      const [index] = args;
      markTaskAsCompleted(parseInt(index));
      break;
    }
    case "help":
      printUsage();
      break;
    case "report":
      generateReport();
      break;
    default:
      printUsage();
  }
}

main();
