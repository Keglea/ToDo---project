const addBtn = document.getElementById("add-task-btn");
const form = document.getElementById("add-task-form");
const saveBtn = document.getElementById("save-task");
const list = document.getElementById("tasks-list");
const darkToggle = document.getElementById("darkmode");

addBtn.addEventListener("click", () => {
  form.classList.toggle("hidden");
});

saveBtn.addEventListener("click", () => {
  const title = document.getElementById("task-title").value;
  const desc = document.getElementById("task-desc").value;
  const priority = document.getElementById("task-priority").value;

  if (!title) return alert("Introdu un titlu!");

  const task = document.createElement("div");
  task.className = "task";
  task.innerHTML = `
    <h4>${title} <small>[${priority}]</small></h4>
    <p>${desc}</p>
    <button onclick="this.parentElement.classList.toggle('completed')">✔️</button>
    <button onclick="this.parentElement.remove()">🗑️</button>
  `;

  list.appendChild(task);
  form.reset();
  form.classList.add("hidden");
});

darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkToggle.checked);
});

document.querySelector('.toggle-mode label').addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');
});
