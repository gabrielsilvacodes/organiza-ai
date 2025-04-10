// ========== SELEÇÃO DE ELEMENTOS ========== //
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const eraseBtn = document.querySelector("#erase-button");
const filterSelect = document.querySelector("#filter-select");
const toggleThemeBtn = document.querySelector("#toggle-theme");
const clearAllBtn = document.querySelector("#clear-all-btn");

let oldInputValue;

// ========== FUNÇÕES DE TEMA ========== //
const applyStoredTheme = () => {
  const theme = localStorage.getItem("theme");
  const icon = toggleThemeBtn.querySelector("i");

  if (theme === "dark") {
    document.body.classList.add("dark");
    icon.classList.replace("fa-moon", "fa-sun");
  }
};

const toggleTheme = () => {
  const isDark = document.body.classList.toggle("dark");
  const icon = toggleThemeBtn.querySelector("i");

  icon.classList.replace(
    isDark ? "fa-moon" : "fa-sun",
    isDark ? "fa-sun" : "fa-moon"
  );
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

// ========== LOCAL STORAGE ========== //
const getTodosFromLocalStorage = () =>
  JSON.parse(localStorage.getItem("todos")) || [];

const setTodosToLocalStorage = (todos) =>
  localStorage.setItem("todos", JSON.stringify(todos));

const saveTodoToLocalStorage = (todo) => {
  const todos = getTodosFromLocalStorage();
  todos.push(todo);
  setTodosToLocalStorage(todos);
};

const removeTodoFromLocalStorage = (text) => {
  const todos = getTodosFromLocalStorage().filter((todo) => todo.text !== text);
  setTodosToLocalStorage(todos);
};

const updateTodoStatusInLocalStorage = (text) => {
  const todos = getTodosFromLocalStorage().map((todo) => {
    if (todo.text === text) todo.done = !todo.done;
    return todo;
  });
  setTodosToLocalStorage(todos);
};

const updateTodoTextInLocalStorage = (oldText, newText) => {
  const todos = getTodosFromLocalStorage().map((todo) => {
    if (todo.text === oldText) todo.text = newText;
    return todo;
  });
  setTodosToLocalStorage(todos);
};

// ========== DOM MANIPULATION ========== //
const createTodoElement = (text, done = false, save = true) => {
  const todo = document.createElement("div");
  todo.classList.add("todo");
  if (done) todo.classList.add("done");

  todo.innerHTML = `
    <h3>${text}</h3>
    <button class="finish-todo"><i class="fa-solid fa-check"></i></button>
    <button class="edit-todo"><i class="fa-solid fa-pen"></i></button>
    <button class="remove-todo"><i class="fa-solid fa-xmark"></i></button>
  `;

  todoList.appendChild(todo);
  if (save) saveTodoToLocalStorage({ text, done });
  todoInput.value = "";
  todoInput.focus();
};

const toggleForms = () => {
  editForm.classList.toggle("hide");
  todoForm.classList.toggle("hide");
  todoList.classList.toggle("hide");
};

const updateTodoText = (newText) => {
  document.querySelectorAll(".todo").forEach((todo) => {
    const title = todo.querySelector("h3");
    if (title.innerText === oldInputValue) {
      title.innerText = newText;
    }
  });
};

const filterTodos = (filter) => {
  document.querySelectorAll(".todo").forEach((todo) => {
    const isDone = todo.classList.contains("done");
    todo.style.display =
      filter === "all" ||
      (filter === "done" && isDone) ||
      (filter === "todo" && !isDone)
        ? "flex"
        : "none";
  });
};

const searchTodos = (search) => {
  document.querySelectorAll(".todo").forEach((todo) => {
    const title = todo.querySelector("h3").innerText.toLowerCase();
    todo.style.display = title.includes(search.toLowerCase()) ? "flex" : "none";
  });
};

const loadTodos = () => {
  getTodosFromLocalStorage().forEach(({ text, done }) => {
    createTodoElement(text, done, false);
  });
};

// ========== EVENTOS ========== //
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const inputValue = todoInput.value.trim();
  const warning = document.querySelector("#input-warning");

  if (!inputValue) {
    warning.classList.remove("hide");
    setTimeout(() => warning.classList.add("hide"), 2500);
    return;
  }

  warning.classList.add("hide");
  createTodoElement(inputValue);
});

document.addEventListener("click", (e) => {
  const el = e.target;
  const todo = el.closest(".todo");
  if (!todo) return;

  const title = todo.querySelector("h3").innerText;

  if (el.classList.contains("finish-todo")) {
    todo.classList.toggle("done");
    updateTodoStatusInLocalStorage(title);
  }

  if (el.classList.contains("remove-todo")) {
    todo.classList.add("removing");
    setTimeout(() => todo.remove(), 250);
    removeTodoFromLocalStorage(title);
  }

  if (el.classList.contains("edit-todo")) {
    toggleForms();
    editInput.value = title;
    oldInputValue = title;

    document
      .querySelectorAll(".editing")
      .forEach((el) => el.classList.remove("editing"));
    todo.classList.add("editing");
  }
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newText = editInput.value.trim();
  if (newText) {
    updateTodoText(newText);
    updateTodoTextInLocalStorage(oldInputValue, newText);
  }
  toggleForms();
  document.querySelector(".editing")?.classList.remove("editing");
});

cancelEditBtn.addEventListener("click", (e) => {
  e.preventDefault();
  toggleForms();
  document.querySelector(".editing")?.classList.remove("editing");
});

searchInput.addEventListener("keyup", (e) => searchTodos(e.target.value));

eraseBtn.addEventListener("click", (e) => {
  e.preventDefault();
  searchInput.value = "";
  searchTodos("");
});

filterSelect.addEventListener("change", (e) => filterTodos(e.target.value));

toggleThemeBtn.addEventListener("click", toggleTheme);

clearAllBtn.addEventListener("click", () => {
  if (confirm("Tem certeza que deseja remover todas as tarefas?")) {
    const todos = document.querySelectorAll(".todo");
    todos.forEach((todo, index) => {
      todo.classList.add("fade-out");
      setTimeout(() => {
        todo.remove();
        if (index === todos.length - 1) {
          localStorage.removeItem("todos");
        }
      }, 400);
    });
  }
});

// ========== INICIALIZAÇÃO ========== //
applyStoredTheme();
loadTodos();
