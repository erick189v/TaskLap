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
        tasks,
        currentTaskIndex: 0, // Keeps track of which task the employee is assigned to
        currentTime: timeToMinutes(start), // Start time in minutes
    });

    // Clear inputs
    document.getElementById('employeeName').value = '';
    document.getElementById('shiftSelect').value = '';

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

        console.log(`Assigning tasks to ${employee.name}...`);

        while (assignedTasks.length < 8 || currentTime < shiftEnd) {
            const task = employee.tasks[employee.currentTaskIndex % employee.tasks.length];
            const taskStartTime = currentTime;
            const taskEndTime = currentTime + task.duration;

            if (taskEndTime <= shiftEnd || assignedTasks.length < 8) {

                assignedTasks.push({
                    task: task.task,
                    start: minutesToTime(taskStartTime),
                    end: minutesToTime(taskEndTime),
                });

                currentTime += task.duration; // Move current time forward
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


// Event listener to assign tasks and display results
document.getElementById('assignTasks').addEventListener('click', () => {
    assignTasksToEmployees();
    reverseTaskForSecondEmployee();

    const container = document.getElementById('results');
    container.innerHTML = ''; // Clear previous results

    if (employees.length === 0) {
        container.innerHTML = '<p>No employees added yet.</p>';
        return;
    }

    employees.forEach(employee => {
        const shiftDiv = document.createElement('div');
        shiftDiv.innerHTML = `<h3>${employee.name} (${employee.type})</h3>`;

        employee.tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.textContent = `${task.task} (${task.start} - ${task.end})`;
            shiftDiv.appendChild(taskDiv);
        });

        container.appendChild(shiftDiv);
    });
});
