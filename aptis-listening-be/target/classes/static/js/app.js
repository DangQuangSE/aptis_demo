/* ==========================================================================
   Aptis Listening Practice Hub - Core Frontend Controller
   ========================================================================== */

// --- Global Application State ---
const AppState = {
    // API Configurations
    apiBase: '/api',
    
    // Loaded Data
    tests: [],
    activeTest: null,
    activeSectionIndex: 0,
    
    // User Session
    candidateName: 'English Learner',
    
    // Active Exam Session
    examInProgress: false,
    selectedAnswers: {}, // Maps questionId -> selectedOption ("A", "B", "C", "D")
    timerInterval: null,
    secondsRemaining: 0,
    
    // Audio Player State
    audio: null,
    isPlaying: false
};

// --- Mock Data Fallback (For instant preview if server is not running) ---
const OfflineMockData = [
    {
        id: 1,
        title: "Aptis Listening Practice Test 1 (Offline Demo)",
        description: "Full-length Aptis Listening simulator including Part 1 (Information gathering), Part 2 (Expressing opinions), Part 3 (Identifying opinions), and Part 4 (Academic Monologue). Running in offline fallback mode.",
        durationMinutes: 40,
        sections: [
            {
                id: 101,
                partNumber: 1,
                instruction: "Part 1: Information Gathering. Listen to the short recording and choose the correct option (A, B, or C).",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                questions: [
                    { id: 1001, questionText: "When will the biology seminar take place?", optionA: "Tuesday morning", optionB: "Thursday afternoon", optionC: "Thursday morning" },
                    { id: 1002, questionText: "Where is the seminar being held?", optionA: "Main Hall, Room 402", optionB: "Science Building, Room 204", optionC: "Conference Hall, Room 400" }
                ]
            },
            {
                id: 102,
                partNumber: 2,
                instruction: "Part 2: Information Matching. Listen to four people expressing their opinions about remote working. Match the speakers (1-4) to their primary concern.",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                questions: [
                    { id: 1003, questionText: "What is Speaker 1's primary concern with remote working?", optionA: "Poor internet connection and technical glitches", optionB: "Difficulty separating professional life from personal time", optionC: "Lack of collaborative team environment", optionD: "Excessive commuting hours" },
                    { id: 1004, questionText: "What is Speaker 3's primary concern?", optionA: "Trouble coordinating calendars", optionB: "Decreased physical activity", optionC: "Inefficient team collaboration and lack of creative energy", optionD: "Unstable home network infrastructure" },
                    { id: 1005, questionText: "What is Speaker 4's primary concern?", optionA: "Poor collaboration tools", optionB: "Overworking and burnout", optionC: "Unstable internet connectivity and technical issues", optionD: "Increased utility bills at home" }
                ]
            },
            {
                id: 103,
                partNumber: 3,
                instruction: "Part 3: Opinion Identification. Listen to a discussion between Mark and Jessica about public transportation funding. Choose who expresses each opinion (A: Mark, B: Jessica, or C: Both).",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                questions: [
                    { id: 1006, questionText: "Who believes that public transit is currently too expensive?", optionA: "Mark only", optionB: "Jessica only", optionC: "Both Mark and Jessica" },
                    { id: 1007, questionText: "Who supports taxing private vehicles entering the city center?", optionA: "Mark only", optionB: "Both Mark and Jessica", optionC: "Jessica only" }
                ]
            },
            {
                id: 104,
                partNumber: 4,
                instruction: "Part 4: Academic Monologue. Listen to a short lecture about the impact of artificial intelligence in agriculture and answer the multiple-choice questions.",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
                questions: [
                    { id: 1008, questionText: "According to the lecturer, what is the key ecological benefit of smart sensors in farming?", optionA: "It eliminates the need for any water supply", optionB: "It reduces pesticide usage by up to 40 percent", optionC: "It automatically harvests crops overnight", optionD: "It increases the speed of crop pollination" },
                    { id: 1009, questionText: "What is the main barrier (bottleneck) to adopting AI in farming?", optionA: "High initial setup and investment costs", optionB: "Lack of available cellular network in rural fields", optionC: "The difficulty of training drones to fly", optionD: "Negative public perception of automated food" }
                ]
            }
        ]
    }
];

// Offline Mock Results Generator for Grading in Demo Mode
function generateOfflineGrade(testId, candidateName, userAnswers) {
    const isTest1 = testId === 1;
    const correctMap = isTest1 ? {
        1001: "B", 1002: "A",
        1003: "B", 1004: "C", 1005: "C",
        1006: "C", 1007: "B",
        1008: "B", 1009: "A"
    } : {};

    const explanationsMap = {
        1001: "The speaker mentions the seminar is moved from Tuesday morning to Thursday afternoon.",
        1002: "The speaker explicitly states: 'The venue is still the main hall, Room 402'.",
        1003: "Speaker 1 states that the 'blur between home life and professional life makes it really hard to switch off'.",
        1004: "Speaker 3 mentions that the 'team struggles with collaboration' and video calls lack 'organic energy'.",
        1005: "Speaker 4 talks about 'home internet connection' being 'highly unstable' and cutting out.",
        1006: "Jessica says 'it's way too expensive' and Mark replies 'I completely agree that it's pricey'.",
        1007: "Jessica proposes taxing private vehicles entering the center, to which Mark expresses agreement afterwards as a solution.",
        1008: "The professor points out that this 'targeted approach has reduced pesticide usage by up to 40 percent'.",
        1009: "The lecturer mentions: 'The bottleneck, however, remains the high upfront investment cost'."
    };

    const transcriptsMap = {
        101: "Speaker: Hello, this is a message for Sarah. I'm calling to let you know that the biology seminar has been moved from Tuesday morning to Thursday afternoon at 3:00 PM. The venue is still the main hall, Room 402. Please let me know if you can still make it. Thanks!",
        102: "Speaker 1: I love remote work, but the constant blur between home life and professional life makes it really hard to switch off in the evening. I end up working late.\nSpeaker 2: Saving two hours of commuting daily has changed my life.\nSpeaker 3: Our team struggles with collaboration now. Brainstorming over video calls just doesn't have the same organic energy as being in one room.\nSpeaker 4: My main issue is my home internet connection. It is highly unstable, and during crucial meetings, my audio cuts out constantly.",
        103: "Jessica: I strongly believe the city council should subsidize bus fares. Right now, it's way too expensive for students.\nMark: I completely agree that it's pricey, Jessica. However, the council has a massive budget deficit.\nJessica: True, but transit is crucial for the economy. We should tax private vehicles entering the center to offset this.\nMark: Ah, a congestion charge! That's actually a brilliant solution.",
        104: "Professor: Welcome back. Today, we look at modern agricultural automation. With smart sensors and AI drone mapping, farmers can now identify pest outbreaks before they spread. This targeted approach has reduced pesticide usage by up to 40 percent in testing fields, which is phenomenal for ecological preservation. The bottleneck, however, remains the high upfront investment cost."
    };

    let score = 0;
    let totalQuestions = 0;
    const results = {};
    const correctAnswers = {};

    for (const qId in correctMap) {
        totalQuestions++;
        const correct = correctMap[qId];
        correctAnswers[qId] = correct;
        
        const user = userAnswers[qId];
        if (user && user.trim().toUpperCase() === correct) {
            score++;
            results[qId] = true;
        } else {
            results[qId] = false;
        }
    }

    return {
        submissionId: Date.now(),
        testId: testId,
        candidateName: candidateName,
        score: score,
        totalQuestions: totalQuestions,
        results: results,
        correctAnswers: correctAnswers,
        submittedAt: new Date().toISOString(),
        isMock: true,
        mockExplanations: explanationsMap,
        mockTranscripts: transcriptsMap
    };
}

// --- DOM elements ---
const DOM = {
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    btnLogoHome: document.getElementById('btn-logo-home'),
    userDisplayName: document.getElementById('user-display-name'),
    inputCandidateName: document.getElementById('input-candidate-name'),
    
    // View sections
    viewLanding: document.getElementById('view-landing'),
    viewExam: document.getElementById('view-exam'),
    viewResults: document.getElementById('view-results'),
    
    // Containers
    testsContainer: document.getElementById('tests-container'),
    
    // Exam Elements
    examTestTitle: document.getElementById('exam-test-title'),
    progressIndicator: document.getElementById('progress-indicator'),
    examProgressBar: document.getElementById('exam-progress-bar'),
    examStepsList: document.getElementById('exam-steps-list'),
    timerDisplay: document.getElementById('timer-display'),
    btnSubmitExam: document.getElementById('btn-submit-exam'),
    btnQuitExam: document.getElementById('btn-quit-exam'),
    
    // Exam Section Card
    sectionPartTag: document.getElementById('section-part-tag'),
    sectionInstruction: document.getElementById('section-instruction'),
    examQuestionsList: document.getElementById('exam-questions-list'),
    btnSectionPrev: document.getElementById('btn-section-prev'),
    btnSectionNext: document.getElementById('btn-section-next'),
    
    // Audio Player Elements
    nativeAudio: document.getElementById('native-audio'),
    btnAudioPlay: document.getElementById('btn-audio-play'),
    timelineSlider: document.getElementById('timeline-slider'),
    timelineFillBar: document.getElementById('timeline-fill-bar'),
    timelineHandle: document.getElementById('timeline-handle'),
    audioTimeCurrent: document.getElementById('audio-time-current'),
    audioTimeDuration: document.getElementById('audio-time-duration'),
    btnAudioMute: document.getElementById('btn-audio-mute'),
    volumeRange: document.getElementById('volume-range'),
    
    // Results Elements
    resultsScoreCircle: document.getElementById('results-score-circle'),
    resultsScoreText: document.getElementById('results-score-text'),
    resultsPercentText: document.getElementById('results-percent-text'),
    resultGreeting: document.getElementById('result-greeting'),
    resultCandidateName: document.getElementById('result-candidate-name'),
    resultTestTitle: document.getElementById('result-test-title'),
    resultDate: document.getElementById('result-date'),
    resultsTierBadge: document.getElementById('results-tier-badge'),
    btnBackToHome: document.getElementById('btn-back-to-home'),
    resultsReviewsList: document.getElementById('results-reviews-list'),
    leaderboardTbody: document.getElementById('leaderboard-tbody')
};

// --- Initialization & Theme Loader ---
function initApp() {
    setupEventListeners();
    loadTheme();
    fetchTests();
}

function loadTheme() {
    const savedTheme = localStorage.getItem('aptis-theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('aptis-theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = DOM.themeToggleBtn.querySelector('i');
    if (theme === 'light') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

// --- Navigation & View Switching ---
function showView(viewId) {
    const views = [DOM.viewLanding, DOM.viewExam, DOM.viewResults];
    views.forEach(view => {
        if (view.id === viewId) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Fetch Tests API ---
async function fetchTests() {
    try {
        const response = await fetch(`${AppState.apiBase}/tests`);
        if (!response.ok) throw new Error('API fetch error');
        AppState.tests = await response.json();
    } catch (error) {
        console.warn('Server offline or connection error. Falling back to offline practice test demo.', error);
        AppState.tests = OfflineMockData;
    }
    renderTestCards();
}

function renderTestCards() {
    DOM.testsContainer.innerHTML = '';
    
    if (AppState.tests.length === 0) {
        DOM.testsContainer.innerHTML = `
            <div class="glass-card" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: var(--warning); margin-bottom: 15px;"></i>
                <h3>No tests available</h3>
                <p style="color: var(--text-secondary);">No mock tests found in the database. Please restart Spring Boot backend or refresh.</p>
            </div>
        `;
        return;
    }
    
    AppState.tests.forEach(test => {
        const totalQ = test.sections.reduce((sum, sec) => sum + sec.questions.length, 0);
        
        const card = document.createElement('div');
        card.className = 'glass-card test-card';
        card.innerHTML = `
            <div class="test-card-body">
                <h3>${test.title}</h3>
                <p>${test.description || 'Take an interactive diagnostic assessment to practice English communication levels.'}</p>
            </div>
            <div class="test-card-footer">
                <div class="test-card-meta">
                    <span><i class="fa-regular fa-clock"></i> ${test.durationMinutes} mins</span>
                    <span><i class="fa-regular fa-circle-question"></i> ${totalQ} questions</span>
                </div>
                <button class="btn btn-primary btn-start-test" data-id="${test.id}">
                    Start Test <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
        
        DOM.testsContainer.appendChild(card);
    });
}

// --- Start Practice Test ---
function startExamSession(testId) {
    const nameInput = DOM.inputCandidateName.value.trim();
    if (!nameInput) {
        alert('Please enter your name to begin the exam session.');
        DOM.inputCandidateName.focus();
        return;
    }
    
    AppState.candidateName = nameInput;
    DOM.userDisplayName.textContent = nameInput;
    
    const selectedTest = AppState.tests.find(t => t.id === testId);
    if (!selectedTest) return;
    
    // Set Exam state
    AppState.activeTest = selectedTest;
    AppState.activeSectionIndex = 0;
    AppState.examInProgress = true;
    AppState.selectedAnswers = {};
    
    // Setup Timer
    AppState.secondsRemaining = selectedTest.durationMinutes * 60;
    updateTimerDisplay();
    clearInterval(AppState.timerInterval);
    AppState.timerInterval = setInterval(tickTimer, 1000);
    
    // Update Side Panel and load first section
    DOM.examTestTitle.textContent = selectedTest.title;
    renderExamSteps();
    loadSection(0);
    
    // Switch Screen
    showView('view-exam');
}

function renderExamSteps() {
    DOM.examStepsList.innerHTML = '';
    AppState.activeTest.sections.forEach((sec, idx) => {
        const btn = document.createElement('button');
        btn.className = `step-btn ${idx === AppState.activeSectionIndex ? 'active' : ''}`;
        btn.id = `step-btn-${idx}`;
        btn.innerHTML = `
            <span>Part ${sec.partNumber}: Section ${idx + 1}</span>
            <div class="step-check"><i class="fa-solid fa-check"></i></div>
        `;
        btn.addEventListener('click', () => {
            if (AppState.examInProgress) loadSection(idx);
        });
        DOM.examStepsList.appendChild(btn);
    });
}

// --- Load Active Exam Section ---
function loadSection(index) {
    if (!AppState.activeTest || index < 0 || index >= AppState.activeTest.sections.length) return;
    
    // Pause previous audio
    stopAudio();
    
    AppState.activeSectionIndex = index;
    
    // Highlight sidebar step buttons
    AppState.activeTest.sections.forEach((_, idx) => {
        const btn = document.getElementById(`step-btn-${idx}`);
        if (btn) {
            btn.classList.toggle('active', idx === index);
        }
    });
    
    const section = AppState.activeTest.sections[index];
    
    // Update header info
    DOM.sectionPartTag.textContent = `PART ${section.partNumber}`;
    DOM.sectionInstruction.textContent = section.instruction;
    
    // Update Navigation Progress
    DOM.progressIndicator.textContent = `Part ${section.partNumber} of ${AppState.activeTest.sections.length}`;
    const pct = ((index + 1) / AppState.activeTest.sections.length) * 100;
    DOM.examProgressBar.style.width = `${pct}%`;
    
    // Setup Audio Player URL
    AppState.audio = DOM.nativeAudio;
    AppState.audio.src = section.audioUrl;
    AppState.audio.load();
    resetAudioControls();
    
    // Render Questions
    renderQuestions(section.questions);
    
    // Handle Navigation Buttons
    DOM.btnSectionPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
    if (index === AppState.activeTest.sections.length - 1) {
        DOM.btnSectionNext.innerHTML = `Finish Review <i class="fa-solid fa-flag-checkered"></i>`;
    } else {
        DOM.btnSectionNext.innerHTML = `Next Part <i class="fa-solid fa-chevron-right"></i>`;
    }
}

function renderQuestions(questions) {
    DOM.examQuestionsList.innerHTML = '';
    
    questions.forEach((q, idx) => {
        const qBlock = document.createElement('div');
        qBlock.className = 'question-block';
        
        let optionsHTML = '';
        const options = [
            { key: 'A', text: q.optionA },
            { key: 'B', text: q.optionB },
            { key: 'C', text: q.optionC }
        ];
        if (q.optionD) {
            options.push({ key: 'D', text: q.optionD });
        }
        
        options.forEach(opt => {
            const isSelected = AppState.selectedAnswers[q.id] === opt.key;
            optionsHTML += `
                <div class="option-item ${isSelected ? 'selected' : ''}" data-q-id="${q.id}" data-opt-key="${opt.key}">
                    <div class="option-radio">
                        <div class="option-radio-dot"></div>
                    </div>
                    <span class="option-text"><strong>${opt.key}.</strong> ${opt.text}</span>
                </div>
            `;
        });
        
        qBlock.innerHTML = `
            <div class="question-num">Question ${idx + 1}</div>
            <div class="question-text">${q.questionText}</div>
            <div class="options-deck">${optionsHTML}</div>
        `;
        
        DOM.examQuestionsList.appendChild(qBlock);
    });
    
    // Attach selection handlers
    document.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', function() {
            const qId = parseInt(this.getAttribute('data-q-id'));
            const optKey = this.getAttribute('data-opt-key');
            
            // Toggle selection class in siblings
            const deck = this.parentElement;
            deck.querySelectorAll('.option-item').forEach(sibling => sibling.classList.remove('selected'));
            this.classList.add('selected');
            
            // Record answer selection
            AppState.selectedAnswers[qId] = optKey;
            
            // Check if active section questions are fully answered to mark step
            checkSectionAnsweredStatus();
        });
    });
}

function checkSectionAnsweredStatus() {
    const activeSection = AppState.activeTest.sections[AppState.activeSectionIndex];
    const allAnswered = activeSection.questions.every(q => AppState.selectedAnswers[q.id]);
    
    const stepBtn = document.getElementById(`step-btn-${AppState.activeSectionIndex}`);
    if (stepBtn) {
        stepBtn.classList.toggle('answered', allAnswered);
    }
}

// --- Audio Player Controller ---
function toggleAudio() {
    if (!AppState.audio) return;
    
    if (AppState.isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function playAudio() {
    AppState.audio.play()
        .then(() => {
            AppState.isPlaying = true;
            DOM.btnAudioPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
            DOM.btnAudioPlay.classList.add('playing');
        })
        .catch(err => console.error('Audio play blocked:', err));
}

function pauseAudio() {
    AppState.audio.pause();
    AppState.isPlaying = false;
    DOM.btnAudioPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
    DOM.btnAudioPlay.classList.remove('playing');
}

function stopAudio() {
    if (AppState.audio) {
        AppState.audio.pause();
        AppState.audio.currentTime = 0;
        AppState.isPlaying = false;
    }
}

function resetAudioControls() {
    AppState.isPlaying = false;
    DOM.btnAudioPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
    DOM.btnAudioPlay.classList.remove('playing');
    DOM.timelineFillBar.style.width = '0%';
    DOM.timelineHandle.style.left = '0%';
    DOM.audioTimeCurrent.textContent = '0:00';
    DOM.audioTimeDuration.textContent = '0:00';
}

function updateAudioProgress() {
    if (!AppState.audio) return;
    
    const curr = AppState.audio.currentTime;
    const dur = AppState.audio.duration || 0;
    
    if (dur > 0) {
        const pct = (curr / dur) * 100;
        DOM.timelineFillBar.style.width = `${pct}%`;
        DOM.timelineHandle.style.left = `${pct}%`;
        DOM.audioTimeCurrent.textContent = formatAudioTime(curr);
        DOM.audioTimeDuration.textContent = formatAudioTime(dur);
    }
}

function setAudioPosition(e) {
    if (!AppState.audio) return;
    const rect = DOM.timelineSlider.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const pct = Math.max(0, Math.min(1, clickX / width));
    
    const dur = AppState.audio.duration || 0;
    AppState.audio.currentTime = pct * dur;
    
    DOM.timelineFillBar.style.width = `${pct * 100}%`;
    DOM.timelineHandle.style.left = `${pct * 100}%`;
}

function formatAudioTime(secs) {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
}

// --- Timer Control ---
function tickTimer() {
    if (AppState.secondsRemaining <= 0) {
        clearInterval(AppState.timerInterval);
        alert('Time limit reached! Your test is submitting automatically.');
        submitTestAnswers();
        return;
    }
    
    AppState.secondsRemaining--;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const mins = Math.floor(AppState.secondsRemaining / 60);
    const secs = AppState.secondsRemaining % 60;
    DOM.timerDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    
    // Add urgency color
    if (AppState.secondsRemaining < 120) {
        DOM.timerDisplay.style.color = 'var(--danger)';
    } else {
        DOM.timerDisplay.style.color = '';
    }
}

// --- Submit Practice Test API ---
async function submitTestAnswers() {
    if (!AppState.examInProgress) return;
    
    // Stop timers & audio
    clearInterval(AppState.timerInterval);
    stopAudio();
    AppState.examInProgress = false;
    
    // Prepare payload
    const payload = {
        candidateName: AppState.candidateName,
        answers: AppState.selectedAnswers
    };
    
    let result = null;
    
    try {
        const response = await fetch(`${AppState.apiBase}/tests/${AppState.activeTest.id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('API submission error');
        result = await response.json();
    } catch (error) {
        console.warn('Server offline. Simulating local scoring results for demo.', error);
        result = generateOfflineGrade(AppState.activeTest.id, AppState.candidateName, AppState.selectedAnswers);
    }
    
    renderTestResults(result);
}

// --- Render Test Results Screen ---
function renderTestResults(res) {
    // 1. Grade Summary Info
    DOM.resultCandidateName.textContent = res.candidateName;
    DOM.resultTestTitle.textContent = AppState.activeTest.title;
    DOM.resultDate.textContent = new Date(res.submittedAt).toLocaleString();
    DOM.resultsScoreText.textContent = `${res.score} / ${res.totalQuestions}`;
    
    const accuracy = res.totalQuestions > 0 ? Math.round((res.score / res.totalQuestions) * 100) : 0;
    DOM.resultsPercentText.textContent = `${accuracy}%`;
    
    // Animate conic-gradient radial border
    DOM.resultsScoreCircle.style.background = `conic-gradient(var(--primary) ${accuracy}%, rgba(255, 255, 255, 0.05) ${accuracy}%)`;
    
    // Greeting & CEFR level tier mapping
    let level = 'Aptis A1/A2 Basic';
    let greeting = 'Keep practicing, you can do it!';
    
    if (accuracy >= 85) {
        level = 'Aptis C (Advanced Master)';
        greeting = 'Excellent Mastery! Highly Fluent!';
        DOM.resultsTierBadge.style.color = 'var(--secondary)';
        DOM.resultsTierBadge.style.borderColor = 'var(--secondary)';
        DOM.resultsTierBadge.style.backgroundColor = 'var(--secondary-glow)';
    } else if (accuracy >= 65) {
        level = 'Aptis B2 Upper-Intermediate';
        greeting = 'Outstanding! Strong Professional Competency!';
        DOM.resultsTierBadge.style.color = 'var(--primary)';
        DOM.resultsTierBadge.style.borderColor = 'var(--primary)';
        DOM.resultsTierBadge.style.backgroundColor = 'var(--primary-glow)';
    } else if (accuracy >= 45) {
        level = 'Aptis B1 Intermediate';
        greeting = 'Good attempt! Solid foundation.';
        DOM.resultsTierBadge.style.color = 'var(--warning)';
        DOM.resultsTierBadge.style.borderColor = 'var(--warning)';
        DOM.resultsTierBadge.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
    }
    
    DOM.resultGreeting.textContent = greeting;
    DOM.resultsTierBadge.textContent = level;
    
    // 2. Diagnostic Review Cards
    DOM.resultsReviewsList.innerHTML = '';
    
    AppState.activeTest.sections.forEach(sec => {
        const secBlock = document.createElement('div');
        secBlock.className = 'review-section-block';
        
        let questionsHTML = '';
        sec.questions.forEach((q, idx) => {
            const isCorrect = res.results[q.id];
            const userChoice = AppState.selectedAnswers[q.id] || 'None';
            const correctAnswer = res.correctAnswers[q.id];
            const isOffline = res.isMock;
            
            // Explanations & Transcripts mapping fallback
            const explanation = isOffline ? res.mockExplanations[q.id] : (q.explanation || 'Refer to dialogue clues.');
            
            let optsHTML = '';
            const opts = [
                { key: 'A', text: q.optionA },
                { key: 'B', text: q.optionB },
                { key: 'C', text: q.optionC }
            ];
            if (q.optionD) {
                opts.push({ key: 'D', text: q.optionD });
            }
            
            opts.forEach(opt => {
                let pillClass = '';
                if (opt.key === correctAnswer) {
                    pillClass = 'correct-ans';
                } else if (opt.key === userChoice && !isCorrect) {
                    pillClass = 'selected-wrong';
                }
                optsHTML += `
                    <div class="review-opt-pill ${pillClass}">
                        <strong>${opt.key}.</strong> ${opt.text} 
                        ${opt.key === correctAnswer ? ' <i class="fa-solid fa-circle-check"></i> (Correct Answer)' : ''}
                        ${opt.key === userChoice && !isCorrect ? ' <i class="fa-solid fa-circle-xmark"></i> (Your Incorrect Choice)' : ''}
                    </div>
                `;
            });
            
            questionsHTML += `
                <div class="review-question-card ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-q-text">Q${idx + 1}. ${q.questionText}</div>
                    <div class="review-options-grid">${optsHTML}</div>
                    <div class="review-explanation">
                        <i class="fa-solid fa-lightbulb"></i> <strong>Explanation:</strong> ${explanation}
                    </div>
                </div>
            `;
        });
        
        const transcriptText = res.isMock ? res.mockTranscripts[sec.id] : (sec.transcript || 'Audio transcript is accessible on local server.');
        
        secBlock.innerHTML = `
            <div class="review-section-header">Part ${sec.partNumber} Analysis</div>
            ${questionsHTML}
            <div class="review-transcript-wrapper">
                <h5>Audio Transcript</h5>
                <p class="review-transcript-text">${transcriptText}</p>
            </div>
        `;
        DOM.resultsReviewsList.appendChild(secBlock);
    });
    
    // 3. Load performance history table
    fetchLeaderboard(res.testId);
    
    // Switch Screen
    showView('view-results');
}

// --- Fetch Leaderboard History ---
async function fetchLeaderboard(testId) {
    try {
        const response = await fetch(`${AppState.apiBase}/tests/${testId}/submissions`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        renderLeaderboard(data);
    } catch (e) {
        // Safe offline simulated local memory
        let localHistory = JSON.parse(localStorage.getItem(`aptis-history-${testId}`)) || [];
        // Add new attempt
        localHistory.unshift({
            candidateName: AppState.candidateName,
            score: AppState.selectedAnswers ? Object.keys(AppState.selectedAnswers).length : 0, // simple estimate
            totalQuestions: AppState.activeTest.sections.reduce((s, sec) => s + sec.questions.length, 0),
            submittedAt: new Date().toISOString()
        });
        localStorage.setItem(`aptis-history-${testId}`, JSON.stringify(localHistory.slice(0, 10)));
        renderLeaderboard(localHistory);
    }
}

function renderLeaderboard(submissions) {
    DOM.leaderboardTbody.innerHTML = '';
    
    if (!submissions || submissions.length === 0) {
        DOM.leaderboardTbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">No attempts recorded yet.</td>
            </tr>
        `;
        return;
    }
    
    submissions.forEach((sub, idx) => {
        const pct = Math.round((sub.score / sub.totalQuestions) * 100);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${idx + 1}</strong></td>
            <td>${sub.candidateName}</td>
            <td>${sub.score} / ${sub.totalQuestions}</td>
            <td><span style="color: var(--primary); font-weight:600;">${pct}%</span></td>
            <td>${new Date(sub.submittedAt).toLocaleDateString()}</td>
        `;
        DOM.leaderboardTbody.appendChild(row);
    });
}

// --- Event Listeners Binder ---
function setupEventListeners() {
    // Theme Switch
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Logo Click Home
    DOM.btnLogoHome.addEventListener('click', () => {
        if (AppState.examInProgress) {
            if (confirm('An exam is currently active. Leaving will lose your progress. Proceed?')) {
                clearInterval(AppState.timerInterval);
                stopAudio();
                AppState.examInProgress = false;
                showView('view-landing');
            }
        } else {
            showView('view-landing');
        }
    });
    
    // Main landing card Delegation for start test button
    DOM.testsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-start-test');
        if (btn) {
            const testId = parseInt(btn.getAttribute('data-id'));
            startExamSession(testId);
        }
    });
    
    // Exam Card prev/next navigation
    DOM.btnSectionPrev.addEventListener('click', () => {
        if (AppState.activeSectionIndex > 0) {
            loadSection(AppState.activeSectionIndex - 1);
        }
    });
    
    DOM.btnSectionNext.addEventListener('click', () => {
        if (AppState.activeSectionIndex < AppState.activeTest.sections.length - 1) {
            loadSection(AppState.activeSectionIndex + 1);
        } else {
            // Confirm to submit
            if (confirm('You are at the final section. Do you want to submit your exam now for grading?')) {
                submitTestAnswers();
            }
        }
    });
    
    // Exam control buttons
    DOM.btnSubmitExam.addEventListener('click', () => {
        if (confirm('Are you sure you want to submit the exam? This will grade your work immediately.')) {
            submitTestAnswers();
        }
    });
    
    DOM.btnQuitExam.addEventListener('click', () => {
        if (confirm('Are you sure you want to quit? Your current test responses will be lost.')) {
            clearInterval(AppState.timerInterval);
            stopAudio();
            AppState.examInProgress = false;
            showView('view-landing');
        }
    });
    
    // Result card return home
    DOM.btnBackToHome.addEventListener('click', () => {
        showView('view-landing');
    });
    
    // Native Audio events
    DOM.nativeAudio.addEventListener('timeupdate', updateAudioProgress);
    DOM.nativeAudio.addEventListener('ended', () => {
        pauseAudio();
    });
    
    // Audio Timeline clicks
    DOM.timelineSlider.addEventListener('mousedown', setAudioPosition);
    
    // Audio Mute and Volume sliders
    DOM.btnAudioPlay.addEventListener('click', toggleAudio);
    
    DOM.btnAudioMute.addEventListener('click', () => {
        if (!AppState.audio) return;
        AppState.audio.muted = !AppState.audio.muted;
        DOM.btnAudioMute.querySelector('i').className = AppState.audio.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-low';
    });
    
    DOM.volumeRange.addEventListener('input', function() {
        if (!AppState.audio) return;
        AppState.audio.volume = this.value;
        AppState.audio.muted = false;
        DOM.btnAudioMute.querySelector('i').className = this.value == 0 ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-low';
    });
}

// Bootstrap
window.addEventListener('DOMContentLoaded', initApp);
