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
        tasks: [],
        originalTasks: taskSets[shiftType],
        currentTaskIndex: 0, // Keeps track of which task the employee is assigned to
        currentTime: timeToMinutes(start) // Start time in minutes
    });

    createBlob(employeeName);

    // Clear inputs
    document.getElementById('employeeName').value = '';
    document.getElementById('shiftSelect').value = '';

    renderEmployees();

    console.log('Employee added:', { name: employeeName, type: shiftType, start, end, tasks });
    alert(`${employeeName} added as ${shiftType}`);
});

// Function to create and animate blobs
function createBlob(name) {
    const container = document.querySelector(".lava");

    // Create a new blob
    const blob = document.createElement("div");
    blob.classList.add("blob");
    blob.textContent = getInitials(name);

    // Randomize blob size and initial position
    const size = Math.random() * 200 + 50;
    blob.style.width = `${size}px`;
    blob.style.height = `${size}px`;
    blob.style.left = `${Math.random() * 80}vw`;
    blob.style.bottom = `${Math.random() * 80}vh`;

    // Append the blob to the container
    container.appendChild(blob);

    animateBlob(blob);
}

// Function to animate blobs with random movement
function animateBlob(blob) {
    const speed = 4000;

    setInterval(() => {
        const newTop = `${Math.random() * 80}vh`;
        const newLeft = `${Math.random() * 80}vw`;

        blob.style.transition = `top ${speed / 1000}s ease-in-out, left ${speed / 1000}s ease-in-out`;
        blob.style.top = newTop;
        blob.style.left = newLeft;
    }, speed);
}

// Utility function to get initials
function getInitials(name) {
    const nameParts = name.split(' ');
    const firstInitial = nameParts[0]?.[0].toUpperCase() || '';
    const lastInitial = nameParts[1]?.[0].toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
}

// Render employee tasks (adjusted as needed for your app)
function renderEmployees() {
    const container = document.getElementById('employeeList');
    container.innerHTML = ''; 

    employees.forEach(employee => {
        const employeeDiv = document.createElement('div');
        employeeDiv.classList.add('employee');
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.textContent = getInitials(employee.name);
        employeeDiv.appendChild(bubble);
        container.appendChild(employeeDiv);
    });
}