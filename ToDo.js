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
    // Dezactivează orice categorie activă
    document.querySelector('.nav-item.active')?.classList.remove('active');
    searchPopup.classList.toggle('hidden');
    renderRecentPages();
  });

  const searchInput = document.querySelector('.search-popup input');

  searchInput.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();
    if (query.length < 3) {
      // Golește rezultatele dacă sunt mai puțin de 3 caractere
      main.innerHTML = '';
      return;
    }

    // Adună toate taskurile din inbox și proiecte
    let allTasks = inbox.map(task => ({ ...task, _project: 'Inbox' }));
    projects.forEach((p) => {
      p.tasks.forEach(task => {
        allTasks.push({ ...task, _project: p.name });
      });
    });

    // Filtrează taskurile după query (în titlu sau descriere)
    const results = allTasks.filter(task =>
      (task.title && task.title.toLowerCase().includes(query)) ||
      (task.desc && task.desc.toLowerCase().includes(query))
    );

    // Afișează rezultatele în main-view
    main.innerHTML = `
      <h2>Rezultate căutare</h2>
      <ul class="task-list"></ul>
      <div class="no-tasks-message" style="display:${results.length === 0 ? 'block' : 'none'}; margin-top:2rem; text-align:center; color:#888;">
        Nu s-au găsit taskuri pentru "<b>${query}</b>".
      </div>
    `;
    const ul = main.querySelector('.task-list');
    results.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' completed' : '') + (isTaskOverdue(task) ? ' overdue' : '');
      li.innerHTML = `
        <span class="task-title">${task.title}</span>
        <div class="task-desc" style="font-size:0.95em; color:#888; margin-top:2px;">${task.desc ? task.desc : ''}</div>
        <div class="task-dates" style="font-size:0.85em; color:#aaa; margin-top:2px;">
          ${task.startDate ? `<span><i class="fa fa-play"></i> ${task.startDate}</span> ` : ''}
          ${task.dueDate ? `<span><i class="fa fa-flag-checkered"></i> ${task.dueDate}</span> ` : ''}
          ${task.duration ? `<span><i class="fa fa-hourglass"></i> ${task.duration} zile</span>` : ''}
        </div>
        <span class="task-priority ${task.priority}">${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : ''}</span>
        <span class="task-category">${task.category || ''}</span>
        <span class="task-project" style="margin-left:10px; color:#e06c9f;">${task._project ? task._project : ''}</span>
      `;
      ul.appendChild(li);
    });
  });

  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchPopup.classList.add('hidden');
      // Focus pe main-view sau alt comportament dacă vrei
    }
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

      // Culoare proiect
      const colorBox = document.createElement('span');
      colorBox.className = 'color-box';
      colorBox.textContent = '#';
      colorBox.style.background = project.color || '#e06c9f';

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

      li.appendChild(colorBox);
      li.appendChild(nameSpan);
      li.appendChild(delBtn);
      projectsList.appendChild(li);
    });
  }

  /*addProjectBtn.addEventListener('click', () => {
    const name = prompt('Nume proiect nou:');
    if (name) {
      projects.push({ name, tasks: [] });
      localStorage.setItem('projects', JSON.stringify(projects));
      renderProjects();
    }
  });*/

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
      <div class="form-buttons" style="display:flex; gap:10px; margin-bottom:10px;">
        <div class="priority-group" style="position:relative;">
          <button type="button" class="priority-btn" title="Prioritate"><i class="fa-solid fa-flag"></i></button>
          <select class="priority-select" style="position:absolute; left:0; top:110%; display:none; z-index:10;">
            <option value="low" ${editTask && editTask.priority === 'low' ? 'selected' : ''}>Prioritate scăzută</option>
            <option value="medium" ${editTask && editTask.priority === 'medium' ? 'selected' : ''}>Prioritate medie</option>
            <option value="high" ${editTask && editTask.priority === 'high' ? 'selected' : ''}>Prioritate ridicată</option>
          </select>
        </div>
        <div class="date-group" style="position:relative;">
          <button type="button" class="date-btn" title="Data"><i class="fa-solid fa-calendar"></i></button>
          <div class="date-popup" style="display:none; position:absolute; left:0; top:110%; background:#fafafd; border:1px solid #eee; border-radius:8px; padding:12px 16px; z-index:10;">
            <label style="font-size:0.95em; display:block; margin-bottom:6px;">Începe la</label>
            <input type="date" class="start-date-input" style="width:100%; margin-bottom:8px;">
            <label style="font-size:0.95em; display:block; margin-bottom:6px;">Deadline</label>
            <input type="date" class="due-date-input" style="width:100%;">
          </div>
        </div>
        <div class="category-group" style="position:relative;">
          <button type="button" class="category-btn" title="Etichetă"><i class="fa-solid fa-tag"></i></button>
          <select class="category-select" style="position:absolute; left:0; top:110%; display:none; z-index:10;">
            <option value="all">Categorie</option>
            ${categoryOptions}
          </select>
        </div>
      </div>
      <div class="form-bottom-row" style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
        <div>
          <label style="font-size:0.9em;">Durată (zile)</label>
          <input type="number" min="1" class="duration-input" value="${editTask && editTask.duration ? editTask.duration : ''}">
        </div>
        ${showProjectSelect ? `<select class="project-select">${projectOptions}</select>` : ''}
        <div class="form-actions" style="margin-left:auto; display:flex; gap:10px;">
          <button class="cancel-btn">Anulează</button>
          <button class="add-btn">${editTask ? 'Salvează' : 'Adaugă sarcină'}</button>
        </div>
      </div>
    `;

    // Funcționalitate pentru butoane din .form-buttons
    const priorityBtn = card.querySelector('.priority-btn');
    const prioritySelect = card.querySelector('.priority-select');
    const categoryBtn = card.querySelector('.category-btn');
    const categorySelect = card.querySelector('.category-select');
    const dateBtn = card.querySelector('.date-btn');
    const datePopup = card.querySelector('.date-popup');

    // Variabile pentru a ține minte popup-ul deschis anterior
    let openedPopup = null;

    // Funcție utilitară pentru a închide popup-ul deschis anterior
    function closeOpenedPopup() {
      if (openedPopup && openedPopup.style) {
        openedPopup.style.display = 'none';
        openedPopup = null;
      }
    }

    // PRIORITATE
    priorityBtn.onclick = (e) => {
      e.stopPropagation();
      if (prioritySelect.style.display !== 'block') {
        closeOpenedPopup();
        prioritySelect.style.display = 'block';
        openedPopup = prioritySelect;
      } else {
        prioritySelect.style.display = 'none';
        openedPopup = null;
      }
    };
    prioritySelect.onchange = () => {
      prioritySelect.style.display = 'none';
      openedPopup = null;
    };

    // CATEGORIE
    categoryBtn.onclick = (e) => {
      e.stopPropagation();
      if (categorySelect.style.display !== 'block') {
        closeOpenedPopup();
        categorySelect.style.display = 'block';
        openedPopup = categorySelect;
      } else {
        categorySelect.style.display = 'none';
        openedPopup = null;
      }
    };
    categorySelect.onchange = () => {
      categorySelect.style.display = 'none';
      openedPopup = null;
    };

    // DATA
    dateBtn.onclick = (e) => {
      e.stopPropagation();
      if (datePopup.style.display !== 'block') {
        closeOpenedPopup();
        datePopup.style.display = 'block';
        openedPopup = datePopup;
      } else {
        datePopup.style.display = 'none';
        openedPopup = null;
      }
    };

    // Închide orice popup dacă apeși oriunde în interiorul task-card (dar nu pe butoane)
    card.onclick = function(e) {
      if (
        !e.target.closest('.priority-btn') &&
        !e.target.closest('.priority-select') &&
        !e.target.closest('.category-btn') &&
        !e.target.closest('.category-select') &&
        !e.target.closest('.date-btn') &&
        !e.target.closest('.date-popup')
      ) {
        closeOpenedPopup();
      }
    };

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
      const startDate = card.querySelector('.start-date-input').value;
      const dueDate = card.querySelector('.due-date-input').value;
      const duration = card.querySelector('.duration-input').value;
      let where = projectIdx === null && showProjectSelect
        ? card.querySelector('.project-select').value
        : (projectIdx === 'inbox' ? 'inbox' : `project-${projectIdx}`);

      if (!title) {
        card.querySelector('.title-input').focus();
        return;
      }

      // Include datele!
      const taskObj = { title, desc, priority, category, done: editTask ? editTask.done : false, startDate, dueDate, duration };

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
        } else if (where.startsWith('project-')) {
          const idx = parseInt(where.replace('project-', ''));
          projects[idx].tasks.push(taskObj);
          localStorage.setItem('projects', JSON.stringify(projects));
          selectProject(idx);
        }
      }
      overlay.remove();
    };

    const startDateInput = card.querySelector('.start-date-input');
    const dueDateInput = card.querySelector('.due-date-input');
    const durationInput = card.querySelector('.duration-input');

    // Calculează automat durata când se schimbă datele
    function updateDuration() {
      const start = startDateInput.value;
      const end = dueDateInput.value;
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
        durationInput.value = diff > 0 ? diff : '';
      }
    }
    startDateInput.addEventListener('change', updateDuration);
    dueDateInput.addEventListener('change', updateDuration);
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
      li.className = 'task-item' + (task.done ? ' completed' : '') + (isTaskOverdue(task) ? ' overdue' : '');
      li.innerHTML = `
        <input type="checkbox" class="done-checkbox" ${task.done ? 'checked' : ''}>
        <div style="flex:1;">
          <span class="task-title">${task.title}</span>
          <div class="task-desc" style="font-size:0.95em; color:#888; margin-top:2px;">${task.desc ? task.desc : ''}</div>
          <div class="task-dates" style="font-size:0.85em; color:#aaa; margin-top:2px;">
            ${task.startDate ? `<span><i class="fa fa-play"></i> ${task.startDate}</span> ` : ''}
            ${task.dueDate ? `<span><i class="fa fa-flag-checkered"></i> ${task.dueDate}</span> ` : ''}
            ${task.duration ? `<span><i class="fa fa-hourglass"></i> ${task.duration} zile</span>` : ''}
          </div>
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
      li.className = 'task-item' + (task.done ? ' completed' : '') + (isTaskOverdue(task) ? ' overdue' : '');
      li.innerHTML = `
        <input type="checkbox" class="done-checkbox" ${task.done ? 'checked' : ''}>
        <div style="flex:1;">
          <span class="task-title">${task.title}</span>
          <div class="task-desc" style="font-size:0.95em; color:#888; margin-top:2px;">${task.desc ? task.desc : ''}</div>
          <div class="task-dates" style="font-size:0.85em; color:#aaa; margin-top:2px;">
            ${task.startDate ? `<span><i class="fa fa-play"></i> ${task.startDate}</span> ` : ''}
            ${task.dueDate ? `<span><i class="fa fa-flag-checkered"></i> ${task.dueDate}</span> ` : ''}
            ${task.duration ? `<span><i class="fa fa-hourglass"></i> ${task.duration} zile</span>` : ''}
          </div>
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

        // Caută și actualizează taskul în sursa corectă
        let updated = false;
        // În inbox
        let idxInbox = inbox.findIndex(t =>
          t.title === task.title &&
          t.desc === task.desc &&
          t.startDate === task.startDate &&
          t.dueDate === task.dueDate
        );
        if (idxInbox !== -1) {
          inbox[idxInbox].done = task.done;
          localStorage.setItem('inboxTasks', JSON.stringify(inbox));
          updated = true;
        }
        // În proiecte
        if (!updated) {
          projects.forEach((proj, pIdx) => {
            let tIdx = proj.tasks.findIndex(t =>
              t.title === task.title &&
              t.desc === task.desc &&
              t.startDate === task.startDate &&
              t.dueDate === task.dueDate
            );
            if (tIdx !== -1) {
              projects[pIdx].tasks[tIdx].done = task.done;
              localStorage.setItem('projects', JSON.stringify(projects));
              updated = true;
            }
          });
        }

        // Reafișează lista filtrată
        renderTasks(tasks, projectIdx);
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
    } else if (page === 'today') {
      // Sarcini cu deadline azi SAU startDate azi
      const today = new Date().toISOString().slice(0, 10);
      let allTasks = [...inbox, ...projects.flatMap(p => p.tasks)];
      let todayTasks = allTasks.filter(task =>
        (task.dueDate === today) || (task.startDate === today)
      );
      main.innerHTML = `
        <h1>Astăzi</h1>
        <ul class="task-list"></ul>
        <div class="no-tasks-message" style="display:${todayTasks.length === 0 ? 'block' : 'none'}; margin-top:2rem; text-align:center; color:#888;">Nu există sarcini pentru azi.</div>
      `;
      if (todayTasks.length > 0) renderTasks(todayTasks, null);
    }
    else if (page === 'upcoming') {
      // Sarcini cu deadline după azi
      const today = new Date().toISOString().slice(0, 10);
      let allTasks = [...inbox, ...projects.flatMap(p => p.tasks)];
      let upcomingTasks = allTasks.filter(task => task.dueDate && task.dueDate > today);
      main.innerHTML = `
        <h1>Următoarele</h1>
        <ul class="task-list"></ul>
        <div class="no-tasks-message" style="display:${upcomingTasks.length === 0 ? 'block' : 'none'}; margin-top:2rem; text-align:center; color:#888;">Nu există sarcini viitoare.</div>
      `;
      if (upcomingTasks.length > 0) renderTasks(upcomingTasks, null);
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
      li.className = 'task-item' + (task.done ? ' completed' : '') + (isTaskOverdue(task) ? ' overdue' : '');
      li.innerHTML = `
        <input type="checkbox" class="done-checkbox" ${task.done ? 'checked' : ''}>
        <div style="flex:1;">
          <span class="task-title">${task.title}</span>
          <div class="task-desc" style="font-size:0.95em; color:#888; margin-top:2px;">${task.desc ? task.desc : ''}</div>
          <div class="task-dates" style="font-size:0.85em; color:#aaa; margin-top:2px;">
            ${task.startDate ? `<span><i class="fa fa-play"></i> ${task.startDate}</span> ` : ''}
            ${task.dueDate ? `<span><i class="fa fa-flag-checkered"></i> ${task.dueDate}</span> ` : ''}
            ${task.duration ? `<span><i class="fa fa-hourglass"></i> ${task.duration} zile</span>` : ''}
          </div>
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

  // MODAL ADĂUGARE PROIECT (pune acest cod în interiorul primului DOMContentLoaded!)
  const addProjectModal = document.getElementById('add-project-modal');
  const addProjectForm = document.getElementById('add-project-form');
  const cancelProjectBtn = document.getElementById('cancel-project');
  const projectNameInput = document.getElementById('project-name');
  const projectColorInput = document.getElementById('project-color');
  const previewColor = document.getElementById('preview-color');
  const previewName = document.getElementById('preview-name');

  // Deschide modalul
  addProjectBtn.addEventListener('click', function(e) {
    e.preventDefault();
    addProjectModal.classList.remove('hidden');
    projectNameInput.value = '';
    previewName.textContent = '';
    previewColor.style.background = projectColorInput.value;
    projectNameInput.focus();
  });

  // Închide modalul
  cancelProjectBtn.addEventListener('click', function() {
    addProjectModal.classList.add('hidden');
  });

  // Închide modalul la click în afara conținutului
  addProjectModal.addEventListener('click', function(e) {
    if (e.target === addProjectModal) {
      addProjectModal.classList.add('hidden');
    }
  });

  // Actualizează preview la schimbare denumire/culoare
  projectNameInput.addEventListener('input', function() {
    previewName.textContent = projectNameInput.value;
  });
  projectColorInput.addEventListener('change', function() {
    previewColor.style.background = projectColorInput.value;
  });

  // Adaugă proiect la submit
  addProjectForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = projectNameInput.value.trim();
    const color = projectColorInput.value;
    if (!name) return;
    projects.push({ name, color, tasks: [] });
    localStorage.setItem('projects', JSON.stringify(projects));
    renderProjects();
    addProjectModal.classList.add('hidden');
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.querySelector('.toggle-projects');
  const projectsList = document.querySelector('.projects-list');
  toggleBtn.addEventListener('click', function() {
    projectsList.classList.toggle('hidden');
    toggleBtn.classList.toggle('collapsed');
  });
});

document.getElementById('darkmode').addEventListener('change', function() {
  document.body.classList.toggle('dark', this.checked);
});

function isTaskOverdue(task) {
  const today = new Date().toISOString().slice(0, 10);
  // Dacă are dueDate, verifică dacă a trecut
  if (task.dueDate && task.dueDate < today && !task.done) return true;
  // Dacă nu are dueDate dar are startDate, verifică dacă a trecut
  if (!task.dueDate && task.startDate && task.startDate < today && !task.done) return true;
  return false;
}

function updateUserInfo() {
  const userInfo = document.querySelector('.user-info');
  const user = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName') || (user ? user.split('@')[0] : 'Profil');
  // Creează structura profilului cu săgeată și meniu dropdown
  userInfo.innerHTML = `
    <div class="profile-box" style="display:flex; align-items:center; cursor:pointer; position:relative;">
      <i class="fa-solid fa-user" style="font-size:1.2em; margin-right:7px;"></i>
      <span class="profile-name" style="font-weight:500;">${userName}</span>
      <button class="profile-toggle" aria-label="Deschide profil" style="background:none; border:none; margin-left:5px; cursor:pointer; display:flex; align-items:center;">
        <i class="fa-solid fa-chevron-right" style="transition:transform 0.2s;"></i>
      </button>
      <div class="profile-menu" style="display:none; position:absolute; top:120%; left:0; background:#fff; border:1px solid #eee; border-radius:8px; box-shadow:0 2px 8px #0001; min-width:180px; z-index:100; padding:14px 16px;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; justify-content:center;">
          <label style="font-size:1em; cursor:pointer; display:flex; align-items:center; gap:8px; margin:0;">
            <span style="margin-right:8px;">Light/Dark mode</span>
            <label class="switch" style="margin-bottom:0;">
              <input type="checkbox" id="profile-darkmode">
              <span class="slider"></span>
            </label>
          </label>
        </div>
        ${
          user
            ? `<button class="logout-btn" style="width:100%;">Logout</button>`
            : `<button class="login-btn" style="width:100%;">Login</button>`
        }
      </div>
    </div>
  `;

  const profileBox = userInfo.querySelector('.profile-box');
  const profileMenu = userInfo.querySelector('.profile-menu');
  const profileToggle = userInfo.querySelector('.profile-toggle');
  const chevronIcon = profileToggle.querySelector('i');
  const darkModeCheckbox = userInfo.querySelector('#profile-darkmode');

  // Setează starea inițială a dark mode-ului
  darkModeCheckbox.checked = document.body.classList.contains('dark');
  darkModeCheckbox.onchange = function() {
    document.body.classList.toggle('dark', this.checked);
    localStorage.setItem('darkMode', this.checked ? '1' : '0');
  };

  // Toggle meniu profil la click pe profil sau săgeată
  profileBox.onclick = function(e) {
    // Nu închide dacă se apasă pe butonul din meniu sau pe switch
    if (e.target.closest('.profile-menu button') || e.target.closest('.switch')) return;
    const opened = profileMenu.style.display === 'block';
    profileMenu.style.display = opened ? 'none' : 'block';
    chevronIcon.style.transform = opened ? 'rotate(0deg)' : 'rotate(90deg)';
    e.stopPropagation();
  };

  // Închide meniul dacă dai click în afara profilului
  document.addEventListener('click', function hideMenu(ev) {
    if (!profileBox.contains(ev.target)) {
      profileMenu.style.display = 'none';
      chevronIcon.style.transform = 'rotate(0deg)';
      document.removeEventListener('click', hideMenu);
    }
  });

  // Buton din meniu
  if (user) {
    userInfo.querySelector('.logout-btn').onclick = (e) => {
      e.stopPropagation();
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      updateUserInfo();
    };
  } else {
    userInfo.querySelector('.login-btn').onclick = (e) => {
      e.stopPropagation();
      window.location.href = './Reg/index.html';
    };
  }
}

// Apelează la încărcarea paginii
document.addEventListener('DOMContentLoaded', updateUserInfo);

