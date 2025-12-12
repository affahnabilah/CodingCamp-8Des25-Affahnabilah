document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const taskInput = document.getElementById('taskInput');
    const dateInput = document.getElementById('dateInput');
    // priorityInput sudah dihapus

    const addTaskBtn = document.getElementById('addTaskBtn');
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const filterStatus = document.getElementById('filterStatus');
    // filterPriority sudah dihapus

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let isEditing = false;
    let currentEditId = null;

    // --- Fungsi Utama ---

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks(filteredTasks = tasks) {
        taskList.innerHTML = ''; // Kosongkan daftar

        // Karena tabel HTML sekarang hanya 4 kolom (Task, Date, Status, Actions)
        const totalColumns = 4; 

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<tr><td colspan="${totalColumns}" class="no-task-found">No task found</td></tr>`;
            return;
        }

        filteredTasks.forEach(task => {
            const row = document.createElement('tr');
            row.className = task.completed ? 'task-completed' : '';
            row.setAttribute('data-id', task.id);

            // Kolom Task
            const taskCell = document.createElement('td');
            taskCell.textContent = task.task;

            // Kolom Due Date
            const dateCell = document.createElement('td');
            dateCell.textContent = task.date;

            // Kolom Status
            const statusCell = document.createElement('td');
            const statusBtn = document.createElement('button');
            statusBtn.className = `status-btn ${task.completed ? 'completed' : 'pending'}`;
            statusBtn.textContent = task.completed ? 'Completed' : 'Pending';
            statusBtn.addEventListener('click', () => toggleStatus(task.id));
            statusCell.appendChild(statusBtn);

            // Kolom Actions (Edit & Delete)
            const actionsCell = document.createElement('td');
            actionsCell.className = 'action-cell';

            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', () => editTask(task.id));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);

            row.appendChild(taskCell);
            row.appendChild(dateCell);
            // priorityCell dihapus
            row.appendChild(statusCell);
            row.appendChild(actionsCell);

            taskList.appendChild(row);
        });
    }

    // --- Handler Events ---

    addTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const dueDate = dateInput.value;
        // priority diambil dari form input yang sudah dihapus

        // Validasi Input
        if (taskText === "" || dueDate === "") {
            alert("Task and Due Date must be filled out!");
            return;
        }

        if (isEditing) {
            // updateTask hanya butuh 3 argumen (id, taskText, dueDate)
            updateTask(currentEditId, taskText, dueDate); 
        } else {
            // addTask hanya butuh 2 argumen (taskText, dueDate)
            addTask(taskText, dueDate);
        }
    });

    deleteAllBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to delete ALL tasks?")) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    });

    filterStatus.addEventListener('change', filterTasks);
    // filterPriority.addEventListener('change', filterTasks); dihapus

    // --- CRUD Functions ---

    // addTask diubah hanya menerima 2 argumen
    function addTask(taskText, dueDate) {
        const newTask = {
            id: Date.now(), 
            task: taskText,
            date: dueDate,
            // priority: priority, dihapus
            completed: false
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        dateInput.value = '';
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        filterTasks(); 
    }

    function toggleStatus(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            filterTasks(); 
        }
    }

    // editTask diubah tidak mengisi priorityInput
    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            taskInput.value = task.task;
            dateInput.value = task.date;
            // priorityInput.value = task.priority; dihapus

            isEditing = true;
            currentEditId = id;
            addTaskBtn.textContent = 'Update';
            addTaskBtn.classList.remove('add-btn');
            addTaskBtn.classList.add('edit-btn');
        }
    }

    // updateTask diubah hanya menerima 3 argumen
    function updateTask(id, taskText, dueDate) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.task = taskText;
            task.date = dueDate;
            // task.priority = priority; dihapus

            // Reset form/state
            isEditing = false;
            currentEditId = null;
            taskInput.value = '';
            dateInput.value = '';
            addTaskBtn.textContent = 'Add';
            addTaskBtn.classList.remove('edit-btn');
            addTaskBtn.classList.add('add-btn');

            saveTasks();
            filterTasks();
        }
    }

    // filterTasks hanya memfilter berdasarkan status
    function filterTasks() {
        const status = filterStatus.value;
        
        let filtered = tasks;

        // Filter by Status
        if (status !== 'all') {
            const isCompleted = status === 'completed';
            filtered = filtered.filter(task => task.completed === isCompleted);
        }
        // Filter by Priority dihapus

        renderTasks(filtered);
    }

    // Initial load
    renderTasks();
});