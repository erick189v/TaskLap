// Employees array to store dynamically added employees
const employees = []; 

// Task Sets for each shift type
const taskSets = {
    Opener: [
        { task: 'POS Station / Check Inventory', duration: 60 },
        { task: 'Check-In Station', duration: 60 }
    ],
    Midshift: [
        { task: 'POS Station / Check Inventory', duration: 60 },
        { task: 'Rerack/Rover', duration: 15 },
        { task: 'Check-In Station', duration: 60 }
    ],
    Closer: [
        { task: 'POS Station / Check Inventory', duration: 60 },
        { task: 'Rerack/Rover', duration: 15 },
        { task: 'Check-In Station', duration: 60 }
    ]
};

// Function to convert time in HH:MM format to minutes
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Function to convert minutes back to HH:MM AM/PM format
function minutesToTime(minutes) {
    if (isNaN(minutes) || minutes < 0) {
        console.error("Invalid minutes value:", minutes);
        return "Invalid Time";
    }
    const hours24 = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
}

// Add employees dynamically based on user input
document.getElementById('addEmployee').addEventListener('click', () => {
    const employeeName = document.getElementById('employeeName').value;
    const shiftType = document.getElementById('shiftSelect').value;

    if (!employeeName || !shiftType) {
        alert("Please fill in all fields!");
        return;
    }

    let start, end;
    if (shiftType === 'Opener') {
        start = '04:30';
        end = '13:00';
    } else if (shiftType === 'Midshift') {
        start = '08:00';
        end = '16:30';
    } else if (shiftType === 'Closer') {
        start = '14:30';
        end = '23:00';
    }

    employees.push({ 
        name: employeeName, 
        type: shiftType, 
        start, 
        end, 
        tasks: [], 
        originalTasks: taskSets[shiftType],
        currentTaskIndex: 0,
        currentTime: timeToMinutes(start)
    });

    document.getElementById('employeeName').value = '';
    document.getElementById('shiftSelect').value = '';

    renderEmployees();
});

// Assign at least 8 tasks to each employee
function assignTasksToEmployees() {
    employees.forEach(employee => {
        const shiftStart = timeToMinutes(employee.start);
        const shiftEnd = timeToMinutes(employee.end);
        const assignedTasks = [];
        let currentTime = shiftStart;
        employee.currentTaskIndex = 0;

        while (assignedTasks.length < 8 || currentTime < shiftEnd) {
            const task = employee.originalTasks[employee.currentTaskIndex % employee.originalTasks.length];
            if (!task || !task.duration) {
                break;
            }

            const taskStartTime = currentTime;
            const taskEndTime = currentTime + task.duration;

            if (taskEndTime <= shiftEnd || assignedTasks.length < 8) {
                assignedTasks.push({
                    task: task.task,
                    start: minutesToTime(taskStartTime),
                    end: minutesToTime(taskEndTime),
                });
                currentTime = taskEndTime;
                employee.currentTaskIndex++;
            } else {
                break;
            }
        }

        employee.tasks = assignedTasks;
    });
}

// Reverse tasks for the second employee of each shift type
function reverseTaskForSecondEmployee() {
    ['Opener', 'Midshift', 'Closer'].forEach(type => {
        const employeesOfType = employees.filter(e => e.type === type);
        if (employeesOfType.length > 1) {
            const secondEmployee = employeesOfType[1];
            const reversedTasks = [...secondEmployee.tasks].reverse();
            secondEmployee.tasks = reversedTasks;
        }
    });
}

// Render employee bubbles with initials
function renderEmployees() {
    const container = document.getElementById('employeeList');
    container.innerHTML = '';
    employees.forEach(employee => {
        const employeeDiv = document.createElement('div');
        employeeDiv.classList.add('employee');

        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.textContent = getInitials(employee.name);

        const name = document.createElement('span');
        name.classList.add('employee-name');
        name.textContent = `${employee.name} (${employee.type})`;

        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        tooltip.textContent = employee.tasks.length
            ? employee.tasks.map(task => `${task.task} (${task.start} - ${task.end})`).join('\n')
            : 'No tasks assigned';

        employeeDiv.appendChild(bubble);
        employeeDiv.appendChild(name);
        employeeDiv.appendChild(tooltip);
        container.appendChild(employeeDiv);
    });
}

// Utility: Get initials from a name
function getInitials(name) {
    const [firstName, lastName] = name.split(' ');
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

// Render assigned tasks
function renderTasks() {
    const container = document.getElementById('results');
    container.innerHTML = '';
    employees.forEach(employee => {
        const employeeDiv = document.createElement('div');
        employeeDiv.innerHTML = `<h3>${employee.name} (${employee.type})</h3>`;
        employee.tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task');
            taskDiv.textContent = `${task.task} (${task.start} - ${task.end})`;
            employeeDiv.appendChild(taskDiv);
        });
        container.appendChild(employeeDiv);
    });
}

// Event listener to assign tasks and render results
document.getElementById('assignTasks').addEventListener('click', () => {
    assignTasksToEmployees();
    reverseTaskForSecondEmployee();
    renderEmployees();
    renderTasks();
});
