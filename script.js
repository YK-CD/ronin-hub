
"use strict";

// =====================================
// RONIN HUB — NAVEGAÇÃO
// =====================================

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");

function showPage(name) {
    pages.forEach(page => {
        const active = page.id === `page-${name}`;
        page.classList.toggle("active", active);
        page.style.display = active ? "block" : "none";
    });

    navLinks.forEach(link => {
        const active = link.dataset.page === name;
        link.classList.toggle("active", active);

        if (active) {
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
        history.replaceState(null, "", `#${link.dataset.page}`);
    });
});

const initialPage = location.hash.replace("#", "");
showPage(
    ["inicio", "projetos", "tarefas", "notas"].includes(initialPage)
        ? initialPage
        : "inicio"
);

// =====================================
// RELÓGIO
// =====================================

const clock = document.querySelector("#clock");
const currentDate = document.querySelector("#current-date");

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

// =====================================
// CLIMA — OPEN-METEO
// =====================================

const weatherForm = document.querySelector("#weather-form");
const weatherCity = document.querySelector("#weather-city");
const weatherResult = document.querySelector("#weather-result");
const weatherStatus = document.querySelector("#weather-status");

function weatherDescription(code) {
    const descriptions = {
        0: "Céu limpo",
        1: "Predominantemente limpo",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Nevoeiro",
        48: "Nevoeiro com gelo",
        51: "Garoa leve",
        53: "Garoa moderada",
        55: "Garoa intensa",
        56: "Garoa congelante leve",
        57: "Garoa congelante intensa",
        61: "Chuva leve",
        63: "Chuva moderada",
        65: "Chuva intensa",
        66: "Chuva congelante leve",
        67: "Chuva congelante intensa",
        71: "Neve leve",
        73: "Neve moderada",
        75: "Neve intensa",
        77: "Grãos de neve",
        80: "Pancadas de chuva leves",
        81: "Pancadas de chuva moderadas",
        82: "Pancadas de chuva intensas",
        85: "Pancadas de neve leves",
        86: "Pancadas de neve intensas",
        95: "Trovoada",
        96: "Trovoada com granizo leve",
        99: "Trovoada com granizo intenso"
    };

    return descriptions[code] || "Condição não identificada";
}

function showWeatherError(message) {
    weatherStatus.textContent = "ERRO";
    weatherResult.replaceChildren();

    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    weatherResult.appendChild(paragraph);
}

async function loadWeather(city) {
    weatherStatus.textContent = "CONSULTANDO...";
    weatherResult.replaceChildren();

    const loading = document.createElement("p");
    loading.textContent = "Buscando dados meteorológicos...";
    weatherResult.appendChild(loading);

    try {
        const geoURL = new URL(
            "https://geocoding-api.open-meteo.com/v1/search"
        );

        geoURL.search = new URLSearchParams({
            name: city,
            count: "1",
            language: "pt",
            format: "json",
            countryCode: "BR"
        }).toString();

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Não foi possível pesquisar a cidade.");
        }

        const geoData = await geoResponse.json();
        const place = geoData.results?.[0];

        if (!place) {
            throw new Error("Cidade não encontrada. Tente outro nome.");
        }

        const weatherURL = new URL(
            "https://api.open-meteo.com/v1/forecast"
        );

        weatherURL.search = new URLSearchParams({
            latitude: String(place.latitude),
            longitude: String(place.longitude),
            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "wind_speed_10m",
                "weather_code"
            ].join(","),
            timezone: "auto"
        }).toString();

        const response = await fetch(weatherURL);

        if (!response.ok) {
            throw new Error("O serviço de clima está indisponível.");
        }

        const data = await response.json();
        const current = data.current;

        if (!current) {
            throw new Error("Não recebemos dados meteorológicos.");
        }

        weatherResult.replaceChildren();

        const heading = document.createElement("div");
        heading.className = "weather-main";

        const location = document.createElement("p");
        location.className = "weather-location";
        location.textContent = `${place.name}, ${place.admin1 || "Brasil"}`;

        const temperature = document.createElement("p");
        temperature.className = "weather-temperature";
        temperature.textContent =
            `${Math.round(current.temperature_2m)}°C`;

        const description = document.createElement("p");
        description.className = "weather-description";
        description.textContent =
            weatherDescription(current.weather_code);

        heading.append(location, temperature, description);

        const stats = document.createElement("div");
        stats.className = "weather-stats";

        const values = [
            ["SENSAÇÃO", `${Math.round(current.apparent_temperature)}°C`],
            ["UMIDADE", `${current.relative_humidity_2m}%`],
            ["VENTO", `${current.wind_speed_10m} km/h`]
        ];

        values.forEach(([label, value]) => {
            const card = document.createElement("div");
            card.className = "weather-stat";

            const title = document.createElement("span");
            title.textContent = label;

            const number = document.createElement("strong");
            number.textContent = value;

            card.append(title, number);
            stats.appendChild(card);
        });

        weatherResult.append(heading, stats);
        weatherStatus.textContent = "DADOS ATUALIZADOS";
    } catch (error) {
        showWeatherError(
            error instanceof TypeError
                ? "Falha de conexão. Verifique sua internet e tente novamente."
                : error.message
        );
    }
}

if (weatherForm) {
    weatherForm.addEventListener("submit", event => {
        event.preventDefault();

        const city = weatherCity.value.trim();

        if (city) {
            loadWeather(city);
        }
    });

    loadWeather(weatherCity.value.trim() || "Goiana");
}

// =====================================
// PROJETOS
// =====================================

const projectForm = document.querySelector("#project-form");
const projectName = document.querySelector("#project-name");
const projectDescription = document.querySelector("#project-description");
const projectURL = document.querySelector("#project-url");
const projectStatus = document.querySelector("#project-status");
const projectList = document.querySelector("#project-list");
const projectCount = document.querySelector("#project-count");

let projects = [];

try {
    const saved = JSON.parse(
        localStorage.getItem("ronin-projects") || "[]"
    );

    if (Array.isArray(saved)) {
        projects = saved.filter(project =>
            project &&
            typeof project.id === "string" &&
            typeof project.name === "string" &&
            typeof project.description === "string" &&
            typeof project.url === "string" &&
            ["planejamento", "andamento", "concluido"].includes(project.status)
        );
    }
} catch {
    projects = [];
}

function saveProjects() {
    try {
        localStorage.setItem("ronin-projects", JSON.stringify(projects));
    } catch {
        alert("Não foi possível salvar. Verifique o armazenamento do navegador.");
    }
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
}

function renderProjects() {
    projectList.replaceChildren();

    projectCount.textContent =
        `${projects.length} projeto${projects.length === 1 ? "" : "s"} cadastrado${projects.length === 1 ? "" : "s"}`;

    if (projects.length === 0) {
        projectList.appendChild(
            createElement("p", "empty-state", "Nenhum projeto cadastrado. Crie o primeiro acima.")
        );
        return;
    }

    projects.forEach(project => {
        const card = createElement("article", "project-card");
        const header = createElement("div", "project-card-header");

        const title = createElement("h3", "", project.name);
        const statusLabels = {
            planejamento: "PLANEJAMENTO",
            andamento: "EM ANDAMENTO",
            concluido: "CONCLUÍDO"
        };

        const badge = createElement(
            "span",
            `project-badge status-${project.status}`,
            statusLabels[project.status]
        );

        header.append(title, badge);
        card.appendChild(header);

        if (project.description) {
            card.appendChild(
                createElement("p", "project-description", project.description)
            );
        }

        if (project.url) {
            const link = createElement("a", "project-open", "Abrir projeto ↗");
            link.href = project.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            card.appendChild(link);
        }

        const actions = createElement("div", "project-actions");

        const changeStatus = createElement("select", "project-status-select");
        changeStatus.setAttribute("aria-label", `Alterar estado de ${project.name}`);

        [
            ["planejamento", "Planejamento"],
            ["andamento", "Em andamento"],
            ["concluido", "Concluído"]
        ].forEach(([value, label]) => {
            const option = createElement("option", "", label);
            option.value = value;
            option.selected = value === project.status;
            changeStatus.appendChild(option);
        });

        changeStatus.addEventListener("change", () => {
            project.status = changeStatus.value;
            saveProjects();
            renderProjects();
        });

        const remove = createElement("button", "project-delete", "Excluir");
        remove.type = "button";
        remove.addEventListener("click", () => {
            if (confirm(`Excluir o projeto "${project.name}"?`)) {
                projects = projects.filter(item => item.id !== project.id);
                saveProjects();
                renderProjects();
            }
        });

        actions.append(changeStatus, remove);
        card.appendChild(actions);
        projectList.appendChild(card);
    });
}

if (projectForm) {
    projectForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = projectName.value.trim();
        const description = projectDescription.value.trim();
        const url = projectURL.value.trim();

        if (!name) return;

        if (url) {
            try {
                const parsedURL = new URL(url);

                if (!["http:", "https:"].includes(parsedURL.protocol)) {
                    alert("Use um link que comece com https:// ou http://");
                    return;
                }
            } catch {
                alert("Digite um link válido ou deixe o campo vazio.");
                return;
            }
        }

        projects.unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name,
            description,
            url,
            status: projectStatus.value
        });

        saveProjects();
        renderProjects();
        projectForm.reset();
        projectName.focus();
    });
}

renderProjects();

// =====================================
// TAREFAS
// =====================================

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskProgress = document.querySelector("#task-progress");

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
} catch {
    tasks = [];
}

function saveTasks() {
    localStorage.setItem("ronin-tasks", JSON.stringify(tasks));
}

function renderTasks() {
    taskList.replaceChildren();

    tasks.forEach((task, index) => {
        const item = document.createElement("li");
        const checkbox = document.createElement("input");
        const text = document.createElement("span");
        const deleteButton = document.createElement("button");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Concluir ${task.text}`);

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

    const completed = tasks.filter(task => task.completed).length;
    taskProgress.textContent = `${completed} de ${tasks.length} concluídas`;
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = taskInput.value.trim();
    if (!text) return;

    tasks.push({ text, completed: false });
    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});

renderTasks();

// =====================================
// NOTAS
// =====================================

const notesInput = document.querySelector("#notes-input");

try {
    notesInput.value = localStorage.getItem("ronin-notes") || "";
} catch {
    notesInput.value = "";
}

notesInput.addEventListener("input", () => {
    try {
        localStorage.setItem("ronin-notes", notesInput.value);
    } catch {
        console.error("Não foi possível salvar as notas.");
    }
});
