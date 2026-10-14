
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskProgress = document.querySelector("#task-progress");

let tasks;

try {
    tasks = JSON.parse(
        localStorage.getItem("ronin-tasks") || "[]"
    );

    if (
        !Array.isArray(tasks) ||
        !tasks.every(task =>
            typeof task === "object" &&
            task !== null &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        )
    ) {
        tasks = [];
    }
} catch {
    tasks = [];
}

function saveTasks() {
    localStorage.setItem(
        "ronin-tasks",
        JSON.stringify(tasks)
    );
}

function renderTasks() {
    taskList.replaceChildren();

    let completedCount = 0;

    tasks.forEach((task, index) => {
        const item = document.createElement("li");
        const checkbox = document.createElement("input");
        const text = document.createElement("span");
        const removeButton = document.createElement("button");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Concluir: " + task.text
        );

        item.classList.toggle("completed", task.completed);

        if (task.completed) {
            completedCount++;
        }

        text.textContent = task.text;

        checkbox.addEventListener("change", () => {
            tasks[index].completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        removeButton.textContent = "Excluir";
        removeButton.type = "button";

        removeButton.addEventListener("click", () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, text, removeButton);
        taskList.appendChild(item);
    });

    taskProgress.textContent =
        `${completedCount} de ${tasks.length} concluídas`;
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) return;

    tasks.push({
        text: text,
        completed: false
    });

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});

renderTasks();
