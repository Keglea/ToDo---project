document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const searchBtn = document.querySelector('.search-button');
  const searchPopup = document.querySelector('.search-popup');
  const recentList = document.querySelector('.recent-list');
  const projectsList = document.querySelector('.projects-list');
  const addProjectBtn = document.querySelector('.add-project');
  const main = document.querySelector('.main-view');
  let projects = JSON.parse(localStorage.getItem('projects')) || [];
  let inbox = JSON.parse(localStorage.getItem('inboxTasks')) || [];
  let categories = JSON.parse(localStorage.getItem('categories')) || ['General', 'Personal', 'Work'];
  let filterStatus = 'all';
  let filterCategory = 'all';
  let filterPriority = 'all';

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      document.querySelector('.active')?.classList.remove('active');
      item.classList.add('active');
      const page = item.dataset.page;
      addRecentPage(page);
      showSection(page);
    });
  });

  // Înlocuiește event listener-ul pentru searchBtn cu acesta:
  const searchBtnLi = document.querySelector('.search-button').closest('li');
  searchBtnLi.addEventListener('click', () => {
    searchPopup.classList.toggle('hidden');
    renderRecentPages();
  });

  function addRecentPage(page) {
    let recent = JSON.parse(localStorage.getItem('recentPages')) || [];
    recent = recent.filter(p => p !== page);
    recent.unshift(page);
    if (recent.length > 5) recent.pop();
    localStorage.setItem('recentPages', JSON.stringify(recent));
  }

  function renderRecentPages() {
    const recent = JSON.parse(localStorage.getItem('recentPages')) || [];
    recentList.innerHTML = '';
    if (recent.length === 0) return;
    recent.forEach(page => {
      const li = document.createElement('li');
      li.textContent = formatPageName(page);
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (navItem) {
          navItem.click();
          searchPopup.classList.add('hidden');
        }
      });
      recentList.appendChild(li);
    });
  }

  function formatPageName(page) {
    const map = {
      inbox: 'Inbox',
      today: 'Astăzi',
      upcoming: 'Următoarele',
      filters: 'Filtre și etichete',
      done: 'Finalizate'
    };
    return map[page] || page;
  }

  function renderProjects() {
    projectsList.innerHTML = '';
    projects.forEach((project, idx) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.cursor = 'pointer';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = project.name;
      nameSpan.style.flex = '1';
      nameSpan.onclick = () => selectProject(idx);

      const delBtn = document.createElement('button');
      delBtn.innerHTML = '<i class="fa fa-trash"></i>';
      delBtn.title = 'Șterge proiect';
      delBtn.style.background = 'none';
      delBtn.style.border = 'none';
      delBtn.style.color = '#e06c9f';
      delBtn.style.cursor = 'pointer';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm('Ștergi acest proiect?')) {
          projects.splice(idx, 1);
          localStorage.setItem('projects', JSON.stringify(projects));
          renderProjects();
          main.innerHTML = '';
        }
      };

      li.appendChild(nameSpan);
      li.appendChild(delBtn);
      projectsList.appendChild(li);
    });
  }

  addProjectBtn.addEventListener('click', () => {
    const name = prompt('Nume proiect nou:');
    if (name) {
      projects.push({ name, tasks: [] });
      localStorage.setItem('projects', JSON.stringify(projects));
      renderProjects();
    }
  });

  document.querySelector('.add-task').addEventListener('click', showGlobalAddTaskForm);

  function showGlobalAddTaskForm() {
    showAddTaskForm(null, null, null, true);
  }

  // Formular adăugare/editare sarcină
  function showAddTaskForm(projectIdx = null, editIdx = null, editTask = null, showProjectSelect = false) {
    const overlay = document.createElement('div');
    overlay.className = 'task-overlay';
    const card = document.createElement('div');
    card.className = 'task-card';

    let categoryOptions = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    let projectOptions = `<option value="inbox">Inbox</option>`;
    projects.forEach((p, idx) => {
      projectOptions += `<option value="project-${idx}">${p.name}</option>`;
    });

    card.innerHTML = `
      <input class="title-input" type="text" placeholder="Titlu sarcină" value="${editTask ? editTask.title : ''}">
      <textarea class="description-input" placeholder="Descriere">${editTask ? editTask.desc : ''}</textarea>
      <div class="form-buttons">
        <button title="Prioritate"><i class="fa-solid fa-flag"></i></button>
        <button title="Data"><i class="fa-solid fa-calendar"></i></button>
        <button title="Etichetă"><i class="fa-solid fa-tag"></i></button>
        <button title="Comentariu"><i class="fa-solid fa-comment"></i></button>
      </div>
      <div class="form-bottom">
        <select class="priority-select">
          <option value="low" ${editTask && editTask.priority === 'low' ? 'selected' : ''}>Prioritate scăzută</option>
          <option value="medium" ${editTask && editTask.priority === 'medium' ? 'selected' : ''}>Prioritate medie</option>
          <option value="high" ${editTask && editTask.priority === 'high' ? 'selected' : ''}>Prioritate ridicată</option>
        </select>
        <select class="category-select">
          <option value="all">Categorie</option>
          ${categoryOptions}
        </select>
        ${showProjectSelect ? `<select class="project-select">${projectOptions}</select>` : ''}
        <div class="form-actions">
          <button class="cancel-btn">Anulează</button>
          <button class="add-btn">${editTask ? 'Salvează' : 'Adaugă sarcină'}</button>
        </div>
      </div>
    `;
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    if (editTask) {
      card.querySelector('.category-select').value = editTask.category || 'General';
    }

    card.querySelector('.cancel-btn').onclick = () => overlay.remove();
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

    card.querySelector('.add-btn').onclick = () => {
      const title = card.querySelector('.title-input').value.trim();
      const desc = card.querySelector('.description-input').value.trim();
      const priority = card.querySelector('.priority-select').value;
      const category = card.querySelector('.category-select').value === 'all' ? 'General' : card.querySelector('.category-select').value;
      let where = projectIdx === null && showProjectSelect
        ? card.querySelector('.project-select').value
        : (projectIdx === 'inbox' ? 'inbox' : `project-${projectIdx}`);

      if (!title) {
        card.querySelector('.title-input').focus();
        return;
      }

      const taskObj = { title, desc, priority, category, done: editTask ? editTask.done : false };

      if (editTask) {
        if (where === 'inbox') {
          inbox[editIdx] = taskObj;
          localStorage.setItem('inboxTasks', JSON.stringify(inbox));
          showSection('inbox');
        } else if (where.startsWith('project-')) {
          const idx = parseInt(where.replace('project-', ''));
          projects[idx].tasks[editIdx] = taskObj;
          localStorage.setItem('projects', JSON.stringify(projects));
          selectProject(idx);
        }
      } else {
        if (where === 'inbox') {
          inbox.push(taskObj);
          localStorage.setItem('inboxTasks', JSON.stringify(inbox));
          showSection('inbox');
        } else if (where.startsartsWith('project-')) {
          const idx = parseInt(where.replace('project-', ''));
          projects[idx].tasks.push(taskObj);
          localStorage.setItem('projects', JSON.stringify(projects));
          selectProject(idx);
        }
      }
      overlay.remove();
    };
  }

  // Selectează proiect
  function selectProject(idx) {
    filterStatus = 'all';
    filterCategory = 'all';
    filterPriority = 'all';
    main.innerHTML = `
      <h2 class="project-title" style="margin-bottom: 0.5rem; font-size: 2rem; color: #e06c9f;">${projects[idx].name}</h2>
      <div class="filter-bar" style="display: flex; gap: 10px; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <button class="filter-btn" data-status="all"><i class="fa fa-list"></i> Toate</button>
        <button class="filter-btn" data-status="done"><i class="fa fa-check"></i> Finalizate</button>
        <button class="filter-btn" data-status="pending"><i class="fa fa-clock"></i> Necompletate</button>
        <button class="add-inline" style="margin-left:auto;"><i class="fa fa-plus"></i> Adaugă sarcină</button>
      </div>
      <ul class="task-list"></ul>
      <div class="no-tasks-message" style="display:none; margin-top:2rem; text-align:center; color:#888;">Nu există taskuri în acest proiect.</div>
    `;
    renderProjectTasks(idx);

    main.querySelector('.add-inline').onclick = () => showAddTaskForm(idx);
    main.querySelectorAll('.filter-btn').forEach(btn => {
      btn.onclick = () => {
        filterStatus = btn.dataset.status;
        renderProjectTasks(idx);
      };
    });
  }

  function renderProjectTasks(idx) {
    let filtered = projects[idx].tasks.filter(task => {
      return filterStatus === 'all' ||
        (filterStatus === 'done' && task.done) ||
        (filterStatus === 'pending' && !task.done);
    });

    const ul = main.querySelector('.task-list');
    ul.innerHTML = '';
    if (filtered.length === 0) {
      main.querySelector('.no-tasks-message').style.display = 'block';
      return;
    } else {
      main.querySelector('.no-tasks-message').style.display = 'none';
    }
    filtered.forEach((task, tIdx) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' completed' : '');
      li.innerHTML = `
        <input type="checkbox" class="done-checkbox" ${task.done ? 'checked' : ''}>
        <div style="flex:1;">
          <span class="task-title">${task.title}</span>
          <div class="task-desc" style="font-size:0.95em; color:#888; margin-top:2px;">${task.desc ? task.desc : ''}</div>
        </div>
        <span class="task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
        <div class="task-actions">
          <button class="edit-btn" title="Editează"><i class="fa fa-pen"></i></button>
          <button class="delete-btn" title="Șterge"><i class="fa fa-trash"></i></button>
        </div>
      `;
      li.querySelector('.done-checkbox').onchange = e => {
        projects[idx].tasks[tIdx].done = e.target.checked;
        localStorage.setItem('projects', JSON.stringify(projects));
        renderProjectTasks(idx);
      };
      li.querySelector('.edit-btn').onclick = () => {
        showAddTaskForm(idx, tIdx, task, false);
      };
      li.querySelector('.delete-btn').onclick = () => {
        if (confirm('Ștergi această sarcină?')) {
          projects[idx].tasks.splice(tIdx, 1);
          localStorage.setItem('projects', JSON.stringify(projects));
          renderProjectTasks(idx);
        }
      };
      ul.appendChild(li);
    });
  }

  function renderTasks(tasks, projectIdx = null) {
    let filtered = tasks.filter(task => {
      let statusOk = filterStatus === 'all' ||
        (filterStatus === 'done' && task.done) ||
        (filterStatus === 'pending' && !task.done);
      let catOk = filterCategory === 'all' || task.category === filterCategory;
      let prioOk = filterPriority === 'all' || task.priority === filterPriority;
      return statusOk && catOk && prioOk;
    });

    const ul = main.querySelector('.task-list');
    ul.innerHTML = '';
    filtered.forEach((task, idx) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' completed' : '');
      li.innerHTML = `
        <input type="checkbox" class="done-checkbox" ${task.done ? 'checked' : ''}>
        <div style="flex:1;">
          <span class="task-title">${task.title}</span>
          <div class="task-desc" style="font-size:0.95em; color:#888; margin-top:2px;">${task.desc ? task.desc : ''}</div>
        </div>
        <span class="task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
        <span class="task-category">${task.category}</span>
        <div class="task-actions">
          <button class="edit-btn" title="Editează"><i class="fa fa-pen"></i></button>
          <button class="delete-btn" title="Șterge"><i class="fa fa-trash"></i></button>
        </div>
      `;
      li.querySelector('.done-checkbox').onchange = e => {
        task.done = e.target.checked;
        if (projectIdx === null) {
          inbox[idx].done = task.done;
          localStorage.setItem('inboxTasks', JSON.stringify(inbox));
          renderTasks(inbox, null);
        } else {
          projects[projectIdx].tasks[idx].done = task.done;
          localStorage.setItem('projects', JSON.stringify(projects));
          renderTasks(projects[projectIdx].tasks, projectIdx);
        }
      };
      li.querySelector('.edit-btn').onclick = () => {
        showAddTaskForm(projectIdx, idx, task, false);
      };
      li.querySelector('.delete-btn').onclick = () => {
        if (confirm('Ștergi această sarcină?')) {
          if (projectIdx === null) {
            inbox.splice(idx, 1);
            localStorage.setItem('inboxTasks', JSON.stringify(inbox));
            renderTasks(inbox, null);
          } else {
            projects[projectIdx].tasks.splice(idx, 1);
            localStorage.setItem('projects', JSON.stringify(projects));
            renderTasks(projects[projectIdx].tasks, projectIdx);
          }
        }
      };
      ul.appendChild(li);
    });
  }

  function showSection(page) {
    filterStatus = 'all';
    filterCategory = 'all';
    filterPriority = 'all';
    if (page === 'inbox') {
      main.innerHTML = `
        <div class="filter-bar">
          <button class="filter-btn" data-status="all">Toate</button>
          <button class="filter-btn" data-status="done">Finalizate</button>
          <button class="filter-btn" data-status="pending">Necompletate</button>
          <button class="add-inline">+ Adaugă sarcină</button>
        </div>
        <ul class="task-list"></ul>
        <div class="no-tasks-message" style="display:none; margin-top:2rem; text-align:center; color:#888;">Nu există taskuri în Inbox.</div>
      `;
      renderInboxTasks();

      main.querySelector('.add-inline').onclick = () => showAddTaskForm('inbox');
      main.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
          filterStatus = btn.dataset.status;
          renderInboxTasks();
        };
      });
    } else if (page === 'filters') {
      main.innerHTML = `
        <h1>Filtre și etichete</h1>
        <div class="filter-bar">
          <button class="filter-btn" data-status="all">Toate</button>
          <button class="filter-btn" data-status="done">Finalizate</button>
          <button class="filter-btn" data-status="pending">Necompletate</button>
          <select class="category-filter">
            <option value="all">Toate categoriile</option>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
          <select class="priority-filter">
            <option value="all">Toate prioritățile</option>
            <option value="low">Scăzută</option>
            <option value="medium">Medie</option>
            <option value="high">Ridicată</option>
          </select>
        </div>
        <ul class="task-list"></ul>
      `;
      let allTasks = [...inbox];
      projects.forEach(p => allTasks = allTasks.concat(p.tasks));
      renderTasks(allTasks, null);

      main.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
          filterStatus = btn.dataset.status;
          renderTasks(allTasks, null);
        };
      });
      main.querySelector('.category-filter').onchange = e => {
        filterCategory = e.target.value;
        renderTasks(allTasks, null);
      };
      main.querySelector('.priority-filter').onchange = e => {
        filterPriority = e.target.value;
        renderTasks(allTasks, null);
      };
    } else if (page === 'done') {
      main.innerHTML = `
        <h1>Finalizate</h1>
        <ul class="task-list"></ul>
        <div class="no-tasks-message" style="display:none; margin-top:2rem; text-align:center; color:#888;">Nu există sarcini finalizate.</div>
      `;
      let allTasks = [...inbox.filter(t => t.done)];
      projects.forEach(p => allTasks = allTasks.concat(p.tasks.filter(t => t.done)));
      const ul = main.querySelector('.task-list');
      if (allTasks.length === 0) {
        main.querySelector('.no-tasks-message').style.display = 'block';
      } else {
        main.querySelector('.no-tasks-message').style.display = 'none';
        renderTasks(allTasks, null);
      }
    } else {
      main.innerHTML = `<h1>${formatPageName(page)}</h1>
        <p>Nu sunt sarcini aici.</p>`;
    }
  }

  function renderInboxTasks() {
    let filtered = inbox.filter(task => {
      return filterStatus === 'all' ||
        (filterStatus === 'done' && task.done) ||
        (filterStatus === 'pending' && !task.done);
    });

    const ul = main.querySelector('.task-list');
    ul.innerHTML = '';
    if (filtered.length === 0) {
      main.querySelector('.no-tasks-message').style.display = 'block';
      return;
    } else {
      main.querySelector('.no-tasks-message').style.display = 'none';
    }
    filtered.forEach((task, idx) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' completed' : '');
      li.innerHTML = `
        <input type="checkbox" class="done-checkbox" ${task.done ? 'checked' : ''}>
        <div style="flex:1;">
          <span class="task-title">${task.title}</span>
          <div class="task-desc" style="font-size:0.95em; color:#888; margin-top:2px;">${task.desc ? task.desc : ''}</div>
        </div>
        <span class="task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
        <div class="task-actions">
          <button class="edit-btn" title="Editează"><i class="fa fa-pen"></i></button>
          <button class="delete-btn" title="Șterge"><i class="fa fa-trash"></i></button>
        </div>
      `;
      li.querySelector('.done-checkbox').onchange = e => {
        task.done = e.target.checked;
        inbox[idx].done = task.done;
        localStorage.setItem('inboxTasks', JSON.stringify(inbox));
        renderInboxTasks();
      };
      li.querySelector('.edit-btn').onclick = () => {
        showAddTaskForm('inbox', idx, task, false);
      };
      li.querySelector('.delete-btn').onclick = () => {
        if (confirm('Ștergi această sarcină?')) {
          inbox.splice(idx, 1);
          localStorage.setItem('inboxTasks', JSON.stringify(inbox));
          renderInboxTasks();
        }
      };
      ul.appendChild(li);
    });
  }

  renderProjects();
  showSection('inbox');
});

document.getElementById('darkmode').addEventListener('change', function() {
  document.body.classList.toggle('dark', this.checked);
});