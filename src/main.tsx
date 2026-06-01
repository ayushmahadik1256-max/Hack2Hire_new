/**
 * AI-Powered Mock Interview Platform - Client Logic
 * Written in Vanilla TypeScript to support Vite and compilation while offering
 * a pure DOM rendering architecture (STRICTLY plain html, css, vanilla js).
 */

interface UserAnswer {
  question: string;
  answer: string;
  timeTaken: number;
  difficulty: string;
}

interface InterviewState {
  currentQuestionIndex: number;
  totalQuestions: number;
  currentDifficulty: 'Easy' | 'Medium' | 'Hard';
  resumeFilename: string;
  jobDescription: string;
  questionsList: string[];
  userAnswers: UserAnswer[];
  isRecording: boolean;
  timerIntervalId: number | null;
  timeRemaining: number;
  currentQuestionStartTime: number;
  selectedRoleType: 'swe' | 'pm' | 'marketing';
}

// Global Application State management object (Requirement 2: Mock State Management)
const state: InterviewState = {
  currentQuestionIndex: 0,
  totalQuestions: 5,
  currentDifficulty: 'Medium',
  resumeFilename: '',
  jobDescription: '',
  questionsList: [],
  userAnswers: [],
  isRecording: false,
  timerIntervalId: null,
  timeRemaining: 60,
  currentQuestionStartTime: 0,
  selectedRoleType: 'swe',
};

// Realistic questions repository mapped to role category and difficulty heights
const QUESTIONS_BANK = {
  swe: {
    Easy: [
      "Can you describe your experience with TypeScript, and what advantages it provides over vanilla JavaScript?",
      "How do you design and structure a clean component tree in responsive frontend layouts?",
      "What is Vite, and how does it speed up the local dev iteration compared *all* legacy bundlers?",
    ],
    Medium: [
      "Can you describe a challenging frontend architectural problem you faced recently, how you analyzed it, and what specifically you decided to implement to resolve it permanently?",
      "Explain how you would optimize a slow-loading web application that suffers from long main-thread blocking times due to heavy bundle sizes.",
      "How do you manage client-side state across a complex application? Compare context providers vs dedicated state stores.",
    ],
    Hard: [
      "Walk me through how you would design a robust, real-time page editor with collaborative multiplayer syncing. Include transport and history stacks.",
      "What is the Event Loop in JS? Explain the exact cycle of microtasks, macrotasks, and rendering paint cycles with concrete examples.",
      "Explain how you would build a custom rendering engine using HTML5 Canvas that must support dragging, dropping, and editing 10,000 active visual elements at 60 FPS.",
    ]
  },
  pm: {
    Easy: [
      "What is your standard approach for gathering user feedback on a newly launched analytics feature?",
      "How do you define a Minimal Viable Product (MVP) when engineering timeline budgets are extremely tight?",
      "What are your favorite tools for wireframing, and how do you facilitate clear developer communication?",
    ],
    Medium: [
      "How do you resolve high-friction conflicts between engineering capacity constraints and marketing-approved feature launch deadlines?",
      "Tell me about a time you launched a product feature that failed to meet expectations. What was your analysis, and how did you pivot?",
      "How do you measure success? What metrics would you track for an onboarding funnel that has a 45% drop-off rate?",
    ],
    Hard: [
      "Design a product roadmap for integrating highly specialized Gemini AI agents into a legacy corporate enterprise dashboard. How do you mitigate risk, verify safety, and measure precision?",
      "How do you prioritize features across multiple distinct, vocal user personas? Show me a concrete scoring model you have modified or used.",
      "Explain how you would handle an API platform launch that needs to balance security compliance, external developer ergonomics, and monetized routing tiers.",
    ]
  },
  marketing: {
    Easy: [
      "What are the primary differences between organic SEO acquisition and paid keyword search campaigns?",
      "How do you compute Customer Acquisition Cost (CAC) for a standard campaign?",
      "What web analytics tools or event trackers are you most comfortable using on a daily basis?",
    ],
    Medium: [
      "How would you approach designing an A/B split marketing campaign for an applet check-out page that is converting poorly?",
      "Can you describe a time when you successfully optimized an underperforming growth channel to reduce customer churn?",
      "Explain how you would attribute sales conversion across multiple distinct customer touchpoints (first-touch vs multi-touch models).",
    ],
    Hard: [
      "Explain your strategy for scaling from 10,000 monthly active users to 1,000,000 users with a strictly capped, low-budget organic growth framework.",
      "How do you design, execute, and analyze a complex multi-channel retargeting campaign that leverages real-time dynamic ad content feeds?",
      "Walk me through a detailed predictive model where you determine the standard Customer Lifetime Value (LTV) to CAC ratios for a B2B SaaS platform under pricing pressures.",
    ]
  }
};

// Simulated transcript responses for the Mock Record Audio Speech feature
const MOCK_TRANSCRIPTS = {
  swe: [
    "In our last deployment, we faced a major chunking bottleneck that caused 12-second load times. I addressed this by implementing responsive dynamic code splitting, optimizing our Vite asset bundling pipeline, and configuring robust Redis proxy cache layers. This reduced startup response times by 72% and lowered CPU usage on the main renderer.",
    "For complex cross-platform state, I prefer lightweight reactive stores. I modularized our data layers by creating separate key-value caches and binding custom listener triggers. This minimized unnecessary component re-renders while maintaining simple data lookups.",
    "During highly-concurrent socket client syncing, we implemented state throttling. We scheduled batched state snapshots that lowered payload frequencies while preventing paint locks or event drops in the browser rendering loop."
  ],
  pm: [
    "To resolve our feature bottleneck, I built structured prioritization score matrices using cost-benefit columns. I coordinated 1-on-1 design-to-engineering syncs that helped us identify 3 redundant workflows, allowing us to drop project delivery times from 4 weeks to 8 target calendar days.",
    "When our user registration rates dipped by 30%, I deployed targeted customer telemetry. We discovered friction in our multi-step email validation. We consolidated inputs into a third-party login system, restoring our standard sign-up metrics within 48 hours.",
    "Our product Roadmap places emphasis on automated security compliance. We will isolate user personal records, schedule security penetration test exercises, and measure development cycles with strict sprint boards."
  ],
  marketing: [
    "Using dynamic A/B test splits, we customized checkout button positioning. By replacing distracting margins and updating text colors to high-contrast colors, we accelerated purchasing speed and increased conversion by 14.5%.",
    "To lower CAC and boost organic traffic volume, we ran targeted developer blogs covering Vite and TypeScript optimization. This built high-authority search index scores, resulting in a 4x increment in organic trials inside 90 days.",
    "We configured custom multi-touch acquisition models. By measuring user behaviors from first social touchpoint to final checkout conversion, we reallocated 25% of our budget to high-performing campaigns."
  ]
};

/* ==========================================================================
   API CHANNELS / INTERACTION WRAPPERS (Requirement 2: API Placeholders)
   ========================================================================== */

/**
 * API Placeholder: Initiates the interview session with the resume and job description metadata.
 * Performs a simulated fetch call, falling back gracefully to interactive mock calculations if routes are absent.
 */
async function initiateInterviewEndpoint(
  resumeFile: File | null, 
  jdText: string, 
  startingDifficulty: 'Easy' | 'Medium' | 'Hard', 
  numQuestions: number
): Promise<{ success: boolean; firstQuestion: string }> {
  
  const formData = new FormData();
  if (resumeFile) {
    formData.append("resume", resumeFile);
  }
  formData.append("jobDescription", jdText);
  formData.append("difficulty", startingDifficulty);
  formData.append("totalQuestions", String(numQuestions));

  // Actual fetch hook placeholder for future connection
  try {
    const response = await fetch("/api/interview/initiate", {
      method: "POST",
      body: formData
    });
    if (response.ok) {
      const data = await response.json();
      return { success: true, firstQuestion: data.firstQuestion };
    }
  } catch (error) {
    console.log("Mock API Mode: No active backend route found. Accessing mock engines.", error);
  }

  // --- Mock Interactive Fallback ---
  // Detect job category from text keywords
  let category: 'swe' | 'pm' | 'marketing' = 'swe';
  const textLower = jdText.toLowerCase();
  
  if (textLower.includes('pm') || textLower.includes('product') || textLower.includes('manager') || textLower.includes('roadmap')) {
    category = 'pm';
  } else if (textLower.includes('market') || textLower.includes('seo') || textLower.includes('campaign') || textLower.includes('growth')) {
    category = 'marketing';
  }

  // Set selected state role
  state.selectedRoleType = category;
  state.jobDescription = jdText;
  state.totalQuestions = numQuestions;
  state.resumeFilename = resumeFile ? resumeFile.name : (state.resumeFilename || "Pre-installed Candidate Resume.pdf");
  state.currentDifficulty = startingDifficulty;

  // Compile question roster
  const easyQuestions = QUESTIONS_BANK[category]['Easy'];
  const mediumQuestions = QUESTIONS_BANK[category]['Medium'];
  const hardQuestions = QUESTIONS_BANK[category]['Hard'];

  let compiled: string[] = [];
  if (startingDifficulty === 'Easy') {
    compiled = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
  } else if (startingDifficulty === 'Hard') {
    compiled = [...hardQuestions, ...mediumQuestions, ...easyQuestions];
  } else {
    compiled = [...mediumQuestions, ...hardQuestions, ...easyQuestions];
  }

  // Slice to the requested size
  state.questionsList = compiled.slice(0, numQuestions);
  state.currentQuestionIndex = 0;
  state.userAnswers = [];

  return { success: true, firstQuestion: state.questionsList[0] };
}

interface SubmitNextResponse {
  success: boolean;
  score: number;
  updatedDifficulty: 'Easy' | 'Medium' | 'Hard';
  nextQuestion: string | null;
  isTerminated: boolean;
}

/**
 * API Placeholder: Submits an answer, updates question state, computes dynamic difficulty adapters.
 */
async function submitAnswerAndGetNextEndpoint(answerText: string, elapsedSec: number): Promise<SubmitNextResponse> {
  const payload = {
    answer: answerText,
    timeTaken: elapsedSec,
    currentQuestion: state.questionsList[state.currentQuestionIndex],
    currentDifficulty: state.currentDifficulty,
    questionIndex: state.currentQuestionIndex
  };

  // Actual fetch hook placeholder for future connection
  try {
    const response = await fetch("/api/interview/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    // Falls back to adaptive processing
  }

  // --- Dynamic Difficulty Logic (Adaptive) ---
  const cleanedAnswer = answerText.trim();
  const wordCount = cleanedAnswer === "" ? 0 : cleanedAnswer.split(/\s+/).filter(Boolean).length;
  
  // Calculate question performance base score
  let baseScore = 50;
  if (wordCount > 12) baseScore += 10;
  if (wordCount > 35) baseScore += 15;
  if (wordCount > 65) baseScore += 15;

  // Deduct/Low grades for extreme cases
  if (wordCount === 0) baseScore = 0;
  else if (wordCount < 5) baseScore = 15;

  // Accent keyword bonus logic
  const textLower = cleanedAnswer.toLowerCase();
  let hasSTAR = false;
  if (textLower.includes("situation") || textLower.includes("task") || textLower.includes("action") || textLower.includes("result") || textLower.includes("star")) {
    baseScore += 10;
    hasSTAR = true;
  }
  if (textLower.includes("specific") || textLower.includes("solve") || textLower.includes("designed") || textLower.includes("architecture")) {
    baseScore += 5;
  }

  // Bound score limits
  const finalAnswerScore = Math.min(100, baseScore);

  // Buffer response
  state.userAnswers.push({
    question: state.questionsList[state.currentQuestionIndex],
    answer: answerText,
    timeTaken: elapsedSec,
    difficulty: state.currentDifficulty
  });

  // Calculate difficulty scaling (Requirement 2 - update difficulty based on performance)
  // If performance score exceeds 80, step up difficulty. If below 45, step down.
  let newDifficulty = state.currentDifficulty;
  if (finalAnswerScore > 80) {
    if (state.currentDifficulty === 'Easy') newDifficulty = 'Medium';
    else if (state.currentDifficulty === 'Medium') newDifficulty = 'Hard';
  } else if (finalAnswerScore < 45) {
    if (state.currentDifficulty === 'Hard') newDifficulty = 'Medium';
    else if (state.currentDifficulty === 'Medium') newDifficulty = 'Easy';
  }

  const nextIdx = state.currentQuestionIndex + 1;
  const isFinished = nextIdx >= state.totalQuestions;
  let nextQVal: string | null = null;

  if (!isFinished) {
    state.currentQuestionIndex = nextIdx;
    state.currentDifficulty = newDifficulty;

    // Pick a fitting question of the new difficulty class that hasn't been played
    const targetDifficultyList = QUESTIONS_BANK[state.selectedRoleType][newDifficulty];
    const playedText = state.userAnswers.map(ans => ans.question);
    const unserved = targetDifficultyList.filter(q => !playedText.includes(q));

    if (unserved.length > 0) {
      state.questionsList[nextIdx] = unserved[Math.floor(Math.random() * unserved.length)];
    } else {
      // borrow from all pools if exhausted
      const allPools = [
        ...QUESTIONS_BANK[state.selectedRoleType]['Easy'],
        ...QUESTIONS_BANK[state.selectedRoleType]['Medium'],
        ...QUESTIONS_BANK[state.selectedRoleType]['Hard']
      ];
      const fallbackUnserved = allPools.filter(q => !playedText.includes(q));
      if (fallbackUnserved.length > 0) {
        state.questionsList[nextIdx] = fallbackUnserved[Math.floor(Math.random() * fallbackUnserved.length)];
      }
    }
    nextQVal = state.questionsList[nextIdx];
  }

  return {
    success: true,
    score: finalAnswerScore,
    updatedDifficulty: newDifficulty,
    nextQuestion: nextQVal,
    isTerminated: isFinished
  };
}

interface FinalReportMetrics {
  success: boolean;
  overallScore: number;
  accuracy: number;
  clarity: number;
  depth: number;
  relevance: number;
  timeEfficiency: number;
  strengths: string[];
  weaknesses: string[];
}

/**
 * API Placeholder: Loads complete readiness scoring vectors for dashboard views.
 */
async function getFinalReportEndpoint(): Promise<FinalReportMetrics> {
  // Actual fetch hook placeholder for future connection
  try {
    const response = await fetch("/api/interview/report", {
      method: "GET"
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    // Local calculation compiling
  }

  // --- Complete Report Mock Generator (Requirement 1, View 3) ---
  const answeredCount = state.userAnswers.length;
  if (answeredCount === 0) {
    return {
      success: true,
      overallScore: 0,
      accuracy: 0, clarity: 0, depth: 0, relevance: 0, timeEfficiency: 0,
      strengths: ["No interview sessions recorded."],
      weaknesses: ["Completed questions will produce actionable metrics."]
    };
  }

  let wordCountTotal = 0;
  let starCounter = 0;
  let totalSessionTime = 0;

  for (const item of state.userAnswers) {
    const wc = item.answer.trim().split(/\s+/).filter(Boolean).length;
    wordCountTotal += wc;
    totalSessionTime += item.timeTaken;
    
    const plainText = item.answer.toLowerCase();
    if (plainText.includes("situation") || plainText.includes("task") || plainText.includes("action") || plainText.includes("result") || plainText.includes("star")) {
      starCounter++;
    }
  }

  const avgWords = wordCountTotal / answeredCount;
  const avgDurationSeconds = totalSessionTime / answeredCount;

  // 1. Concept Accuracy: boosted by resume coverage parameters
  const accuracy = Math.min(100, Math.round(75 + (avgWords > 28 ? 12 : 2) + Math.min(8, starCounter * 4)));
  
  // 2. Clarity & grammar: stable layout
  const clarity = Math.min(100, Math.round(78 + (avgWords > 15 ? 10 : -15)));
  
  // 3. Technical Depth: heavily anchored on words count
  const depth = Math.min(100, Math.round(52 + (avgWords > 60 ? 38 : avgWords > 30 ? 22 : 6)));
  
  // 4. Job Relevance: dependent on resume file presence
  const relevance = Math.min(100, Math.round(82 + (state.resumeFilename !== "" ? 10 : 4)));
  
  // 5. Time Efficiency: optimal pacing between 25-50 seconds
  let timeEfficiency = 85;
  if (avgDurationSeconds > 54) {
    timeEfficiency = 60; // Timeout stress
  } else if (avgDurationSeconds < 14) {
    timeEfficiency = 70; // Answer too short
  }

  const overallScore = Math.round((accuracy + clarity + depth + relevance + timeEfficiency) / 5);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Formulate actionable metrics
  if (starCounter > 0) {
    strengths.push("Excellent Structural Command: You successfully applied STAR response markers to present structured scenarios.");
  } else {
    weaknesses.push("STAR Framework Adoption: Structure your answers using explicit Situation, Task, Action, and Result vectors for increased conceptual scores.");
  }

  if (avgWords > 50) {
    strengths.push("Substantive Delivery: Provided rich descriptions with sufficient terminology fitting the " + state.selectedRoleType.toUpperCase() + " profile.");
  } else {
    weaknesses.push("Elaborate on Details: Expand response paragraphs. Try adding concrete technical metrics, KPIs, or code patterns to expand Depth metrics.");
  }

  if (state.resumeFilename !== "") {
    strengths.push("Job Profile Relevance: Seamlessly connected prefilled resume background patterns directly to the core Job Description criteria.");
  }

  if (avgDurationSeconds > 48) {
    weaknesses.push("Timing Economy: Several answers approached the 60-second limit. Practice delivering your primary metric earlier to avoid timeouts.");
  } else {
    strengths.push("Balanced pacing: Maintained efficient expression within the visual countdown margin.");
  }

  return {
    success: true,
    overallScore,
    accuracy,
    clarity,
    depth,
    relevance,
    timeEfficiency,
    strengths,
    weaknesses
  };
}

/* ==========================================================================
   DOM UTILITIES & INTERACTIVITY MECHANICS
   ========================================================================== */

/**
 * Switch boards across SPA panels
 */
function switchView(viewId: 'onboarding-view' | 'interview-view' | 'results-view') {
  // Hide all screens
  const onboarding = document.getElementById('onboarding-view');
  const interview = document.getElementById('interview-view');
  const results = document.getElementById('results-view');

  if (onboarding) {
    onboarding.classList.add('hidden');
    onboarding.classList.remove('active');
  }
  if (interview) {
    interview.classList.add('hidden');
    interview.classList.remove('active');
  }
  if (results) {
    results.classList.add('hidden');
    results.classList.remove('active');
  }

  // Activate target
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.remove('hidden');
    // Frame flow reflow
    void target.offsetHeight;
    target.classList.add('active');
  }

  // Update header badges
  const badge = document.getElementById('session-badge');
  if (badge) {
    if (viewId === 'onboarding-view') {
      badge.className = 'status-badge idle';
      badge.innerText = 'Ready';
    } else if (viewId === 'interview-view') {
      badge.className = 'status-badge active';
      badge.innerText = 'In Session';
    } else if (viewId === 'results-view') {
      badge.className = 'status-badge completed';
      badge.innerText = 'Completed';
    }
  }
}

/**
 * Toast Popups
 */
let toastTimeoutId: number | null = null;
function showToast(message: string) {
  const toastWrapper = document.getElementById('toast-wrapper');
  const toastText = document.getElementById('toast-text');
  
  if (toastWrapper && toastText) {
    toastText.innerText = message;
    toastWrapper.classList.add('show');
    
    if (toastTimeoutId) {
      window.clearTimeout(toastTimeoutId);
    }

    toastTimeoutId = window.setTimeout(() => {
      toastWrapper.classList.remove('show');
    }, 3200);
  }
}

// Word counter utility for Job Pitch textarea
function updateWordCounter() {
  const textarea = document.getElementById('jd-textarea') as HTMLTextAreaElement | null;
  const wordCountDisplay = document.getElementById('jd-word-count');
  if (textarea && wordCountDisplay) {
    const text = textarea.value.trim();
    if (text === "") {
      wordCountDisplay.innerText = "0 words";
      return;
    }
    const words = text.split(/\s+/).filter(Boolean).length;
    wordCountDisplay.innerText = `${words} words`;
  }
}

// Char count for answer response textarea
function updateTextareaCharCount(lengthNum: number) {
  const counter = document.getElementById('answer-char-count');
  if (counter) {
    counter.innerText = `${lengthNum} characters entered`;
  }
}

/* ==========================================================================
   TIMER IMPLEMENTATION (Requirement 2: Countdown Timer)
   ========================================================================== */
function startCountdownTimer() {
  // Clear stale intervals
  if (state.timerIntervalId) {
    window.clearInterval(state.timerIntervalId);
  }

  state.timeRemaining = 60;
  state.currentQuestionStartTime = Date.now();

  const countdownText = document.getElementById('timer-countdown-value');
  const ringFill = document.getElementById('timer-ring-fill') as any;

  if (countdownText) {
    countdownText.innerText = '60';
    countdownText.classList.remove('low-time-text');
  }
  if (ringFill) {
    ringFill.style.strokeDashoffset = '0';
    ringFill.classList.remove('low-time-ring');
  }

  // Stroke circumference parameter
  const ringTotal = 282.7;

  state.timerIntervalId = window.setInterval(() => {
    state.timeRemaining--;

    // Render Countdown text
    if (countdownText) {
      countdownText.innerText = String(state.timeRemaining);
      if (state.timeRemaining <= 15) {
        countdownText.classList.add('low-time-text');
      }
    }

    // Render radial stroke
    if (ringFill) {
      const computedOffset = ringTotal - (state.timeRemaining / 60) * ringTotal;
      ringFill.style.strokeDashoffset = String(computedOffset);

      if (state.timeRemaining <= 15) {
        ringFill.classList.add('low-time-ring');
      }
    }

    // Auto-submission trigger
    if (state.timeRemaining <= 0) {
      if (state.timerIntervalId) {
        window.clearInterval(state.timerIntervalId);
        state.timerIntervalId = null;
      }
      showToast("Time expired! Auto-submitting response.");
      handleAnswerFinished(true); // timed-out
    }
  }, 1000);
}

/**
 * Active panel answer progression router
 */
async function handleAnswerFinished(isTimeout = false) {
  // Clear active countdown
  if (state.timerIntervalId) {
    window.clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }

  const answerArea = document.getElementById('answer-textarea') as HTMLTextAreaElement | null;
  const submitBtn = document.getElementById('submit-answer-btn') as HTMLButtonElement | null;

  if (submitBtn) submitBtn.disabled = true;

  const responseText = isTimeout ? (answerArea?.value || "[No response provided before standard 60s timeout]") : (answerArea?.value || "");
  const secondsElapsed = Math.round((Date.now() - state.currentQuestionStartTime) / 1000);

  // Submit and update states via endpoints
  const resultData = await submitAnswerAndGetNextEndpoint(responseText, secondsElapsed);

  // Clean form state
  if (answerArea) {
    answerArea.value = "";
  }
  updateTextareaCharCount(0);

  // End of course or proceed
  if (resultData.isTerminated || resultData.nextQuestion === null) {
    showToast("Interview Finished! Generating comprehensive metrics...");
    await compileReportAndSwitchView();
  } else {
    // Elevate index
    const label = document.getElementById('question-progress-label');
    const displayElement = document.getElementById('question-text');
    const debugDiff = document.getElementById('debug-difficulty-indicator');
    const debugIdx = document.getElementById('debug-current-index');
    const topBar = document.getElementById('interview-progress-bar');

    if (label) {
      label.innerText = `Question ${state.currentQuestionIndex + 1} of ${state.totalQuestions}`;
    }
    if (displayElement) {
      displayElement.innerText = resultData.nextQuestion;
    }
    if (debugDiff) {
      debugDiff.innerText = resultData.updatedDifficulty;
      debugDiff.className = `pill ${resultData.updatedDifficulty === 'Easy' ? 'pill-blue' : resultData.updatedDifficulty === 'Medium' ? 'pill-green' : 'pill-red'}`;
    }
    if (debugIdx) {
      debugIdx.innerText = `${state.currentQuestionIndex + 1} / ${state.totalQuestions}`;
    }
    if (topBar) {
      const progressPercent = (state.currentQuestionIndex / state.totalQuestions) * 100;
      topBar.style.width = `${progressPercent}%`;
    }

    if (submitBtn) submitBtn.disabled = false;
    
    // Reboot speech recording triggers
    shutOffRecMode();

    // Start timer sequence for new round
    startCountdownTimer();
  }
}

/**
 * Shut off speaking recorder visuals
 */
function shutOffRecMode() {
  state.isRecording = false;
  const visualizer = document.getElementById('audio-visualizer-panel');
  const recordText = document.getElementById('record-audio-text');
  const recordBtn = document.getElementById('record-audio-btn');

  if (visualizer) visualizer.classList.add('hidden');
  if (recordText) recordText.innerText = "Record Answer Mock";
  if (recordBtn) recordBtn.classList.remove('btn-primary');
}

/**
 * View 3 report renderer
 */
async function compileReportAndSwitchView() {
  const reportCard = await getFinalReportEndpoint();

  const finalRing = document.getElementById('results-score-ring') as any;
  const numLabel = document.getElementById('final-score-text');
  const descriptor = document.getElementById('readiness-descriptor');
  const summaryText = document.getElementById('assessment-verdict');

  // Individual progress meters
  const accurateVal = document.getElementById('metric-accuracy-val');
  const clarityVal = document.getElementById('metric-clarity-val');
  const depthVal = document.getElementById('metric-depth-val');
  const relevanceVal = document.getElementById('metric-relevance-val');
  const timeVal = document.getElementById('metric-time-val');

  const accuracyBar = document.getElementById('progress-accuracy');
  const clarityBar = document.getElementById('progress-clarity');
  const depthBar = document.getElementById('progress-depth');
  const relevanceBar = document.getElementById('progress-relevance');
  const timeBar = document.getElementById('progress-time');

  // Bullet items
  const strengthListUl = document.getElementById('strengths-list');
  const weakListUl = document.getElementById('weaknesses-list');

  // Update numbers
  if (numLabel) numLabel.innerText = String(reportCard.overallScore);

  // Dashoffset trigger (339.3 total circumference of results circle)
  if (finalRing) {
    const totalCircumCirc = 339.3;
    const computedOffset = totalCircumCirc - (reportCard.overallScore / 100) * totalCircumCirc;
    finalRing.style.strokeDashoffset = String(computedOffset);
  }

  // Assess level descriptors
  if (descriptor && summaryText) {
    if (reportCard.overallScore >= 85) {
      descriptor.innerText = "Excellent Readiness!";
      descriptor.className = "pill pill-green pill-lg";
      summaryText.innerText = "Your response portfolio demonstrates highly developed command of professional frameworks. Ready for immediate enterprise interview trials.";
    } else if (reportCard.overallScore >= 70) {
      descriptor.innerText = "Highly Ready";
      descriptor.className = "pill pill-blue pill-lg";
      summaryText.innerText = "Good domain comprehension and structured delivery. Polish technical specifics and add quantifiable key metrics to unlock exceptional evaluation tiers.";
    } else {
      descriptor.innerText = "Needs Polishing";
      descriptor.className = "pill pill-red pill-lg";
      summaryText.innerText = "Answers were rather brief or exceeded standard timing restraints. Rerun another simulation session and try structured layouts.";
    }
  }

  // Populate list boxes
  if (accurateVal) accurateVal.innerText = `${reportCard.accuracy}%`;
  if (clarityVal) clarityVal.innerText = `${reportCard.clarity}%`;
  if (depthVal) depthVal.innerText = `${reportCard.depth}%`;
  if (relevanceVal) relevanceVal.innerText = `${reportCard.relevance}%`;
  if (timeVal) timeVal.innerText = `${reportCard.timeEfficiency}%`;

  if (accuracyBar) accuracyBar.style.width = `${reportCard.accuracy}%`;
  if (clarityBar) clarityBar.style.width = `${reportCard.clarity}%`;
  if (depthBar) depthBar.style.width = `${reportCard.depth}%`;
  if (relevanceBar) relevanceBar.style.width = `${reportCard.relevance}%`;
  if (timeBar) timeBar.style.width = `${reportCard.timeEfficiency}%`;

  if (strengthListUl) {
    strengthListUl.innerHTML = reportCard.strengths.map(st => `<li>${st}</li>`).join('');
  }
  if (weakListUl) {
    weakListUl.innerHTML = reportCard.weaknesses.map(wk => `<li>${wk}</li>`).join('');
  }

  switchView('results-view');
}

/* ==========================================================================
   WIDGET PREFILL REPOSITORIES
   ========================================================================== */
const RESUME_PREFILLS = {
  swe: "AYUSH FE DEVELOPER RESUME\n\n- Competencies: Advanced React, TypeScript, Vite, CSS Grid/Flexbox.\n- Experience: Senior Frontend Engineer at Cloud Corp (2023-Present). Led Vite migration that dropped client startup load margins by 45%. Automated bundler minification.\n- Education: BS in Technical Computing Science.\n- Projects: Developed state synchronizer dashboard parsing real-time analytics pipelines.",
  pm: "SAM PM ROADMAP LEAD RESUME\n\n- Competencies: Product execution priorities, wireframing, metrics analysis.\n- Experience: Associate PM at Analytics Hub (2022-2025). Owned onboarding conversion pipeline, growing registration sign-up margins by 28% locally.\n- Core Focus: Structural strategy, market evaluation decks, engineering coordination lists."
};

const JD_PREFILLS = {
  swe: "Position: Senior Frontend Engineer (TypeScript/React)\n\nWe need an engineer to optimize our next-generation web dashboards. Ideal candidate demonstrates profound competence with bundler performance optimizations (Vite preferred), type safety layouts (TypeScript), responsive UI engineering, and real-time state synchronization architectures. STAR scenarios showing layout rendering solutions are highly prioritized.",
  pm: "Position: Associate Product Manager\n\nLooking for an action-oriented leader to manage our core feature prioritization funnel. Responsibilities include defining MVPs, coordinating with agile development teams, building wireframe models, and evaluating onboarding registration drops. Experience scaling system user metrics and defining precise specifications is necessary.",
  marketing: "Position: Growth Marketing Lead\n\nSeeking a campaign leader to optimize organic user recruitment. Must operate Google analytics, configure multi-touch conversion funnels, execute organic SEO keyword expansions, and design landing page A/B splits. Goal is to double trial registration speed under tight budget parameters."
};

interface BestPracticeTip {
  title: string;
  desc: string;
}

const TIPS_BANK: Record<'swe' | 'pm' | 'marketing', BestPracticeTip[]> = {
  swe: [
    {
      title: "Write Clean Code Accents",
      desc: "Reference specific modern React hooks (such as useMemo or custom hooks), TypeScript type safety, or build configurations (Vite) inside replies."
    },
    {
      title: "Utilize STAR Structure",
      desc: "Express answers using Situation, Task, Action, and measured Result metrics to satisfy procedural depth parameters."
    },
    {
      title: "Quantify Optimization Scales",
      desc: "Prepare to cite precise metrics like bundle payload size reduction, rendering speed (FPS), or query latencies."
    }
  ],
  pm: [
    {
      title: "Apply Prioritization Tooling",
      desc: "Mention specific strategic frameworks like RICE formulas, MoSCoW parameters, or impact-vs-effort sorting maps."
    },
    {
      title: "Prioritize Product Growth Metrics",
      desc: "Talk in terms of conversion milestones, user onboarding activation rates, cohort retention levels, or funnel drops."
    },
    {
      title: "Coordinate Cross-Functional Teams",
      desc: "Highlight developer coordination, scope negotiation, and capacity tradeoffs to highlight consensus-building metrics."
    }
  ],
  marketing: [
    {
      title: "Ground in CAC vs LTV Math",
      desc: "Clearly elaborate on Customer Acquisition Cost levels, multi-channel attribution models, and Customer Lifetime Value multipliers."
    },
    {
      title: "Implement A/B Testing Splits",
      desc: "Discuss specific split configurations, button contrast placements, layout optimization, and landing conversion ratios."
    },
    {
      title: "Optimize Search/Content Loops",
      desc: "Emphasize Technical SEO, search engine keyword rankings, organic referral cascades, and audience generation methods."
    }
  ]
};

function renderBestPractices(category: 'swe' | 'pm' | 'marketing') {
  const container = document.getElementById('best-practices-list');
  if (!container) return;

  const tips = TIPS_BANK[category];
  container.innerHTML = tips.map((tip, index) => `
    <div class="best-practice-card">
      <div class="best-practice-header">
        <span class="best-practice-number">${index + 1}</span>
        <h3 class="best-practice-title">${tip.title}</h3>
      </div>
      <p class="best-practice-desc">${tip.desc}</p>
    </div>
  `).join('');
}

/* ==========================================================================
   APP INITIALIZATION & INTERACTION BOUNDINGS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Always start on the setup screen, even if HTML classes drift.
  switchView('onboarding-view');

  // Query UI Elements
  const resumeDropzone = document.getElementById('resume-dropzone');
  const resumeInput = document.getElementById('resume-input') as HTMLInputElement | null;
  const fileBanner = document.getElementById('file-banner');
  const fileSpan = document.getElementById('file-name-span');
  const removeFileBtn = document.getElementById('remove-file-btn');
  const jdTextarea = document.getElementById('jd-textarea') as HTMLTextAreaElement | null;
  const startBtn = document.getElementById('start-interview-btn');
  const answerTextarea = document.getElementById('answer-textarea') as HTMLTextAreaElement | null;
  const recordAudioBtn = document.getElementById('record-audio-btn');
  const submitAnswerBtn = document.getElementById('submit-answer-btn');
  const restartBtn = document.getElementById('restart-btn');
  const exportBtn = document.getElementById('export-report-btn');

  // Job Category selector configuration
  const categorySelect = document.getElementById('category-select') as HTMLSelectElement | null;

  // Initialize the onboarding playbook visual cards
  renderBestPractices('swe');

  categorySelect?.addEventListener('change', () => {
    const activeCat = categorySelect.value as 'swe' | 'pm' | 'marketing';
    state.selectedRoleType = activeCat;
    renderBestPractices(activeCat);
  });

  // Prefill Buttons
  const prefillResumeBtns = document.querySelectorAll('.prefill-resume-btn');
  const prefillJdBtns = document.querySelectorAll('.prefill-jd-btn');

  // Debug Box Collapsible
  const debugToggleBtn = document.getElementById('debug-toggle-btn');
  const debugPanelBody = document.getElementById('debug-panel-body');
  const debugArrow = document.getElementById('debug-arrow');

  /* Onboarding Setup listeners */
  prefillResumeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      if (type === 'swe') {
        state.resumeFilename = "Ayush_FE_Developer_Resume.pdf";
        if (fileSpan) fileSpan.innerText = state.resumeFilename;
        fileBanner?.classList.remove('hidden');
        showToast("Prefilled: Software Engineer Profile.");
        if (categorySelect) {
          categorySelect.value = 'swe';
          state.selectedRoleType = 'swe';
          renderBestPractices('swe');
        }
      } else if (type === 'pm') {
        state.resumeFilename = "Sam_PM_Roadmap_Resume.pdf";
        if (fileSpan) fileSpan.innerText = state.resumeFilename;
        fileBanner?.classList.remove('hidden');
        showToast("Prefilled: Product Manager Profile.");
        if (categorySelect) {
          categorySelect.value = 'pm';
          state.selectedRoleType = 'pm';
          renderBestPractices('pm');
        }
      }
    });
  });

  prefillJdBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type') as 'swe' | 'pm' | 'marketing' | null;
      if (type && jdTextarea) {
        jdTextarea.value = JD_PREFILLS[type];
        updateWordCounter();
        showToast(`Prefilled: ${btn.textContent} Job Description.`);
        if (categorySelect) {
          categorySelect.value = type;
          state.selectedRoleType = type;
          renderBestPractices(type);
        }
      }
    });
  });

  // Track Word Counter in JD Textarea
  jdTextarea?.addEventListener('input', updateWordCounter);

  // Track Answer Textarea Input character counts
  answerTextarea?.addEventListener('input', () => {
    if (answerTextarea) {
      updateTextareaCharCount(answerTextarea.value.length);
    }
  });

  // Slide & drop file handlers
  resumeDropzone?.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('button') || target?.tagName === 'INPUT') {
      return;
    }
    resumeInput?.click();
  });

  resumeDropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    resumeDropzone.classList.add('drag-active');
  });

  resumeDropzone?.addEventListener('dragleave', () => {
    resumeDropzone.classList.remove('drag-active');
  });

  resumeDropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    resumeDropzone.classList.remove('drag-active');
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      state.resumeFilename = file.name;
      if (fileSpan) fileSpan.innerText = file.name;
      fileBanner?.classList.remove('hidden');
      showToast(`Resume uploaded: ${file.name}`);
    }
  });

  resumeInput?.addEventListener('change', () => {
    if (resumeInput.files && resumeInput.files.length > 0) {
      const file = resumeInput.files[0];
      state.resumeFilename = file.name;
      if (fileSpan) fileSpan.innerText = file.name;
      fileBanner?.classList.remove('hidden');
      showToast(`Resume uploaded: ${file.name}`);
    }
  });

  removeFileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.resumeFilename = '';
    if (resumeInput) resumeInput.value = '';
    fileBanner?.classList.add('hidden');
    showToast("Resume template reference removed.");
  });

  // Debug Panel collapsible toggle button
  debugToggleBtn?.addEventListener('click', () => {
    if (debugPanelBody && debugArrow) {
      const isActive = debugPanelBody.classList.contains('active');
      if (isActive) {
        debugPanelBody.classList.remove('active');
        debugArrow.innerText = "▼";
      } else {
        debugPanelBody.classList.add('active');
        debugArrow.innerText = "▲";
      }
    }
  });

  /* Switch View 1 to View 2: STAGE ACTION */
  startBtn?.addEventListener('click', async () => {
    const jdText = jdTextarea?.value.trim() || "";
    
    if (jdText === "") {
      showToast("Verification Error: Please provide a target job description template.");
      jdTextarea?.focus();
      return;
    }

    const diff = (document.getElementById('difficulty-select') as HTMLSelectElement)?.value || 'Medium';
    const ct = Number((document.getElementById('questions-count-select') as HTMLSelectElement)?.value) || 5;

    let attachedFile: File | null = null;
    if (resumeInput?.files && resumeInput.files.length > 0) {
      attachedFile = resumeInput.files[0];
    }

    showToast("Aligning LLM vectors... Formulating target session.");
    
    // Execute initialization API / Mock fallback
    const initResult = await initiateInterviewEndpoint(attachedFile, jdText, diff as any, ct);

    if (initResult.success) {
      // Setup elements on View 2
      const qProgress = document.getElementById('question-progress-label');
      const qText = document.getElementById('question-text');
      const debugDiff = document.getElementById('debug-difficulty-indicator');
      const debugIdx = document.getElementById('debug-current-index');
      const progressFill = document.getElementById('interview-progress-bar');

      if (qProgress) qProgress.innerText = `Question 1 of ${state.totalQuestions}`;
      if (qText) qText.innerText = initResult.firstQuestion;
      if (debugDiff) {
        debugDiff.innerText = state.currentDifficulty;
        debugDiff.className = `pill ${state.currentDifficulty === 'Easy' ? 'pill-blue' : state.currentDifficulty === 'Medium' ? 'pill-green' : 'pill-red'}`;
      }
      if (debugIdx) debugIdx.innerText = `1 / ${state.totalQuestions}`;
      if (progressFill) progressFill.style.width = '0%';

      // Reset Submit btn disabled status if any
      const submitBtn = document.getElementById('submit-answer-btn') as HTMLButtonElement | null;
      if (submitBtn) submitBtn.disabled = false;

      // Swap view and begin clock
      switchView('interview-view');
      startCountdownTimer();
    }
  });

  // Submit Answer Action
  submitAnswerBtn?.addEventListener('click', () => {
    handleAnswerFinished(false); // manual finish
  });

  // Mock Audio Transcription Recording simulator (Requirement 1, View 2)
  recordAudioBtn?.addEventListener('click', () => {
    const visualizer = document.getElementById('audio-visualizer-panel');
    const recordText = document.getElementById('record-audio-text');
    const audioStatus = document.getElementById('audio-status-text');

    if (!state.isRecording) {
      state.isRecording = true;
      recordAudioBtn.classList.add('btn-primary');
      if (recordText) recordText.innerText = "Interpreting Speech...";
      if (visualizer) visualizer.classList.remove('hidden');
      if (audioStatus) audioStatus.innerText = "Listening for response transcription... (Speak clearly)";

      // Retrieve role-derived transcript responses
      const transcriptList = MOCK_TRANSCRIPTS[state.selectedRoleType];
      const selectedPhrase = transcriptList[Math.floor(Math.random() * transcriptList.length)];
      
      let typedCharIndex = 0;
      if (answerTextarea) {
        answerTextarea.value = "🎤 ";
      }

      // Simulate real-time speech transcription typing animation!
      const typingInterval = window.setInterval(() => {
        if (!state.isRecording) {
          window.clearInterval(typingInterval);
          return;
        }

        if (answerTextarea && typedCharIndex < selectedPhrase.length) {
          answerTextarea.value += selectedPhrase.charAt(typedCharIndex);
          typedCharIndex++;
          updateTextareaCharCount(answerTextarea.value.length);
        } else {
          window.clearInterval(typingInterval);
          if (audioStatus) audioStatus.innerText = "Speech analyzed! Clean transcription inserted.";
          
          window.setTimeout(() => {
            shutOffRecMode();
          }, 1200);
        }
      }, 40); // 40ms typing rate
    } else {
      // Double tap toggles off
      shutOffRecMode();
    }
  });

  // TTS Evaluation voice playback feature
  const hearEvaluationBtn = document.getElementById('hear-evaluation-btn');
  const stopEvaluationBtn = document.getElementById('stop-evaluation-btn');
  const audioPlaybackStatus = document.getElementById('audio-playback-status');

  const handleSpeechEnd = () => {
    if (stopEvaluationBtn) stopEvaluationBtn.classList.add('hidden');
    if (hearEvaluationBtn) hearEvaluationBtn.classList.remove('hidden');
    if (audioPlaybackStatus) audioPlaybackStatus.innerText = "Finished reading evaluation highlights.";
  };

  hearEvaluationBtn?.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      showToast("Vocal synthesis is not supported on this browser context.");
      return;
    }

    // Cancel active voice
    window.speechSynthesis.cancel();

    const strengthsEl = document.getElementById("strengths-list");
    const weaknessesEl = document.getElementById("weaknesses-list");
    let textToSpeak = "";

    if (strengthsEl) {
      const items = Array.from(strengthsEl.querySelectorAll("li")).map(li => li.innerText);
      if (items.length > 0) {
        textToSpeak += "Here are your core strengths demonstrated: " + items.join(". ") + ". ";
      }
    }
    if (weaknessesEl) {
      const items = Array.from(weaknessesEl.querySelectorAll("li")).map(li => li.innerText);
      if (items.length > 0) {
        textToSpeak += "Here are your actionable growth opportunities: " + items.join(". ") + ". ";
      }
    }

    if (!textToSpeak) {
      textToSpeak = "Your interview evaluation reports are currently ready on the dashboard screen.";
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (stopEvaluationBtn) stopEvaluationBtn.classList.remove('hidden');
      if (hearEvaluationBtn) hearEvaluationBtn.classList.add('hidden');
      if (audioPlaybackStatus) audioPlaybackStatus.innerText = "Synthesizing vocal wave feedback... Speaking now.";
    };

    utterance.onend = handleSpeechEnd;
    utterance.onerror = handleSpeechEnd;

    window.speechSynthesis.speak(utterance);
  });

  stopEvaluationBtn?.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    handleSpeechEnd();
    if (audioPlaybackStatus) audioPlaybackStatus.innerText = "Voice synthesis cancelled by user.";
  });

  const masterStopVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    handleSpeechEnd();
  };

  // Restart Button to onboarding Setup views
  restartBtn?.addEventListener('click', () => {
    masterStopVoice();
    switchView('onboarding-view');
  });

  // Download PDF Report action (Mock)
  exportBtn?.addEventListener('click', () => {
    masterStopVoice();
    showToast("Success: Assessment scorecard generated! Opening Print dialog...");
    window.print();
  });
});
