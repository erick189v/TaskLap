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
    const hours12 = hours24 % 12 || 12; // Convert 24-hour time to 12-hour format
    return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
}


// Function to add employees dynamically based on user input
document.getElementById('addEmployee').addEventListener('click', () => {
    const employeeName = document.getElementById('employeeName').value;
    const shiftType = document.getElementById('shiftSelect').value;
    console.log('Add Employee button clicked!');

    if (!employeeName || !shiftType) {
        alert("Please fill in all fields!");
        return;
    }

    // Determine shift start and end times based on shift type
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

    // Assign the tasks for the shift
    const tasks = taskSets[shiftType];

    // Add the employee to the list
    employees.push({ 
        name: employeeName, 
        type: shiftType, 
        start, 
        end, 
        tasks: [],
        originalTasks: taskSets[shiftType],
        currentTaskIndex: 0, // Keeps track of which task the employee is assigned to
        currentTime: timeToMinutes(start), // Start time in minutes
    });

    // Clear inputs
    document.getElementById('employeeName').value = '';
    document.getElementById('shiftSelect').value = '';

    renderEmployees();

    console.log('Employee added:', { name: employeeName, type: shiftType, start, end, tasks });
    alert(`${employeeName} added as ${shiftType}`);
});

// Function to assign at least 8 tasks to each employee
function assignTasksToEmployees() {
    employees.forEach(employee => {
        const shiftStart = timeToMinutes(employee.start);
        const shiftEnd = timeToMinutes(employee.end);
        const assignedTasks = [];
        let currentTime = shiftStart;
        employee.currentTaskIndex = 0;

        console.log(`Assigning tasks to ${employee.name}...`);

        while (assignedTasks.length < 8 || currentTime < shiftEnd) {
            const task = employee.originalTasks[employee.currentTaskIndex % employee.originalTasks.length];
            if(!task || !task.duration){
                console.log(`Invalid task encounter for ${employee.name}`);
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

                currentTime = taskEndTime; // Move current time forward
                employee.currentTaskIndex++; // Go to the next task
            } else {
                break; // End the loop if the task cannot fit
            }
        }

        employee.tasks = assignedTasks;



        console.log(`Tasks for ${employee.name}:`, assignedTasks);
    });
}

function reverseTaskForSecondEmployee() {
    const openers = employees.filter(employee => employee.type === 'Opener');
    const midshifts = employees.filter(employee => employee.type === 'Midshift');
    const closers = employees.filter(employee => employee.type === 'Closer');

    // Ensure there are at least two employees in each shift type
    if (openers.length < 2) {
        console.log("Less than two openers available.");
    } else {
        reverseTasksForEmployee(openers[1], "Opener");
    }

    if (midshifts.length < 2) {
        console.log("Less than two midshifts available.");
    } else {
        reverseTasksForEmployee(midshifts[1], "Midshift");
    }

    if (closers.length < 2) {
        console.log("Less than two closers available.");
    } else {
        reverseTasksForEmployee(closers[1], "Closer");
    }

    // Helper function to reverse tasks for a single employee
    function reverseTasksForEmployee(employee, shiftType) {
        // Save original start and end times
        const originalTimes = employee.tasks.map(task => ({
            start: task.start,
            end: task.end,
        }));

        // Reverse the task order
        const reversedTasks = employee.tasks.map(task => task.task).reverse();

        // Reassign reversed tasks to original times
        employee.tasks = reversedTasks.map((task, index) => ({
            task: task,
            start: originalTimes[index].start,
            end: originalTimes[index].end,
        }));

        // Log the result
        console.log(`Reversed tasks for ${employee.name} (${shiftType}):`);
        employee.tasks.forEach((task, index) => {
            console.log(`${index + 1}. ${task.task} (${task.start} - ${task.end})`);
        });
    }
}

function getInitials(name){
    const nameParts = name.split(' ');
    const firstInital = nameParts[0]?.[0].toUpperCase() || '';
    const lastInital = nameParts[1]?.[0].toUpperCase() || '';
    return `${firstInital}${lastInital}`;
}

function renderEmployees() {
    const container = document.getElementById('employeeList');
    container.innerHTML = ''; // Clear previous list

    employees.forEach(employee => {
        const employeeDiv = document.createElement('div');
        employeeDiv.classList.add('employee');

        // Create bubble for initials
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.textContent = getInitials(employee.name);

        // Employee name
    

        // Tooltip for tasks
        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        tooltip.textContent = employee.tasks.length
            ? employee.tasks.map(task => `${task.task} (${task.start} - ${task.end})`).join('\n')
            : 'No tasks assigned';

        // Append to employee row
        employeeDiv.appendChild(bubble);
        employeeDiv.appendChild(tooltip);

        // Append to the list container
        container.appendChild(employeeDiv);
    });
}

// Utility function to get initials
function getInitials(name) {
    const [firstName, lastName] = name.split(' ');
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}


function renderTasks() {
    const container = document.getElementById('results');
    container.innerHTML = ''; // Clear previous content

    if (employees.length === 0) {
        container.innerHTML = '<p>No employees added yet.</p>';
        return;
    }

    employees.forEach(employee => {
        const employeeDiv = document.createElement('div');
        employeeDiv.innerHTML = `<h3>${employee.name} (${employee.type})</h3>`;

        employee.tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task');
            taskDiv.textContent = `${task.task} (${task.start} - ${task.end})`;
            employeeDiv.appendChild(taskDiv);
        });

            container.appendChild(shiftDiv);
        });
    };

    displayResults(employees);
});
