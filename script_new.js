// Workout templates by type and duration
const workoutTemplates = {
    'steady-state': {
        short: ['30 minutes continuous', '2 x 20 minutes with 2 min rest'],
        medium: ['3 x 20 minutes with 3 min rest', '2 x 30 minutes with 4 min rest', '45 minutes continuous', '60 minutes continuous', '4 x 15 minutes with 2 min rest'],
        long: ['4 x 20 minutes with 3 min rest', '3 x 30 minutes with 4 min rest', '3 x 25 minutes with 3 min rest', '4 x 30 minutes with 4 min rest', '2 x 45 minutes with 5 min rest']
    },
    'ut1': {
        short: ['30 minutes continuous', '2 x 20 minutes with 2 min rest'],
        medium: ['10, 9, 8, 7, 6, 5, 4, 3, 2, 1 minutes with 1 min rest', '45 minutes continuous', '4 x 15 minutes with 3 min rest'],
        long: ['6 x 10 minutes with 2 min rest', '30, 20, 10 minutes with 3 min rest', '3 x 20 minutes with 4 min rest', '60 minutes continuous']
    },
    'threshold': {
        short: ['8 x 3 minutes with 1.5 min rest', '6 x 4 minutes with 2 min rest'],
        medium: ['10, 9, 8, 7, 6, 5, 4, 3, 2, 1 minutes with 1 min rest', '2 x 5k with 5 min rest', '2 x (7 x 3 minutes) with 1 min rest', '3 x 3k with 6 min rest'],
        long: ['3 x 20 minutes with 5 min rest']
    },
    'sprint': {
        short: ['4 x 500m with 1 min rest', '2 x 1k with 3 min rest', '8 x 250m with 1 min rest'],
        medium: ['4 x 750m with 3 min rest', '6 x 500m with 2 min rest', '3 x 1k with 4 min rest', '2 x 1250m with 4 min rest'],
        long: ['8 x 500m with 3 min rest', '4 x 1k with 4.5 min rest', '12 x 1 minute with 1 min rest']
    },
    'wod': {
        short: ['3 rounds: 500m row + 15 burpees', '4 rounds: 300m row + 20 squats', '5 rounds: 250m row + 10 push-ups'],
        medium: ['5 rounds: 500m row + 20 burpees', '4 rounds: 750m row + 30 squats', '6 rounds: 400m row + 25 sit-ups'],
        long: ['6 rounds: 750m row + 25 burpees', '5 rounds: 1000m row + 35 squats', '8 rounds: 500m row + 30 push-ups']
    }
};

// Coaching tips
const coachingTips = [
    'Focus on your catch timing',
    'Drive with your legs first',
    'Keep your core engaged',
    'Maintain consistent stroke length',
    'Breathe rhythmically with your stroke',
    'Keep your shoulders relaxed',
    'Focus on the finish position',
    'Stay connected through the drive'
];

// User's 2k split time
let user2kSplit = null;

// Split offsets based on 2k time
const splitOffsets = {
    'steady-state': { min: 20, max: 25 },
    'ut1': { min: 14, max: 18 },
    'threshold': { min: 5, max: 8 },
    'sprint': { min: -5, max: 2 },
    'wod': { min: 10, max: 20 }
};

// Stroke rates by workout type
const strokeRates = {
    'steady-state': { min: 18, max: 22 },
    'ut1': { min: 22, max: 26 },
    'threshold': { min: 24, max: 32 },
    'sprint': { min: 32, max: 40 },
    'wod': { min: 20, max: 30 }
};

// Generate random value within range
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Format split time as MM:SS
function formatSplitTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Current workout variable
let currentWorkout = null;
let currentPage = 0;
const workoutsPerPage = 10;

// Parse workout intervals
function parseWorkoutIntervals(workout) {
    // Handle "x" format like "2 x 20 minutes" or "4 x 500m"
    if (workout.includes('x')) {
        const match = workout.match(/(\d+)\s*x/i);
        return match ? parseInt(match[1]) : 1;
    }
    
    // Handle comma-separated format like "10, 9, 8, 7, 6, 5, 4, 3, 2, 1 minutes"
    if (workout.includes(',')) {
        return workout.split(',').length;
    }
    
    // Handle continuous workouts
    if (workout.includes('continuous')) {
        return 1;
    }
    
    // Default to 1 interval
    return 1;
}

// Generate split tracker
function generateSplitTracker(workout) {
    const intervals = parseWorkoutIntervals(workout);
    
    let html = `
        <div class="split-tracker">
            <h4>📊 Track Your Performance</h4>
            <div class="split-inputs-grid">
    `;
    
    for (let i = 1; i <= intervals; i++) {
        html += `
            <div class="split-input-card">
                <label class="split-label">Interval ${i}</label>
                <input type="text" placeholder="2:30" id="split-${i}" class="split-input-field">
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    return html;
}

// LocalStorage functions
function saveWorkout() {
    if (!currentWorkout) return;
    
    // Capture split times from input fields
    const intervals = parseWorkoutIntervals(currentWorkout.workout);
    const splits = [];
    for (let i = 1; i <= intervals; i++) {
        const splitInput = document.getElementById(`split-${i}`);
        if (splitInput && splitInput.value.trim()) {
            splits.push(splitInput.value.trim());
        }
    }
    
    const saved = JSON.parse(localStorage.getItem('readyRowWorkouts') || '[]');
    saved.push({ ...currentWorkout, splits, date: new Date().toLocaleDateString() });
    localStorage.setItem('readyRowWorkouts', JSON.stringify(saved));
    loadSavedWorkouts();
}

function loadSavedWorkouts() {
    const saved = JSON.parse(localStorage.getItem('readyRowWorkouts') || '[]');
    const listDiv = document.getElementById('saved-list');
    
    if (saved.length === 0) {
        listDiv.innerHTML = '<p>No saved workouts</p>';
        return;
    }
    
    // Show only the 3 most recent workouts
    const recentWorkouts = saved.slice(-3).reverse();
    
    listDiv.innerHTML = recentWorkouts.map((workout, index) => {
        const originalIndex = saved.length - 1 - index;
        return `
            <div class="saved-workout">
                <div onclick="viewWorkoutDetails(${originalIndex})" style="flex: 1; cursor: pointer;">
                    <strong>${workout.type.toUpperCase()}</strong> - ${workout.difficulty}<br>
                    ${workout.workout}<br>
                    <small>Saved: ${workout.date}</small>
                </div>
                <button class="delete-btn" onclick="deleteWorkout(${originalIndex}); event.stopPropagation();" title="Delete workout">×</button>
            </div>
        `;
    }).join('');
    
    // Add "Show All Workouts" button if there are more than 3 workouts
    if (saved.length > 3) {
        listDiv.innerHTML += '<button type="button" id="show-all-btn" onclick="showAllWorkouts()">Show All Workouts</button>';
    }
}

function showAllWorkouts() {
    currentPage = 0; // Reset to first page
    displayWorkoutsPage();
}

function displayWorkoutsPage() {
    const saved = JSON.parse(localStorage.getItem('readyRowWorkouts') || '[]');
    const allListDiv = document.getElementById('all-workouts-list');
    
    // Hide saved workouts page and show all workouts page
    document.getElementById('saved-workouts-page').style.display = 'none';
    document.getElementById('all-workouts-page').style.display = 'block';
    
    // Calculate pagination
    const startIndex = currentPage * workoutsPerPage;
    const endIndex = startIndex + workoutsPerPage;
    const workoutsToShow = saved.slice().reverse().slice(startIndex, endIndex);
    const totalPages = Math.ceil(saved.length / workoutsPerPage);
    
    allListDiv.innerHTML = workoutsToShow.map((workout, index) => {
        const originalIndex = saved.length - 1 - (startIndex + index);
        return `
            <div class="saved-workout">
                <div onclick="viewWorkoutDetailsFromAll(${originalIndex})" style="flex: 1; cursor: pointer;">
                    <strong>${workout.type.toUpperCase()}</strong> - ${workout.difficulty}<br>
                    ${workout.workout}<br>
                    <small>Saved: ${workout.date}</small>
                </div>
                <button class="delete-btn" onclick="deleteWorkoutFromAll(${originalIndex}); event.stopPropagation();" title="Delete workout">×</button>
            </div>
        `;
    }).join('');
    
    // Add pagination controls
    let paginationHtml = '<div class="pagination-controls">';
    
    if (currentPage > 0) {
        paginationHtml += '<button onclick="previousPage()">Previous Page</button>';
    }
    
    if (currentPage < totalPages - 1) {
        paginationHtml += '<button onclick="nextPage()">Next Page</button>';
    }
    
    paginationHtml += `<span>Page ${currentPage + 1} of ${totalPages}</span></div>`;
    allListDiv.innerHTML += paginationHtml;
}

function nextPage() {
    currentPage++;
    displayWorkoutsPage();
}

function previousPage() {
    currentPage--;
    displayWorkoutsPage();
}

function disableNavigation() {
    document.getElementById('theme-toggle').disabled = true;
    document.getElementById('back-btn').disabled = true;
    document.getElementById('generator-btn').disabled = true;
    document.getElementById('saved-workouts-btn').disabled = true;
}

function enableNavigation() {
    document.getElementById('theme-toggle').disabled = false;
    document.getElementById('back-btn').disabled = false;
    document.getElementById('generator-btn').disabled = false;
    document.getElementById('saved-workouts-btn').disabled = false;
}

function goToGenerator() {
    document.getElementById('saved-workouts-page').style.display = 'none';
    document.getElementById('all-workouts-page').style.display = 'none';
    document.getElementById('workout-page').style.display = 'block';
    updateButtonVisibility('generator');
}

function viewWorkoutDetailsFromAll(index) {
    // Show details as overlay on top of all workouts page
    document.getElementById('workout-details-page').style.display = 'block';
    document.getElementById('workout-details-page').style.position = 'fixed';
    document.getElementById('workout-details-page').style.top = '0';
    document.getElementById('workout-details-page').style.left = '0';
    document.getElementById('workout-details-page').style.width = '100%';
    document.getElementById('workout-details-page').style.height = '100%';
    document.getElementById('workout-details-page').style.zIndex = '1000';
    document.getElementById('workout-details-page').style.overflow = 'auto';
    disableNavigation();
    
    const saved = JSON.parse(localStorage.getItem('readyRowWorkouts') || '[]');
    const workout = saved[index];
    
    if (!workout) return;
    
    const detailsDiv = document.getElementById('workout-details');
    
    let splitsHtml = '';
    if (workout.splits && workout.splits.length > 0) {
        // Calculate average split
        const splitSeconds = workout.splits.map(split => {
            const parts = split.split(':');
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        });
        const avgSeconds = Math.round(splitSeconds.reduce((a, b) => a + b, 0) / splitSeconds.length);
        const avgSplit = formatSplitTime(avgSeconds);
        
        splitsHtml = `
            <div class="actual-splits">
                <h4>Your Performance</h4>
                <div class="splits-grid">
                    ${workout.splits.map((split, index) => `
                        <div class="split-item">
                            <span class="split-label">Interval ${index + 1}</span>
                            <span class="split-value">${split}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="average-split">
                    <span class="split-label">Average Split</span>
                    <span class="split-value">${avgSplit}/500m</span>
                </div>
            </div>
        `;
    }
    
    detailsDiv.innerHTML = `
        <div class="workout-header">
            <h2>${workout.type.replace('-', ' ').toUpperCase()}</h2>
            <span class="workout-date">${workout.date}</span>
        </div>
        
        <div class="workout-cards">
            <div class="workout-card">
                <h4>Workout</h4>
                <p class="workout-description">${workout.workout}</p>
                <div class="workout-meta">
                    <span class="duration-badge">${workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}</span>
                </div>
            </div>
            
            <div class="workout-card">
                <h4>Targets</h4>
                <div class="target-grid">
                    <div class="target-item">
                        <span class="target-label">Stroke Rate</span>
                        <span class="target-value">${workout.strokeRate} SPM</span>
                    </div>
                    <div class="target-item">
                        <span class="target-label">Target Split</span>
                        <span class="target-value">${formatSplitTime(workout.splitTime)}/500m</span>
                    </div>
                </div>
            </div>
            
            <div class="workout-card coaching-card">
                <h4>💡 Coaching Tip</h4>
                <p class="coaching-text">${workout.tip}</p>
            </div>
        </div>
        
        ${splitsHtml}
    `;
}

function goBackToAllWorkouts() {
    document.getElementById('workout-details-page').style.display = 'none';
    document.getElementById('workout-details-page').style.position = 'static';
    enableNavigation();
}

function goBackFromAll() {
    document.getElementById('all-workouts-page').style.display = 'none';
    document.getElementById('saved-workouts-page').style.display = 'block';
}

function deleteWorkout(index) {
    const saved = JSON.parse(localStorage.getItem('readyRowWorkouts') || '[]');
    saved.splice(index, 1);
    localStorage.setItem('readyRowWorkouts', JSON.stringify(saved));
    loadSavedWorkouts();
}

function deleteWorkoutFromAll(index) {
    const saved = JSON.parse(localStorage.getItem('readyRowWorkouts') || '[]');
    saved.splice(index, 1);
    localStorage.setItem('readyRowWorkouts', JSON.stringify(saved));
    
    // Recalculate current page if needed
    const totalPages = Math.ceil(saved.length / workoutsPerPage);
    if (currentPage >= totalPages && currentPage > 0) {
        currentPage = totalPages - 1;
    }
    
    displayWorkoutsPage();
}

function viewWorkoutDetails(index) {
    const saved = JSON.parse(localStorage.getItem('readyRowWorkouts') || '[]');
    const workout = saved[index];
    
    if (!workout) return;
    
    // Show details as overlay on top of saved workouts
    document.getElementById('workout-details-page').style.display = 'block';
    document.getElementById('workout-details-page').style.position = 'fixed';
    document.getElementById('workout-details-page').style.top = '0';
    document.getElementById('workout-details-page').style.left = '0';
    document.getElementById('workout-details-page').style.width = '100%';
    document.getElementById('workout-details-page').style.height = '100%';
    document.getElementById('workout-details-page').style.zIndex = '1000';
    document.getElementById('workout-details-page').style.overflow = 'auto';
    disableNavigation();
    
    const detailsDiv = document.getElementById('workout-details');
    
    let splitsHtml = '';
    if (workout.splits && workout.splits.length > 0) {
        // Calculate average split
        const splitSeconds = workout.splits.map(split => {
            const parts = split.split(':');
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        });
        const avgSeconds = Math.round(splitSeconds.reduce((a, b) => a + b, 0) / splitSeconds.length);
        const avgSplit = formatSplitTime(avgSeconds);
        
        splitsHtml = `
            <div class="actual-splits">
                <h4>Your Performance</h4>
                <div class="splits-grid">
                    ${workout.splits.map((split, index) => `
                        <div class="split-item">
                            <span class="split-label">Interval ${index + 1}</span>
                            <span class="split-value">${split}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="average-split">
                    <span class="split-label">Average Split</span>
                    <span class="split-value">${avgSplit}/500m</span>
                </div>
            </div>
        `;
    }
    
    detailsDiv.innerHTML = `
        <div class="workout-header">
            <h2>${workout.type.replace('-', ' ').toUpperCase()}</h2>
            <span class="workout-date">${workout.date}</span>
        </div>
        
        <div class="workout-cards">
            <div class="workout-card">
                <h4>Workout</h4>
                <p class="workout-description">${workout.workout}</p>
                <div class="workout-meta">
                    <span class="duration-badge">${workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}</span>
                </div>
            </div>
            
            <div class="workout-card">
                <h4>Targets</h4>
                <div class="target-grid">
                    <div class="target-item">
                        <span class="target-label">Stroke Rate</span>
                        <span class="target-value">${workout.strokeRate} SPM</span>
                    </div>
                    <div class="target-item">
                        <span class="target-label">Target Split</span>
                        <span class="target-value">${formatSplitTime(workout.splitTime)}/500m</span>
                    </div>
                </div>
            </div>
            
            <div class="workout-card coaching-card">
                <h4>💡 Coaching Tip</h4>
                <p class="coaching-text">${workout.tip}</p>
            </div>
        </div>
        
        ${splitsHtml}
    `;
}

function goBackToWorkouts() {
    document.getElementById('workout-details-page').style.display = 'none';
    document.getElementById('workout-details-page').style.position = 'static';
    enableNavigation();
}

function clearSavedWorkouts() {
    localStorage.removeItem('readyRowWorkouts');
    loadSavedWorkouts();
}

// Setup functions
function updateButtonVisibility(currentPage) {
    document.getElementById('back-btn').style.display = currentPage === 'setup' ? 'none' : 'block';
    document.getElementById('generator-btn').style.display = (currentPage === 'generator' || currentPage === 'setup') ? 'none' : 'block';
    document.getElementById('saved-workouts-btn').style.display = (currentPage === 'saved' || currentPage === 'setup') ? 'none' : 'block';
}

function setupUser() {
    const minutes = parseInt(document.getElementById('split-minutes').value);
    const seconds = parseInt(document.getElementById('split-seconds').value);
    user2kSplit = minutes * 60 + seconds;
    
    localStorage.setItem('user2kSplit', user2kSplit);
    
    document.getElementById('setup-page').style.display = 'none';
    document.getElementById('workout-page').style.display = 'block';
    updateButtonVisibility('generator');
}

function goBackToSetup() {
    document.getElementById('setup-page').style.display = 'block';
    document.getElementById('workout-page').style.display = 'none';
    document.getElementById('saved-workouts-page').style.display = 'none';
    updateButtonVisibility('setup');
}

function showSavedWorkouts() {
    document.getElementById('workout-page').style.display = 'none';
    document.getElementById('saved-workouts-page').style.display = 'block';
    updateButtonVisibility('saved');
    loadSavedWorkouts();
}

function goBackToMain() {
    document.getElementById('saved-workouts-page').style.display = 'none';
    document.getElementById('workout-page').style.display = 'block';
    updateButtonVisibility('generator');
}

function loadUserData() {
    const saved2k = localStorage.getItem('user2kSplit');
    if (saved2k) {
        user2kSplit = parseInt(saved2k);
        // Keep setup page visible on initial load
    }
}

// Calculate target split based on 2k time and stroke rate
function calculateTargetSplit(workoutType, strokeRate) {
    const offset = splitOffsets[workoutType];
    const strokeRateRange = strokeRates[workoutType];
    const midStrokeRate = (strokeRateRange.min + strokeRateRange.max) / 2;
    
    // Adjust split based on stroke rate: lower SPM = slower split, higher SPM = faster split
    const strokeRateAdjustment = (strokeRate - midStrokeRate) * -1; // Inverse relationship
    
    const baseSplit = user2kSplit + randomInRange(offset.min, offset.max);
    return Math.round(baseSplit + strokeRateAdjustment);
}

// Generate workout
function generateWorkout() {
    const workoutType = document.getElementById('workout-type').value;
    const difficulty = document.getElementById('difficulty').value;
    
    // Get random workout template
    const templates = workoutTemplates[workoutType][difficulty];
    const workout = templates[Math.floor(Math.random() * templates.length)];
    
    // Get random coaching tip
    const tip = coachingTips[Math.floor(Math.random() * coachingTips.length)];
    
    // Calculate personalized targets
    const strokeRate = randomInRange(strokeRates[workoutType].min, strokeRates[workoutType].max);
    const splitTime = calculateTargetSplit(workoutType, strokeRate);
    
    // Store current workout
    currentWorkout = { type: workoutType, difficulty, workout, strokeRate, splitTime, tip };
    
    // Display results with fade-in
    const resultsDiv = document.getElementById('workout-results');
    resultsDiv.style.opacity = '0';
    
    resultsDiv.innerHTML = `
        <div class="workout-header">
            <h2>${workoutType.replace('-', ' ').toUpperCase()}</h2>
            <span class="workout-date">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
        </div>
        
        <div class="workout-cards">
            <div class="workout-card">
                <h4>Workout</h4>
                <p class="workout-description">${workout}</p>
            </div>
            
            <div class="workout-card">
                <h4>Targets</h4>
                <div class="target-grid">
                    <div class="target-item">
                        <span class="target-label">Stroke Rate</span>
                        <span class="target-value">${strokeRate - 1}-${strokeRate + 1} SPM</span>
                    </div>
                    <div class="target-item">
                        <span class="target-label">Target Split</span>
                        <span class="target-value">${formatSplitTime(splitTime)}/500m</span>
                    </div>
                </div>
            </div>
            
            <div class="workout-card coaching-card">
                <h4>💡 Coaching Tip</h4>
                <p class="coaching-text">${tip}</p>
            </div>
        </div>
        
        ${generateSplitTracker(workout)}
        
        <button class="save-btn" onclick="saveWorkout()">Save Workout</button>
    `;
    
    // Fade in animation
    setTimeout(() => {
        resultsDiv.style.transition = 'opacity 0.5s ease-in';
        resultsDiv.style.opacity = '1';
    }, 100);
}

// Theme toggle
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    document.getElementById('theme-toggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
    
    localStorage.setItem('theme', newTheme);
}

// Load theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Load saved workouts and theme on page load
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners
    document.getElementById('setup-btn').addEventListener('click', setupUser);
    document.getElementById('generate-btn').addEventListener('click', generateWorkout);
    document.getElementById('clear-saved-btn').addEventListener('click', clearSavedWorkouts);
    document.getElementById('back-btn').addEventListener('click', goBackToSetup);
    document.getElementById('saved-workouts-btn').addEventListener('click', showSavedWorkouts);
    document.getElementById('generator-btn').addEventListener('click', goToGenerator);
    document.getElementById('back-to-main-btn').addEventListener('click', goBackToMain);
    document.getElementById('back-to-workouts-btn').addEventListener('click', goBackToWorkouts);
    document.getElementById('back-from-all-btn').addEventListener('click', goBackFromAll);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    loadSavedWorkouts();
    loadTheme();
    loadUserData();
});