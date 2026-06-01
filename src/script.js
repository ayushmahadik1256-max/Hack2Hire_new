const state = {
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

const QUESTIONS_BANK = {
  swe: {
    Easy: [
      'Describe your experience with TypeScript.',
      'How do you structure a responsive component tree?',
      'What problem does Vite solve for frontend teams?',
    ],
    Medium: [
      'Describe a frontend architectural problem you solved and how you fixed it.',
      'How would you optimize a slow web app with heavy bundle sizes?',
      'How do you manage client-side state in a complex application?',
    ],
    Hard: [
      'Design a real-time collaborative page editor.',
      'Explain the JavaScript event loop in detail.',
      'How would you build a custom canvas renderer for 10,000 elements?',
    ],
  },
  pm: {
    Easy: [
      'How do you gather user feedback for a new feature?',
      'How do you define an MVP under tight timelines?',
      'How do you facilitate clear developer communication?',
    ],
    Medium: [
      'How do you resolve conflict between engineering capacity and launch deadlines?',
      'Tell me about a product feature that did not meet expectations.',
      'What metrics would you track for an onboarding funnel?',
    ],
    Hard: [
      'Design a product roadmap for integrating AI agents into an enterprise dashboard.',
      'How do you prioritize features across multiple user personas?',
      'How would you handle an API platform launch with security and monetization constraints?',
    ],
  },
  marketing: {
    Easy: [
      'What is the difference between organic SEO and paid search?',
      'How do you compute CAC for a campaign?',
      'Which analytics tools do you use most often?',
    ],
    Medium: [
      'How would you design an A/B test for a checkout page?',
      'Describe a time you improved an underperforming growth channel.',
      'How would you attribute conversion across multiple touchpoints?',
    ],
    Hard: [
      'How would you scale from 10,000 to 1,000,000 users with a limited budget?',
      'How would you design a multi-channel retargeting campaign?',
      'How would you model LTV to CAC for a B2B SaaS platform?',
    ],
  },
};

const TRANSCRIPTS = {
  swe: [
    'I reduced load times by splitting bundles, improving caching, and trimming unnecessary rerenders.',
    'I organized state into smaller stores so components only subscribed to what they actually needed.',
    'I worked through a sync issue by batching updates and keeping the render path lightweight.',
  ],
  pm: [
    'I used a prioritization matrix, aligned stakeholders, and shipped the highest-impact work first.',
    'I found the main drop-off in onboarding, simplified the flow, and improved conversion.',
    'I balanced roadmap tradeoffs by focusing on measurable outcomes and clear communication.',
  ],
  marketing: [
    'I improved conversion by refining the landing page, tightening the message, and testing variants.',
    'I reduced CAC by shifting budget toward high-performing content and search campaigns.',
    'I used attribution data to reallocate spend to the channels that produced the best ROI.',
  ],
};

const PREFILLS = {
  resume: {
    swe: 'Software Engineer Resume\nReact, TypeScript, Vite, performance optimization.',
    pm: 'Product Manager Resume\nRoadmaps, prioritization, stakeholder alignment.',
  },
  jd: {
    swe: 'Frontend Engineer role focused on React, TypeScript, performance, and UX quality.',
    pm: 'Associate Product Manager role focused on prioritization, user metrics, and delivery.',
    marketing: 'Growth Marketing role focused on analytics, acquisition, and A/B testing.',
  },
};

const TIPS = {
  swe: [
    { title: 'Use STAR', desc: 'Situation, Task, Action, Result keeps answers crisp.' },
    { title: 'Show Metrics', desc: 'Mention load time, bundle size, or rerender improvements.' },
    { title: 'Be Specific', desc: 'Name the tools and patterns you actually used.' },
  ],
  pm: [
    { title: 'Prioritize Clearly', desc: 'Explain the framework behind the tradeoff.' },
    { title: 'Track Outcomes', desc: 'Connect your work to conversion, retention, or activation.' },
    { title: 'Align Teams', desc: 'Show how you coordinated engineering, design, and business.' },
  ],
  marketing: [
    { title: 'Think in Funnels', desc: 'Talk about awareness, conversion, and retention together.' },
    { title: 'Measure ROI', desc: 'Use CAC, LTV, and attribution to support decisions.' },
    { title: 'Run Experiments', desc: 'A/B tests make your strategy concrete and believable.' },
  ],
};

let toastTimeoutId = null;

const $ = (id) => document.getElementById(id);
const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0);

function showToast(message) {
  const wrapper = $('toast-wrapper');
  const text = $('toast-text');
  if (!wrapper || !text) return;
  text.innerText = message;
  wrapper.classList.add('show');
  if (toastTimeoutId) window.clearTimeout(toastTimeoutId);
  toastTimeoutId = window.setTimeout(() => wrapper.classList.remove('show'), 3000);
}

function switchView(viewId) {
  ['onboarding-view', 'interview-view', 'results-view'].forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.classList.add('hidden');
    el.classList.remove('active');
  });
  const target = $(viewId);
  if (target) {
    target.classList.remove('hidden');
    void target.offsetHeight;
    target.classList.add('active');
  }
  const badge = $('session-badge');
  if (badge) {
    const map = {
      'onboarding-view': ['status-badge idle', 'Ready'],
      'interview-view': ['status-badge active', 'In Session'],
      'results-view': ['status-badge completed', 'Completed'],
    };
    badge.className = map[viewId][0];
    badge.innerText = map[viewId][1];
  }
}

function updateWordCounter() {
  const textarea = $('jd-textarea');
  const display = $('jd-word-count');
  if (textarea && display) display.innerText = `${wordCount(textarea.value)} words`;
}

function updateCharCount(value) {
  const display = $('answer-char-count');
  if (display) display.innerText = `${value} characters entered`;
}

function renderBestPractices(category) {
  const container = $('best-practices-list');
  if (!container) return;
  container.innerHTML = TIPS[category]
    .map(
      (tip, i) => `<div class="best-practice-card"><div class="best-practice-header"><span class="best-practice-number">${i + 1}</span><h3 class="best-practice-title">${tip.title}</h3></div><p class="best-practice-desc">${tip.desc}</p></div>`,
    )
    .join('');
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes('market') || lower.includes('seo') || lower.includes('campaign') || lower.includes('growth')) return 'marketing';
  if (lower.includes('pm') || lower.includes('product') || lower.includes('manager') || lower.includes('roadmap')) return 'pm';
  return 'swe';
}

function buildQuestions(category, difficulty, total) {
  const pools = QUESTIONS_BANK[category];
  const compiled = difficulty === 'Hard'
    ? [...pools.Hard, ...pools.Medium, ...pools.Easy]
    : difficulty === 'Easy'
      ? [...pools.Easy, ...pools.Medium, ...pools.Hard]
      : [...pools.Medium, ...pools.Hard, ...pools.Easy];
  return compiled.slice(0, total);
}

function startCountdownTimer() {
  if (state.timerIntervalId) window.clearInterval(state.timerIntervalId);
  state.timeRemaining = 60;
  state.currentQuestionStartTime = Date.now();

  const countdownText = $('timer-countdown-value');
  const ringFill = $('timer-ring-fill');
  if (countdownText) countdownText.innerText = '60';
  if (ringFill) ringFill.style.strokeDashoffset = '0';

  const ringTotal = 282.7;
  state.timerIntervalId = window.setInterval(() => {
    state.timeRemaining -= 1;
    if (countdownText) countdownText.innerText = String(state.timeRemaining);
    if (ringFill) ringFill.style.strokeDashoffset = String(ringTotal - (state.timeRemaining / 60) * ringTotal);
    if (state.timeRemaining <= 0) {
      window.clearInterval(state.timerIntervalId);
      state.timerIntervalId = null;
      showToast('Time expired. Auto-submitting your answer.');
      handleAnswerFinished(true);
    }
  }, 1000);
}

function shutOffRecMode() {
  state.isRecording = false;
  $('audio-visualizer-panel')?.classList.add('hidden');
  const recordText = $('record-audio-text');
  const recordBtn = $('record-audio-btn');
  if (recordText) recordText.innerText = 'Record Answer Mock';
  if (recordBtn) recordBtn.classList.remove('btn-primary');
}

function initiateInterview(resumeFile, jdText, difficulty, totalQuestions) {
  state.selectedRoleType = detectCategory(jdText);
  state.jobDescription = jdText;
  state.totalQuestions = totalQuestions;
  state.resumeFilename = resumeFile ? resumeFile.name : state.resumeFilename || 'Preloaded Candidate Resume.pdf';
  state.currentDifficulty = difficulty;
  state.questionsList = buildQuestions(state.selectedRoleType, difficulty, totalQuestions);
  state.currentQuestionIndex = 0;
  state.userAnswers = [];
  return { firstQuestion: state.questionsList[0] };
}

function scoreAnswer(text) {
  const clean = text.trim();
  const wc = wordCount(clean);
  let score = 0;
  if (wc === 0) score = 0;
  else if (wc < 5) score = 15;
  else {
    score = 50;
    if (wc > 12) score += 10;
    if (wc > 35) score += 15;
    if (wc > 65) score += 15;
  }
  const lower = clean.toLowerCase();
  if (lower.includes('situation') || lower.includes('task') || lower.includes('action') || lower.includes('result')) score += 10;
  if (lower.includes('specific') || lower.includes('design') || lower.includes('architecture')) score += 5;
  return Math.min(100, score);
}

function submitAnswer(text, elapsedSec) {
  const score = scoreAnswer(text);
  state.userAnswers.push({
    question: state.questionsList[state.currentQuestionIndex],
    answer: text,
    timeTaken: elapsedSec,
    difficulty: state.currentDifficulty,
  });

  let updatedDifficulty = state.currentDifficulty;
  if (score > 80) updatedDifficulty = state.currentDifficulty === 'Easy' ? 'Medium' : state.currentDifficulty === 'Medium' ? 'Hard' : 'Hard';
  else if (score < 45) updatedDifficulty = state.currentDifficulty === 'Hard' ? 'Medium' : state.currentDifficulty === 'Medium' ? 'Easy' : 'Easy';

  const nextIndex = state.currentQuestionIndex + 1;
  const finished = nextIndex >= state.totalQuestions;
  let nextQuestion = null;

  if (!finished) {
    state.currentQuestionIndex = nextIndex;
    state.currentDifficulty = updatedDifficulty;
    const pool = QUESTIONS_BANK[state.selectedRoleType][updatedDifficulty];
    const used = new Set(state.userAnswers.map((a) => a.question));
    nextQuestion = pool.find((q) => !used.has(q)) || pool[0];
    state.questionsList[nextIndex] = nextQuestion;
  }

  return { score, updatedDifficulty, nextQuestion, isTerminated: finished };
}

function buildReport() {
  if (!state.userAnswers.length) {
    return {
      overallScore: 0, accuracy: 0, clarity: 0, depth: 0, relevance: 0, timeEfficiency: 0,
      strengths: ['No interview sessions recorded.'],
      weaknesses: ['Complete at least one answer to generate metrics.'],
    };
  }

  let totalWords = 0;
  let starCount = 0;
  let totalTime = 0;
  for (const item of state.userAnswers) {
    totalWords += wordCount(item.answer);
    totalTime += item.timeTaken;
    const lower = item.answer.toLowerCase();
    if (lower.includes('situation') || lower.includes('task') || lower.includes('action') || lower.includes('result')) starCount += 1;
  }

  const avgWords = totalWords / state.userAnswers.length;
  const avgTime = totalTime / state.userAnswers.length;
  const accuracy = Math.min(100, Math.round(75 + (avgWords > 28 ? 12 : 2) + Math.min(8, starCount * 4)));
  const clarity = Math.min(100, Math.round(78 + (avgWords > 15 ? 10 : -15)));
  const depth = Math.min(100, Math.round(52 + (avgWords > 60 ? 38 : avgWords > 30 ? 22 : 6)));
  const relevance = Math.min(100, Math.round(82 + (state.resumeFilename ? 10 : 4)));
  const timeEfficiency = avgTime > 54 ? 60 : avgTime < 14 ? 70 : 85;
  const overallScore = Math.round((accuracy + clarity + depth + relevance + timeEfficiency) / 5);

  const strengths = [];
  const weaknesses = [];
  if (starCount > 0) strengths.push('Excellent structural command with STAR framing.');
  else weaknesses.push('Use Situation, Task, Action, and Result for structure.');
  if (avgWords > 50) strengths.push(`Substantive delivery matched the ${state.selectedRoleType.toUpperCase()} profile.`);
  else weaknesses.push('Add more concrete metrics and examples.');
  if (state.resumeFilename) strengths.push('Job relevance connected your resume and the role.');
  if (avgTime > 48) weaknesses.push('Several answers approached the 60 second window.');
  else strengths.push('Balanced pacing kept answers efficient.');

  return { overallScore, accuracy, clarity, depth, relevance, timeEfficiency, strengths, weaknesses };
}

async function compileReportAndSwitchView() {
  const report = buildReport();
  $('final-score-text') && ($('final-score-text').innerText = String(report.overallScore));
  const ring = $('results-score-ring');
  if (ring) ring.style.strokeDashoffset = String(339.3 - (report.overallScore / 100) * 339.3);

  const descriptor = $('readiness-descriptor');
  const summary = $('assessment-verdict');
  if (descriptor && summary) {
    if (report.overallScore >= 85) {
      descriptor.innerText = 'Excellent Readiness!';
      descriptor.className = 'pill pill-green pill-lg';
      summary.innerText = 'Your responses demonstrate strong command of professional frameworks.';
    } else if (report.overallScore >= 70) {
      descriptor.innerText = 'Highly Ready';
      descriptor.className = 'pill pill-blue pill-lg';
      summary.innerText = 'Good domain comprehension and structured delivery. Polish specifics and metrics.';
    } else {
      descriptor.innerText = 'Needs Polishing';
      descriptor.className = 'pill pill-red pill-lg';
      summary.innerText = 'Answers were brief or timed out. Try another run with more detail.';
    }
  }

  const pairs = [
    ['metric-accuracy-val', report.accuracy],
    ['metric-clarity-val', report.clarity],
    ['metric-depth-val', report.depth],
    ['metric-relevance-val', report.relevance],
    ['metric-time-val', report.timeEfficiency],
  ];
  pairs.forEach(([id, value]) => $(id) && ($(id).innerText = `${value}%`));
  [['progress-accuracy', report.accuracy], ['progress-clarity', report.clarity], ['progress-depth', report.depth], ['progress-relevance', report.relevance], ['progress-time', report.timeEfficiency]].forEach(([id, value]) => $(id) && ($(id).style.width = `${value}%`));
  $('strengths-list') && ($('strengths-list').innerHTML = report.strengths.map((s) => `<li>${s}</li>`).join(''));
  $('weaknesses-list') && ($('weaknesses-list').innerHTML = report.weaknesses.map((s) => `<li>${s}</li>`).join(''));
  switchView('results-view');
}

async function handleAnswerFinished(isTimeout = false) {
  if (state.timerIntervalId) {
    window.clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }
  const answerArea = $('answer-textarea');
  const submitBtn = $('submit-answer-btn');
  if (submitBtn) submitBtn.disabled = true;

  const answer = isTimeout ? ((answerArea && answerArea.value) || '[No response before timeout]') : ((answerArea && answerArea.value) || '');
  const elapsed = Math.max(1, Math.round((Date.now() - state.currentQuestionStartTime) / 1000));
  const result = submitAnswer(answer, elapsed);

  if (answerArea) answerArea.value = '';
  updateCharCount(0);

  if (result.isTerminated || !result.nextQuestion) {
    showToast('Interview finished. Generating results...');
    await compileReportAndSwitchView();
    return;
  }

  $('question-progress-label') && ($('question-progress-label').innerText = `Question ${state.currentQuestionIndex + 1} of ${state.totalQuestions}`);
  $('question-text') && ($('question-text').innerText = result.nextQuestion);
  $('debug-difficulty-indicator') && ($('debug-difficulty-indicator').innerText = result.updatedDifficulty);
  $('debug-difficulty-indicator') && ($('debug-difficulty-indicator').className = `pill ${result.updatedDifficulty === 'Easy' ? 'pill-blue' : result.updatedDifficulty === 'Medium' ? 'pill-green' : 'pill-red'}`);
  $('debug-current-index') && ($('debug-current-index').innerText = `${state.currentQuestionIndex + 1} / ${state.totalQuestions}`);
  $('interview-progress-bar') && ($('interview-progress-bar').style.width = `${(state.currentQuestionIndex / state.totalQuestions) * 100}%`);
  if (submitBtn) submitBtn.disabled = false;
  shutOffRecMode();
  startCountdownTimer();
}

function init() {
  switchView('onboarding-view');
  renderBestPractices('swe');

  const resumeDropzone = $('resume-dropzone');
  const resumeInput = $('resume-input');
  const fileBanner = $('file-banner');
  const fileSpan = $('file-name-span');
  const removeFileBtn = $('remove-file-btn');
  const jdTextarea = $('jd-textarea');
  const startBtn = $('start-interview-btn');
  const answerTextarea = $('answer-textarea');
  const recordAudioBtn = $('record-audio-btn');
  const submitAnswerBtn = $('submit-answer-btn');
  const restartBtn = $('restart-btn');
  const exportBtn = $('export-report-btn');
  const categorySelect = $('category-select');
  const debugToggleBtn = $('debug-toggle-btn');
  const debugPanelBody = $('debug-panel-body');
  const debugArrow = $('debug-arrow');

  categorySelect?.addEventListener('change', () => {
    state.selectedRoleType = categorySelect.value;
    renderBestPractices(categorySelect.value);
  });

  document.querySelectorAll('.prefill-resume-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      if (type && PREFILLS.resume[type]) {
        state.resumeFilename = type === 'swe' ? 'Software_Engineer_Resume.pdf' : 'Product_Manager_Resume.pdf';
        if (fileSpan) fileSpan.innerText = state.resumeFilename;
        fileBanner?.classList.remove('hidden');
        showToast('Resume prefilled successfully.');
        if (categorySelect) {
          categorySelect.value = type;
          state.selectedRoleType = type;
          renderBestPractices(type);
        }
      }
    });
  });

  document.querySelectorAll('.prefill-jd-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      if (type && PREFILLS.jd[type] && jdTextarea) {
        jdTextarea.value = PREFILLS.jd[type];
        updateWordCounter();
        showToast('Job description prefilled successfully.');
        if (categorySelect) {
          categorySelect.value = type;
          state.selectedRoleType = type;
          renderBestPractices(type);
        }
      }
    });
  });

  jdTextarea?.addEventListener('input', updateWordCounter);
  answerTextarea?.addEventListener('input', () => updateCharCount(answerTextarea.value.length));

  resumeDropzone?.addEventListener('click', (event) => {
    if (event.target && event.target.closest && event.target.closest('button')) return;
    resumeInput?.click();
  });
  resumeDropzone?.addEventListener('dragover', (event) => {
    event.preventDefault();
    resumeDropzone.classList.add('drag-active');
  });
  resumeDropzone?.addEventListener('dragleave', () => resumeDropzone.classList.remove('drag-active'));
  resumeDropzone?.addEventListener('drop', (event) => {
    event.preventDefault();
    resumeDropzone.classList.remove('drag-active');
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      state.resumeFilename = file.name;
      if (fileSpan) fileSpan.innerText = file.name;
      fileBanner?.classList.remove('hidden');
      showToast(`Resume uploaded: ${file.name}`);
    }
  });
  resumeInput?.addEventListener('change', () => {
    const file = resumeInput.files?.[0];
    if (file) {
      state.resumeFilename = file.name;
      if (fileSpan) fileSpan.innerText = file.name;
      fileBanner?.classList.remove('hidden');
      showToast(`Resume uploaded: ${file.name}`);
    }
  });
  removeFileBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    state.resumeFilename = '';
    if (resumeInput) resumeInput.value = '';
    fileBanner?.classList.add('hidden');
    showToast('Resume cleared.');
  });

  debugToggleBtn?.addEventListener('click', () => {
    const active = debugPanelBody?.classList.contains('active');
    if (!debugPanelBody || !debugArrow) return;
    if (active) {
      debugPanelBody.classList.remove('active');
      debugArrow.innerText = 'v';
    } else {
      debugPanelBody.classList.add('active');
      debugArrow.innerText = '^';
    }
  });

  startBtn?.addEventListener('click', () => {
    const jdText = jdTextarea?.value.trim() || '';
    if (!jdText) {
      showToast('Please provide a job description first.');
      jdTextarea?.focus();
      return;
    }

    const diff = $('difficulty-select')?.value || 'Medium';
    const total = Number($('questions-count-select')?.value || 5);
    const file = resumeInput?.files?.[0] || null;
    const initResult = initiateInterview(file, jdText, diff, total);
    $('question-progress-label') && ($('question-progress-label').innerText = `Question 1 of ${state.totalQuestions}`);
    $('question-text') && ($('question-text').innerText = initResult.firstQuestion);
    $('debug-difficulty-indicator') && ($('debug-difficulty-indicator').innerText = state.currentDifficulty);
    $('debug-current-index') && ($('debug-current-index').innerText = `1 / ${state.totalQuestions}`);
    $('interview-progress-bar') && ($('interview-progress-bar').style.width = '0%');
    submitAnswerBtn && (submitAnswerBtn.disabled = false);
    switchView('interview-view');
    startCountdownTimer();
  });

  submitAnswerBtn?.addEventListener('click', () => handleAnswerFinished(false));

  recordAudioBtn?.addEventListener('click', () => {
    const visualizer = $('audio-visualizer-panel');
    const recordText = $('record-audio-text');
    const audioStatus = $('audio-status-text');
    const answerArea = $('answer-textarea');

    if (!state.isRecording) {
      state.isRecording = true;
      recordAudioBtn.classList.add('btn-primary');
      if (recordText) recordText.innerText = 'Interpreting Speech...';
      visualizer?.classList.remove('hidden');
      if (audioStatus) audioStatus.innerText = 'Listening for transcription...';
      const transcript = TRANSCRIPTS[state.selectedRoleType][Math.floor(Math.random() * TRANSCRIPTS[state.selectedRoleType].length)];
      if (answerArea) answerArea.value = 'VOICE: ' + transcript;
      updateCharCount(answerArea ? answerArea.value.length : 0);
      setTimeout(() => {
        if (audioStatus) audioStatus.innerText = 'Speech analyzed and inserted.';
        shutOffRecMode();
      }, 900);
    } else {
      shutOffRecMode();
    }
  });

  const hearEvaluationBtn = $('hear-evaluation-btn');
  const stopEvaluationBtn = $('stop-evaluation-btn');
  const audioPlaybackStatus = $('audio-playback-status');
  const handleSpeechEnd = () => {
    stopEvaluationBtn?.classList.add('hidden');
    hearEvaluationBtn?.classList.remove('hidden');
    if (audioPlaybackStatus) audioPlaybackStatus.innerText = 'Finished reading evaluation highlights.';
  };

  hearEvaluationBtn?.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis is not supported in this browser.');
      return;
    }
    const strengths = Array.from(($('strengths-list')?.querySelectorAll('li') || [])).map((li) => li.innerText).join('. ');
    const weaknesses = Array.from(($('weaknesses-list')?.querySelectorAll('li') || [])).map((li) => li.innerText).join('. ');
    const text = `Here are your core strengths. ${strengths} Here are your growth opportunities. ${weaknesses}`;
    const utterance = new SpeechSynthesisUtterance(text || 'Your interview evaluation is ready.');
    utterance.onstart = () => {
      stopEvaluationBtn?.classList.remove('hidden');
      hearEvaluationBtn?.classList.add('hidden');
      if (audioPlaybackStatus) audioPlaybackStatus.innerText = 'Speaking now.';
    };
    utterance.onend = handleSpeechEnd;
    utterance.onerror = handleSpeechEnd;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });

  stopEvaluationBtn?.addEventListener('click', () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    handleSpeechEnd();
  });

  restartBtn?.addEventListener('click', () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    switchView('onboarding-view');
  });

  exportBtn?.addEventListener('click', () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    showToast('Opening print dialog...');
    window.print();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
