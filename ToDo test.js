let todos = JSON.parse(localStorage.getItem('todos')) || [];
let isLatestFirst = JSON.parse(localStorage.getItem('isLatestFirst')) || true;

document.getElementById('todoInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

function toggleSection(section) {
    const content = document.getElementById(`${section}-section`);
    const header = content.previousElementSibling;
    content.classList.toggle('expanded');
    header.classList.toggle('active');
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (text) {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            timestamp: new Date()
        };
        
        todos.push(todo);
        saveTodos(); // Save to local storage
        input.value = '';
        renderTodos();
    } 
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos(); // Save to local storage
    renderTodos();
}

function toggleComplete(id) {
    todos = todos.map(todo => 
        todo.id === id ? {...todo, completed: !todo.completed} : todo
    );
    saveTodos(); // Save to local storage
    renderTodos();
}

function toggleSort() {
    isLatestFirst = !isLatestFirst;
    localStorage.setItem('isLatestFirst', JSON.stringify(isLatestFirst)); // Save sort preference
    const button = document.querySelector('.sort-button');
    button.innerHTML = isLatestFirst ? "Sort by Oldest <i class='bx bx-sort' ></i>" : "Sort by Latest <i class='bx bx-sort' ></i>";
    renderTodos();
}

function renderTodos() {
    const uncompletedList = document.getElementById('uncompletedList');
    const completedList = document.getElementById('completedList');
    uncompletedList.innerHTML = '';
    completedList.innerHTML = '';
    
    const sortedTodos = [...todos].sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);

        return isLatestFirst ? 
            dateB - dateA : 
            dateA - dateB;
    });

    let completedCount = 0;
    let uncompletedCount = 0;

    sortedTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" 
                   class="checkbox" 
                   ${todo.completed ? 'checked' : ''} 
                   onclick="toggleComplete(${todo.id})">
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})"><i class='bx bx-trash' ></i></button>
        `;
        
        if (todo.completed) {
            completedList.appendChild(li);
            completedCount++;
        } else {
            uncompletedList.appendChild(li);
            uncompletedCount++;
        }
    });

    // Update counters
    document.getElementById('completed-count').textContent = completedCount;
    document.getElementById('uncompleted-count').textContent = uncompletedCount;

    // Update the sort button label on render
    const button = document.querySelector('.sort-button');
    button.innerHTML = isLatestFirst ? "Sort by Oldest <i class='bx bx-sort' ></i>" : "Sort by Latest <i class='bx bx-sort' ></i>";
}

// Save todos to local storage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('isLatestFirst', JSON.stringify(isLatestFirst));
}

// Initial load from local storage and render
// renderTodos();
window.onload = function() {
    renderTodos();
    // restoreSectionStates();
};