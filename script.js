document.getElementById('shiftForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const employeeName = document.getElementById('employeeName').value;
    const shiftValue = document.getElementById('shiftSelect').value;

    if (!employeeName || !shiftValue) {
        alert("Please fill in everything");
        return;
    }

    const [shiftStart, shiftEnd] = shiftValue.split('-');

    const shifts = [
        { start: shiftStart, end: shiftEnd, name: employeeName },
    ];

    const taskSlots = [
        { task: 'Rerack/Rover', time: 15 },
        { task: 'Check-In Station', time: 60 },
        { task: 'POS Station', time: 60 },
    ];

    function timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
        const mins = (minutes % 60).toString().padStart(2, '0');
        return `${hours}:${mins}`;
    }

    function assignTasksToShifts(shifts, taskSlots) {
        return shifts.map(shift => {
            const shiftStart = timeToMinutes(shift.start);
            const shiftEnd = timeToMinutes(shift.end);
            let currentTime = shiftStart;

            const assignedTasks = [];

            while (currentTime < shiftEnd) {
                for (let task of taskSlots) {
                    const taskDuration = task.time;

                    if (currentTime + taskDuration <= shiftEnd) {
                        assignedTasks.push({
                            task: task.task,
                            start: minutesToTime(currentTime),
                            end: minutesToTime(currentTime + taskDuration),
                        });
                        currentTime += taskDuration;
                    } else {
                        currentTime = shiftEnd;
                        break;
                    }
                }
            }

            return { ...shift, tasks: assignedTasks };
        });
    }

    const shiftTaskAssignments = assignTasksToShifts(shifts, taskSlots);

    const displayResults = (assignments) => {
        const container = document.getElementById('results');
        container.innerHTML = ''; // Clear previous results
        assignments.forEach(shift => {
            const shiftDiv = document.createElement('div');
            shiftDiv.innerHTML = `<h3>${shift.name}'s Shift (${shift.start} - ${shift.end})</h3>`;

            shift.tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.textContent = `${task.start} - ${task.end}: ${task.task}`;
                shiftDiv.appendChild(taskDiv);
            });

            container.appendChild(shiftDiv);
        });
    };

    displayResults(shiftTaskAssignments);
});
