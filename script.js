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

    createBlob(employeeName);

    // Clear inputs
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

function createBlob(name) {
    const container = document.querySelector(".lava");
    const blob = document.createElement("div");
    blob.classList.add("blob");
    blob.textContent = getInitials(name);

    const size = Math.random() * 150 + 50; // Size between 50px and 200px
    blob.style.width = `${size}px`;
    blob.style.height = `${size}px`;

    // Randomize position
    blob.style.top = `${Math.random() * 80}vh`;
    blob.style.left = `${Math.random() * 80}vw`;

    container.appendChild(blob);
    animateBlob(blob);
}


function randomPosition(existingPositions, size) {
    let top, left, overlaps;

    do {
        top = Math.random() * 80;
        left = Math.random() * 80;
        overlaps = existingPositions.some(
            ([existingTop, existingLeft]) =>
                Math.abs(existingTop - top) < size / 10 && Math.abs(existingLeft - left) < size / 10
        );
    } while (overlaps);

    existingPositions.push([top, left]);
    return { top: `${top}vh`, left: `${left}vw` };
}


// Function to animate the blob with random movement
function animateBlob(blob) {
    setInterval(() => {
        const newTop = `${Math.random() * 80}vh`;
        const newLeft = `${Math.random() * 80}vw`;
        blob.style.transition = `top 4s ease-in-out, left 4s ease-in-out`;
        blob.style.top = newTop;
        blob.style.left = newLeft;
    }, 4000); // Reduced interval
}

function checkProximity() {
    const blobs = document.querySelectorAll(".blob");

    blobs.forEach((blobA, i) => {
        blobs.forEach((blobB, j) => {
            if (i !== j) {
                const dx = blobA.offsetLeft - blobB.offsetLeft;
                const dy = blobA.offsetTop - blobB.offsetTop;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) { // Threshold for interaction
                    blobA.classList.add("proximity");
                    blobB.classList.add("proximity");
                } else {
                    blobA.classList.remove("proximity");
                    blobB.classList.remove("proximity");
                }
            }
        });
    });
}

// Run `checkProximity` every 500ms
setInterval(checkProximity, 500);



function getInitials(name){
    const nameParts = name.split(' ');
    const firstInital = nameParts[0]?.[0].toUpperCase() || '';
    const lastInital = nameParts[1]?.[0].toUpperCase() || '';
    return `${firstInital}${lastInital}`;
}

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
