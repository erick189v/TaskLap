const employees = []; // Store employees dynamically
const schedule = []; // Shared schedule to track task assignments

const taskSlots = [
    { task: 'Rerack/Rover', time: 15 },
    { task: 'Check-In Station', time: 60 },
    { task: 'POS Station / Check Inventory', time: 60 },
];

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

    // Add the employee to the list
    employees.push({ name: employeeName, type: shiftType, start, end });

    // Clear inputs
    document.getElementById('employeeName').value = '';
    document.getElementById('shiftSelect').value = '';

    console.log('Employee added:', { name: employeeName, type: shiftType, start, end });
    alert(`${employeeName} added as ${shiftType}`);
});

document.getElementById('assignTasks').addEventListener('click', () => {
    function timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function minutesToTime(minutes) {
        const hours24 = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const period = hours24 >= 12 ? 'PM' : 'AM';
        const hours12 = hours24 % 12 || 12;
        return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
    }

    function assignTasksToShifts(employees, taskSlots, schedule) {
        employees.forEach(employee => {
            const shiftStart = timeToMinutes(employee.start);
            const shiftEnd = timeToMinutes(employee.end);
            const midShiftStart = timeToMinutes('08:00'); // Mid-shift start time
            let currentTime = shiftStart;
            const assignedTasks = [];
            let lastAssignedTaskIndex = -1;
    
            // Add a special task for openers
            if (employee.type === 'Opener') {
                assignedTasks.push({
                    task: 'Open the Gym',
                    start: minutesToTime(currentTime),
                    end: minutesToTime(currentTime + 30), // 30 minutes for opening
                });
                schedule.push({
                    task: 'Open the Gym',
                    start: currentTime,
                    end: currentTime + 30,
                    employee: employee.name,
                });
                currentTime += 30;
            }
    
            // Assign tasks alternately
            while (currentTime < shiftEnd - (employee.type === 'Closer' ? 45 : 0)) {
                let assigned = false;
    
                for (let i = 0; i < taskSlots.length; i++) {
                    const taskIndex = (lastAssignedTaskIndex + 1) % taskSlots.length;
                    const task = taskSlots[taskIndex];
                    const taskDuration = task.time;
    
                    // Skip "Rerack/Rover" until mid-shift starts
                    if (task.task === 'Rerack/Rover' && currentTime < midShiftStart) {
                        lastAssignedTaskIndex = taskIndex;
                        continue;
                    }
    
                    // Check if the task is already assigned during this time
                    const isTaskOccupied = schedule.some(
                        entry =>
                            entry.task === task.task &&
                            !(currentTime + taskDuration <= entry.start || currentTime >= entry.end)
                    );
    
                    if (!isTaskOccupied) {
                        assignedTasks.push({
                            task: task.task,
                            start: minutesToTime(currentTime),
                            end: minutesToTime(currentTime + taskDuration),
                        });
    
                        schedule.push({
                            task: task.task,
                            start: currentTime,
                            end: currentTime + taskDuration,
                            employee: employee.name,
                        });
    
                        currentTime += taskDuration;
                        lastAssignedTaskIndex = taskIndex; // Update last assigned task index
                        assigned = true;
                        break; // Exit loop after assigning one task
                    }
                }
    
                // Break the loop if no task could be assigned
                if (!assigned) break;
            }
    
            // Add a special task for closers
            if (employee.type === 'Closer' && currentTime + 45 <= shiftEnd) {
                assignedTasks.push({
                    task: 'Close the Gym',
                    start: minutesToTime(currentTime),
                    end: minutesToTime(currentTime + 45),
                });
                schedule.push({
                    task: 'Close the Gym',
                    start: currentTime,
                    end: currentTime + 45,
                    employee: employee.name,
                });
            }
    
            employee.tasks = assignedTasks;
    
            // Debugging: Log tasks for this employee
            console.log(`Tasks for ${employee.name}:`, assignedTasks);
        });
    }

    if (employees.length === 0) {
        alert('No employees added. Please add employees before assigning tasks.');
        return;
    }

    assignTasksToShifts(employees, taskSlots, schedule);

    const displayResults = assignments => {
        const container = document.getElementById('results');
        container.innerHTML = ''; // Clear previous results

        if (assignments.length === 0) {
            container.innerHTML = '<p>No employees found. Please add employees.</p>';
            return;
        }

        assignments.forEach(assignment => {
            const shiftDiv = document.createElement('div');
            shiftDiv.innerHTML = `<h3>${assignment.name} (${assignment.type})</h3>`;

            assignment.tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.textContent = `${task.start} - ${task.end}: ${task.task}`;
                shiftDiv.appendChild(taskDiv);
            });

            container.appendChild(shiftDiv);
        });
    };

    displayResults(employees);
});
