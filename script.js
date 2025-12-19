// Workout templates by type and duration
const workoutTemplates = {
    'steady-state': {
        short: ['30 minutes continuous', '2 x 20 minutes with 2 min rest'],
        medium: ['3 x 20 minutes with 3 min rest', '2 x 30 minutes with 4 min rest', '45 minutes continuous', '60 minutes continuous', '4 x 15 minutes with 2 min rest'],
        long: ['4 x 20 minutes with 3 min rest', '3 x 30 minutes with 4 min rest', '3 x 25 minutes with 3 min rest', '4 x 30 minutes with 4 min rest', '2 x 45 minutes with 5 min rest']
    },
    'ut1': {
        short: ['30 minutes continuous', '2 x 20 minutes with 2 min rest', '3x10 minutes with 2 min rest', ''], 
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
        short: ['3 rounds: 500m row + 15 burpees', '4 rounds: 300m row + 20 squats', '5 rounds: 250m row + 10 push-ups', '2000m'],
        medium: ['5 rounds: 500m row + 20 burpees', '4 rounds: 750m row + 30 squats', '6 rounds: 400m row + 25 sit-ups', '6x500m with 1 min rest'],
        long: ['6 rounds: 750m row + 25 burpees', '5 rounds: 1000m row + 35 squats', '8 rounds: 500m row + 30 push-ups', '5k']
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
    
    // Handle specific formats like "30, 20, 10 minutes"
    if (workout.match(/\d+,\s*\d+/)) {
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
    
    let html = '<div class="split-tracker"><h4>Track Your Splits:</h4>';
    
    for (let i = 1; i <= intervals; i++) {
        html += `
            <div class="split-input">
                <label>Interval ${i}:</label>
                <input type="text" placeholder="2:30" id="split-${i}">
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// LocalStorage functions
function saveWorkout() {
    if (!currentWorkout) return;
    
    const saved = JSON.parse(localStorage.getItem('readyRowWorkouts') || '[]');
    saved.push({ ...currentWorkout, date: new Date().toLocaleDateString() });
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
    
    listDiv.innerHTML = saved.map(workout => `
        <div class="saved-workout">
            <strong>${workout.type.toUpperCase()}</strong> - ${workout.difficulty}<br>
            ${workout.workout}<br>
            <small>Saved: ${workout.date}</small>
        </div>
    `).join('');
}

function clearSavedWorkouts() {
    localStorage.removeItem('readyRowWorkouts');
    loadSavedWorkouts();
}

// Setup functions
function setupUser() {
    const minutes = parseInt(document.getElementById('split-minutes').value);
    const seconds = parseInt(document.getElementById('split-seconds').value);
    user2kSplit = minutes * 60 + seconds;
    
    localStorage.setItem('user2kSplit', user2kSplit);
    
    document.getElementById('setup-page').style.display = 'none';
    document.getElementById('workout-page').style.display = 'block';
}

function goBackToSetup() {
    document.getElementById('setup-page').style.display = 'block';
    document.getElementById('workout-page').style.display = 'none';
}

function loadUserData() {
    const saved2k = localStorage.getItem('user2kSplit');
    if (saved2k) {
        user2kSplit = parseInt(saved2k);
        document.getElementById('setup-page').style.display = 'none';
        document.getElementById('workout-page').style.display = 'block';
    }
}

// Calculate target split based on 2k time
function calculateTargetSplit(workoutType) {
    const offset = splitOffsets[workoutType];
    const minSplit = user2kSplit + offset.min;
    const maxSplit = user2kSplit + offset.max;
    return randomInRange(minSplit, maxSplit);
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
    const splitTime = calculateTargetSplit(workoutType);
    
    // Store current workout
    currentWorkout = { type: workoutType, difficulty, workout, strokeRate, splitTime, tip };
    
    // Display results with fade-in
    const resultsDiv = document.getElementById('workout-results');
    resultsDiv.style.opacity = '0';
    
    resultsDiv.innerHTML = `
        <h3>Your Workout</h3>
        <p><strong>Type:</strong> ${workoutType.replace('-', ' ').toUpperCase()}</p>
        <p><strong>Duration:</strong> ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
        <p><strong>Workout:</strong> ${workout}</p>
        <p><strong>Target Stroke Rate:</strong> ${strokeRate} SPM</p>
        <p><strong>Target Split:</strong> ${formatSplitTime(splitTime)}/500m</p>
        <p><strong>Coaching Tip:</strong> ${tip}</p>
        
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
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    loadSavedWorkouts();
    loadTheme();
    loadUserData();
});