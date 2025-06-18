document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image');
    const progressBar = document.getElementById('progress');
    const progressNumbers = document.getElementById('numbers');
    const resetBtn = document.querySelector('.reset-btn');
    const congratsMsg = document.querySelector('.congrats-message');

    const toggleEmptyState = () => {
        emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
    };

    const updateProgress = () => {
        const totalTasks = taskList.children.length;
        const completedTasks = taskList.querySelectorAll('.checkbox:checked').length;
        progressBar.style.width = totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%';
        progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;

        // Show reset button when all tasks are done
        resetBtn.style.display = (totalTasks > 0 && completedTasks === totalTasks) ? 'block' : 'none';

        // Show congratulatory message
        congratsMsg.style.display = (totalTasks > 0 && completedTasks === totalTasks) ? 'block' : 'none';
    };

    const triggerConfetti = () => {
        const duration = 2 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            }));
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            }));
        }, 250);
    };

    const saveTaskToLocalStorage = () => {
        const tasks = Array.from(taskList.children).map(li => ({
            text: li.querySelector('span').textContent,
            completed: li.querySelector('.checkbox').checked
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const loadTasksFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(({ text, completed }) => addTask(text, completed));
    };

    const addTask = (text, completed = false) => {
        const taskText = text || taskInput.value.trim();
        if (!taskText) return;

        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''}>
            <span>${taskText}</span>
            <div class="task-buttons">
                <button class="edit-btn"><img src="images/edit-pen.svg" alt="Edit" width="12"></button>
                <button class="delete-btn"><img src="images/delete.png" alt="Delete" width="12"></button>
            </div>
        `;

        const checkbox = li.querySelector('.checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');

        if (completed) {
            li.classList.add('completed');
            editBtn.disabled = true;
            editBtn.style.opacity = '0.5';
            editBtn.style.pointerEvents = 'none';
        }

        checkbox.addEventListener('change', () => {
            const isChecked = checkbox.checked;
            li.classList.toggle('completed', isChecked);
            editBtn.disabled = isChecked;
            editBtn.style.opacity = isChecked ? '0.5' : '1';
            editBtn.style.pointerEvents = isChecked ? 'none' : 'auto';
            updateProgress();
            saveTaskToLocalStorage();

            if (taskList.children.length &&
                taskList.querySelectorAll('.checkbox:checked').length === taskList.children.length) {
                triggerConfetti();
            }

            toggleEmptyState();
        });

        editBtn.addEventListener('click', () => {
            if (!checkbox.checked) {
                taskInput.value = li.querySelector('span').textContent;
                li.remove();
                updateProgress();
                saveTaskToLocalStorage();
                toggleEmptyState();
            }
        });

        deleteBtn.addEventListener('click', () => {
            li.remove();
            updateProgress();
            saveTaskToLocalStorage();
            toggleEmptyState();
        });

        taskList.appendChild(li);
        taskInput.value = '';
        updateProgress();
        saveTaskToLocalStorage();
        toggleEmptyState();
    };

    addTaskBtn.addEventListener('click', () => addTask());
    taskInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') addTask();
    });

    resetBtn.addEventListener('click', () => {
        taskList.innerHTML = '';
        updateProgress();
        saveTaskToLocalStorage();
        toggleEmptyState();
        congratsMsg.style.display = 'none';
        resetBtn.style.display = 'none';
        triggerConfetti();
    });

    loadTasksFromLocalStorage();
});
