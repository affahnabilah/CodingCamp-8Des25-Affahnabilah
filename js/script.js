document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const taskInput = document.getElementById('taskInput');
    const dateInput = document.getElementById('dateInput');
    
    const addTaskBtn = document.getElementById('addTaskBtn');
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const filterStatus = document.getElementById('filterStatus');

    // Kontrol Pagination
    const rowsPerPage = 5;
    let currentPage = 1;
    let filteredTasksData = []; // Menyimpan data yang sudah difilter

    // Tombol Pagination
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');


    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let isEditing = false;
    let currentEditId = null;

    // --- Fungsi Utama ---

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Fungsi baru untuk memperbarui info halaman dan tombol
    function updatePaginationInfo() {
        const totalPages = Math.ceil(filteredTasksData.length / rowsPerPage);
        
        if (filteredTasksData.length === 0) {
            pageInfo.textContent = "No Data";
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }

        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        
        // Kontrol Tombol
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    }

    function renderTasks() {
        taskList.innerHTML = ''; 

        // LOGIKA PAGINATION DITERAPKAN DI SINI
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedTasks = filteredTasksData.slice(start, end);

        const totalColumns = 4; 

        if (paginatedTasks.length === 0) {
            taskList.innerHTML = `<tr><td colspan="${totalColumns}" class="no-task-found">No task found</td></tr>`;
            // Jika halaman kosong, pastikan info pagination diperbarui
            updatePaginationInfo(); 
            return;
        }

        paginatedTasks.forEach(task => {
            const row = document.createElement('tr');
            row.className = task.completed ? 'task-completed' : ''; 
            row.setAttribute('data-id', task.id);

            // Kolom 1: Task
            const taskCell = document.createElement('td');
            taskCell.textContent = task.task;

            // Kolom 2: Due Date
            const dateCell = document.createElement('td');
            try {
                 dateCell.textContent = new Date(task.date + 'T00:00:00').toLocaleDateString('id-ID', {
                     day: '2-digit', month: '2-digit', year: 'numeric'
                 });
            } catch {
                dateCell.textContent = task.date;
            }
            
            // Kolom 3: Status (Button)
            const statusCell = document.createElement('td');
            const statusBtn = document.createElement('button');
            statusBtn.className = `status-btn ${task.completed ? 'completed' : 'pending'}`;
            statusBtn.textContent = task.completed ? 'Completed' : 'Pending';
            statusBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                toggleStatus(task.id)
            });
            statusCell.appendChild(statusBtn);

            // Kolom 4: Actions (Edit & Delete)
            const actionsCell = document.createElement('td');
            actionsCell.className = 'action-cell';

            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                editTask(task.id)
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                deleteTask(task.id)
            });

            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);

            row.appendChild(taskCell);
            row.appendChild(dateCell);
            row.appendChild(statusCell);
            row.appendChild(actionsCell);

            taskList.appendChild(row);
        });
        
        // Setelah merender, update info pagination
        updatePaginationInfo();
    }
    
    // --- Pagination Handlers ---
    
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTasks();
        }
    });

    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredTasksData.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTasks();
        }
    });

    // --- Handler Events (Dimodifikasi untuk Pagination) ---

    addTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const dueDate = dateInput.value;
        
        if (taskText === "" || dueDate === "") {
            alert("Task and Due Date must be filled out!");
            return;
        }

        if (isEditing) {
            updateTask(currentEditId, taskText, dueDate); 
        } else {
            addTask(taskText, dueDate);
        }
    });

   document.getElementById("deleteAllBtn").addEventListener("click", function () {
    const yakin = confirm("⚠️ Apakah kamu yakin ingin menghapus semua data?");

    if (yakin) {
        // Hapus semua data localStorage
        localStorage.removeItem("tasks");  

        // Hapus tampilan di table
        document.getElementById("taskList").innerHTML = `
            <tr><td colspan="4" class="no-task-found">No task found</td></tr>
        `;

        alert("✔️ Semua data berhasil dihapus!");
    } 
});


    filterStatus.addEventListener('change', filterTasks);

    // --- CRUD Functions (Dimodifikasi untuk Pagination) ---

    function addTask(taskText, dueDate) {
        const newTask = {
            id: Date.now(), 
            task: taskText,
            date: dueDate,
            completed: false
        };
        tasks.push(newTask);
        saveTasks();
        
        // PENTING: Pindah ke halaman terakhir saat tugas baru ditambahkan
        currentPage = Math.ceil((tasks.length + 1) / rowsPerPage);
        
        filterTasks(); 
        taskInput.value = '';
        dateInput.value = '';
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        
        // Setelah menghapus, cek apakah halaman saat ini masih valid
        const totalPages = Math.ceil(filteredTasksData.length / rowsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
             currentPage = 1;
        }
        
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

    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            taskInput.value = task.task;
            dateInput.value = task.date;

            isEditing = true;
            currentEditId = id;
            addTaskBtn.innerHTML = '<i class="fas fa-save"></i> Update';
            addTaskBtn.classList.remove('add-btn');
            // Pastikan Anda punya styling untuk .edit-btn yang sesuai di CSS Anda
            addTaskBtn.classList.add('edit-btn'); 
        }
    }

    function updateTask(id, taskText, dueDate) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.task = taskText;
            task.date = dueDate;
            
            // Reset form/state
            isEditing = false;
            currentEditId = null;
            taskInput.value = '';
            dateInput.value = '';
            addTaskBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
            addTaskBtn.classList.remove('edit-btn');
            addTaskBtn.classList.add('add-btn');

            saveTasks();
            filterTasks();
        }
    }

    function filterTasks() {
        const status = filterStatus.value;
        
        let filtered = tasks;

        // Filter by Status
        if (status !== 'all') {
            const isCompleted = status === 'completed';
            filtered = filtered.filter(task => task.completed === isCompleted);
        }

        // Simpan data yang sudah difilter ke variabel global
        filteredTasksData = filtered; 
        
        // PENTING: Setelah filter, selalu reset ke halaman 1 agar user melihat dari awal
        currentPage = 1; 
        
        renderTasks();
    }

    // Initial load
    filterTasks(); 
});