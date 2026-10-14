
const clock = document.querySelector("#clock");
const currentDate = document.querySelector("#current-date");

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskProgress = document.querySelector("#task-progress");
const notesInput = document.querySelector("#notes-input");

// RELÓGIO E DATA
function updateClock() {
    const now = new Date();

    if (clock) {
        clock.textContent = now.toLocaleTimeString("pt-BR", {
            hour12: false
        });
    }

    if (currentDate) {
        currentDate.textContent = now.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }
}

updateClock();
setInterval(updateClock, 1000);

// TAREFAS
let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("ronin-tasks") || "[]"
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

function saveTasks() {
    localStorage.setItem("ronin-tasks", JSON.stringify(tasks));
}

function renderTasks() {
    if (!taskList) return;

    taskList.replaceChildren();

    tasks.forEach((task, index) => {
        const item = document.createElement("li");
        const checkbox = document.createElement("input");
        const text = document.createElement("span");
        const deleteButton = document.createElement("button");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        text.textContent = task.text;

        if (task.completed) {
            text.style.textDecoration = "line-through";
            text.style.opacity = "0.6";
        }

        checkbox.addEventListener("change", () => {
            tasks[index].completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        deleteButton.type = "button";
        deleteButton.textContent = "Excluir";

        deleteButton.addEventListener("click", () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, text, deleteButton);
        taskList.appendChild(item);
    });

    if (taskProgress) {
        const completed = tasks.filter(task => task.completed).length;
        taskProgress.textContent =
            `${completed} de ${tasks.length} concluídas`;
    }
}

if (taskForm && taskInput) {
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
}

renderTasks();

// NOTAS
if (notesInput) {
    try {
        notesInput.value = localStorage.getItem("ronin-notes") || "";
    } catch (error) {
        notesInput.value = "";
    }

    notesInput.addEventListener("input", () => {
        try {
            localStorage.setItem("ronin-notes", notesInput.value);
        } catch (error) {
            console.error("Não foi possível salvar as notas:", error);
        }
    });
}

 // NAVEGAÇÃO ENTRE TELAS
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");

function showPage(pageName) {
    pages.forEach(page => {
        const isActive = page.id === `page-${pageName}`;

        page.style.display = isActive ? "" : "none";
        page.classList.toggle("active", isActive);
    });

    navLinks.forEach(link => {
        const isActive = link.dataset.page === pageName;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

navLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        showPage(link.dataset.page);
    });
});

// Abre a tela inicial ao carregar o site.
showPage("inicio");
