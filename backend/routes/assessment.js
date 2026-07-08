const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { Assessment, Attempt } = require('../models/Assessment');
const Registration = require('../models/Registration');
const { sendTestInviteEmail } = require('../utils/mailer');
const { runSql, checkSqlAnswer } = require('../utils/sqlRunner');

// ─── helpers ────────────────────────────────────────────────────────────────
const adminGuard = (req, res, next) => {
  if (req.headers['x-admin-token'] !== (process.env.ADMIN_PASSWORD || 'rancom@2026'))
    return res.status(401).json({ error: 'Unauthorized.' });
  next();
};
const genCode  = () => crypto.randomBytes(3).toString('hex').toUpperCase();
const shuffle  = arr => [...arr].sort(() => Math.random() - 0.5);

// ════════════════════════════════════════════════════════════════════════════
// ADMIN — CRUD
// ════════════════════════════════════════════════════════════════════════════

router.get('/admin/list', adminGuard, async (req, res) => {
  try {
    const list = await Assessment.find()
      .select('-questions.correct -questions.modelAnswer -questions.sqlExpected')
      .sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/admin/stats', adminGuard, async (req, res) => {
  try {
    const [totalTests, totalAttempts, passedAttempts] = await Promise.all([
      Assessment.countDocuments(),
      Attempt.countDocuments({ status: 'submitted' }),
      Attempt.countDocuments({ status: 'submitted', passed: true })
    ]);
    res.json({ totalTests, totalAttempts, passedAttempts });
  } catch { res.json({ totalTests: 0, totalAttempts: 0, passedAttempts: 0 }); }
});

router.get('/admin/:id', adminGuard, async (req, res) => {
  try {
    const a = await Assessment.findById(req.params.id).lean();
    if (!a) return res.status(404).json({ error: 'Not found' });
    res.json(a);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/admin/create', adminGuard, async (req, res) => {
  try {
    const { title, description, jobTitle, duration, passingScore,
            maxAttempts, shuffleQuestions, shuffleOptions,
            showResult, scheduledAt, expiresAt } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const a = new Assessment({
      title, description, jobTitle, duration, passingScore,
      maxAttempts, shuffleQuestions, shuffleOptions, showResult,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      expiresAt:   expiresAt   ? new Date(expiresAt)   : null
    });
    await a.save();
    res.status(201).json({ message: 'Assessment created.', assessment: a });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/admin/:id', adminGuard, async (req, res) => {
  try {
    const a = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!a) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated.', assessment: a });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/admin/:id', adminGuard, async (req, res) => {
  try {
    await Assessment.findByIdAndDelete(req.params.id);
    await Attempt.deleteMany({ assessment: req.params.id });
    res.json({ message: 'Deleted.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Questions ────────────────────────────────────────────────────────────────
router.post('/admin/:id/question', adminGuard, async (req, res) => {
  try {
    const a = await Assessment.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    a.questions.push(req.body);
    await a.save();
    res.json({ message: 'Question added.', total: a.questions.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/admin/:id/question/:qid', adminGuard, async (req, res) => {
  try {
    const a = await Assessment.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    a.questions = a.questions.filter(q => q._id.toString() !== req.params.qid);
    await a.save();
    res.json({ message: 'Question removed.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Invite candidates ────────────────────────────────────────────────────────
router.post('/admin/:id/invite', adminGuard, async (req, res) => {
  try {
    const { candidateIds } = req.body;
    const a = await Assessment.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });

    const regs = await Registration.find({ _id: { $in: candidateIds } }).lean();
    let added = 0;
    const toEmail = [];

    for (const reg of regs) {
      const already = a.invitedCandidates.some(ic => ic.registrationId?.toString() === reg._id.toString());
      if (!already) {
        const code = genCode();
        a.invitedCandidates.push({ registrationId: reg._id, email: reg.email, name: `${reg.first_name} ${reg.last_name}`.trim(), accessCode: code });
        toEmail.push({ email: reg.email, name: `${reg.first_name} ${reg.last_name}`.trim(), code });
        added++;
      }
    }
    await a.save();

    const testUrl = `${process.env.FRONTEND_URL || 'https://www.rancomtechnologies.com'}/test/${a._id}`;
    toEmail.forEach(({ email, name, code }) => {
      sendTestInviteEmail({ to: email, name, assessmentTitle: a.title, accessCode: code, testUrl, duration: a.duration, expiresAt: a.expiresAt })
        .catch(err => console.error(`[Invite] Email failed for ${email}:`, err.message));
    });

    res.json({ message: `${added} candidate(s) invited. Emails sent.` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/admin/:id/invite/:email', adminGuard, async (req, res) => {
  try {
    const a = await Assessment.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    a.invitedCandidates = a.invitedCandidates.filter(ic => ic.email !== req.params.email.toLowerCase());
    await a.save();
    res.json({ message: 'Candidate removed.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/admin/:id/resend-invite/:email', adminGuard, async (req, res) => {
  try {
    const a = await Assessment.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    const ic = a.invitedCandidates.find(c => c.email === req.params.email.toLowerCase());
    if (!ic) return res.status(404).json({ error: 'Candidate not found.' });
    const testUrl = `${process.env.FRONTEND_URL || 'https://www.rancomtechnologies.com'}/test/${a._id}`;
    await sendTestInviteEmail({ to: ic.email, name: ic.name, assessmentTitle: a.title, accessCode: ic.accessCode, testUrl, duration: a.duration, expiresAt: a.expiresAt });
    res.json({ message: `Invite resent to ${ic.email}.` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Reports ──────────────────────────────────────────────────────────────────
router.get('/admin/:id/attempts', adminGuard, async (req, res) => {
  try {
    const attempts = await Attempt.find({ assessment: req.params.id }).sort({ startedAt: -1 }).lean();
    res.json(attempts);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Admin SQL runner (test a query against a schema) ─────────────────────────
router.post('/admin/run-sql', adminGuard, (req, res) => {
  const { schema, query } = req.body;
  if (!query) return res.status(400).json({ error: 'query is required.' });
  const result = runSql(schema || '', query);
  res.json(result);
});

// ════════════════════════════════════════════════════════════════════════════
// CANDIDATE ENDPOINTS
// ════════════════════════════════════════════════════════════════════════════

// Verify access code
router.post('/verify-access', async (req, res) => {
  try {
    const { assessmentId, email, accessCode } = req.body;
    const a = await Assessment.findById(assessmentId);
    if (!a || !a.isActive) return res.status(404).json({ error: 'Assessment not found or inactive.' });
    if (a.expiresAt && new Date() > a.expiresAt) return res.status(410).json({ error: 'This assessment has expired.' });

    const invited = a.invitedCandidates.find(
      ic => ic.email === email.toLowerCase().trim() && ic.accessCode === accessCode.toUpperCase().trim()
    );
    if (!invited) return res.status(403).json({ error: 'Invalid email or access code.' });

    const prev = await Attempt.countDocuments({ assessment: assessmentId, 'candidate.email': email.toLowerCase() });
    if (prev >= a.maxAttempts) return res.status(409).json({ error: `Maximum ${a.maxAttempts} attempt(s) allowed.` });

    res.json({ valid: true, name: invited.name, assessmentTitle: a.title, duration: a.duration, questionCount: a.questions.length, description: a.description });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Start attempt — return sanitized questions
router.post('/start', async (req, res) => {
  try {
    const { assessmentId, email, accessCode } = req.body;
    const a = await Assessment.findById(assessmentId);
    if (!a || !a.isActive) return res.status(404).json({ error: 'Assessment not found.' });

    const invited = a.invitedCandidates.find(ic => ic.email === email.toLowerCase() && ic.accessCode === accessCode.toUpperCase());
    if (!invited) return res.status(403).json({ error: 'Access denied.' });

    const prev = await Attempt.countDocuments({ assessment: assessmentId, 'candidate.email': email.toLowerCase(), status: { $in: ['submitted', 'terminated'] } });
    if (prev >= a.maxAttempts) return res.status(409).json({ error: 'Max attempts reached.' });

    let attempt = await Attempt.findOne({ assessment: assessmentId, 'candidate.email': email.toLowerCase(), status: 'in-progress' });

    const questions = a.shuffleQuestions ? shuffle(a.questions) : [...a.questions];

    // Sanitize — strip correct answers, model answers, SQL expected output
    const sanitized = questions.map(q => ({
      _id:       q._id,
      text:      q.text,
      type:      q.type,
      options:   a.shuffleOptions && q.options?.length ? shuffle(q.options) : (q.options || []),
      marks:     q.marks,
      topic:     q.topic,
      // SQL fields safe to send
      sqlSchema: q.sqlSchema || '',
      sqlHint:   q.sqlHint   || '',
      explanation: '' // never send explanation before submission
    }));

    if (!attempt) {
      attempt = new Attempt({ assessment: assessmentId, candidate: { registrationId: invited.registrationId || null, email: email.toLowerCase(), name: invited.name, accessCode: accessCode.toUpperCase() }, startedAt: new Date() });
      await attempt.save();
    }

    res.json({ attemptId: attempt._id, questions: sanitized, duration: a.duration, title: a.title, startedAt: attempt.startedAt });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Candidate SQL test-run (run query, see output, no grading)
router.post('/run-sql', async (req, res) => {
  const { schema, query } = req.body;
  if (!query) return res.status(400).json({ error: 'query is required.' });
  const result = runSql(schema || '', query);
  res.json(result);
});

// Submit full test
router.post('/submit', async (req, res) => {
  try {
    const { attemptId, answers, timeTaken } = req.body;
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (attempt.status !== 'in-progress') return res.status(400).json({ error: 'Already submitted.' });

    const a = await Assessment.findById(attempt.assessment);
    if (!a) return res.status(404).json({ error: 'Assessment not found.' });

    let earned = 0, total = 0;
    const gradedAnswers = (answers || []).map(ans => {
      const q = a.questions.id(ans.questionId);
      if (!q) return { questionId: ans.questionId, answer: ans.answer, isCorrect: false, marks: 0 };
      total += q.marks;

      if (q.type === 'mcq') {
        const isCorrect = q.correct.trim().toLowerCase() === String(ans.answer || '').trim().toLowerCase();
        if (isCorrect) earned += q.marks;
        return { questionId: ans.questionId, answer: ans.answer, isCorrect, marks: isCorrect ? q.marks : 0 };
      }

      if (q.type === 'theory') {
        // Manual grading — award full marks pending review
        earned += q.marks;
        return { questionId: ans.questionId, answer: ans.answer, isCorrect: null, marks: q.marks };
      }

      if (q.type === 'sql') {
        const { passed, error, output } = checkSqlAnswer(q.sqlSchema || '', ans.answer || '', q.sqlExpected || '');
        const m = passed ? q.marks : 0;
        earned += m;
        return { questionId: ans.questionId, answer: ans.answer, isCorrect: passed, marks: m, sqlOutput: output, sqlError: error || '' };
      }

      return { questionId: ans.questionId, answer: ans.answer, isCorrect: false, marks: 0 };
    });

    // Count total for unanswered questions
    a.questions.forEach(q => {
      const done = (answers || []).some(a => a.questionId?.toString() === q._id.toString());
      if (!done) total += q.marks;
    });

    const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
    const passed     = percentage >= a.passingScore;

    attempt.answers     = gradedAnswers;
    attempt.score       = earned;
    attempt.totalMarks  = total;
    attempt.percentage  = percentage;
    attempt.passed      = passed;
    attempt.timeTaken   = timeTaken || 0;
    attempt.status      = 'submitted';
    attempt.submittedAt = new Date();
    await attempt.save();

    res.json(a.showResult
      ? { message: 'Submitted.', score: earned, total, percentage, passed, passingScore: a.passingScore }
      : { submitted: true }
    );
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Log anti-cheat violation
router.post('/violation', async (req, res) => {
  try {
    const { attemptId, type } = req.body;
    const attempt = await Attempt.findById(attemptId);
    if (!attempt || attempt.status !== 'in-progress') return res.status(400).json({ error: 'Invalid attempt.' });

    const ex = attempt.violations.find(v => v.type === type);
    if (ex) { ex.count += 1; ex.timestamp = new Date(); }
    else attempt.violations.push({ type, count: 1 });

    const tabViol = attempt.violations.find(v => v.type === 'tab-switch');
    if (tabViol && tabViol.count >= 3) { attempt.status = 'terminated'; attempt.submittedAt = new Date(); }

    await attempt.save();
    res.json({ status: attempt.status, violations: attempt.violations });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// View result
router.get('/result/:attemptId', async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId).populate('assessment', 'title passingScore showResult questions').lean();
    if (!attempt) return res.status(404).json({ error: 'Not found' });
    if (attempt.candidate.email !== req.query.email?.toLowerCase()) return res.status(403).json({ error: 'Forbidden' });
    const a = attempt.assessment;
    if (!a.showResult) return res.json({ submitted: true, message: 'Results hidden by administrator.' });

    const reviewed = attempt.answers.map(ans => {
      const q = a.questions?.find(q => q._id?.toString() === ans.questionId?.toString());
      return { ...ans, questionText: q?.text || '', correctAnswer: q?.type === 'theory' ? '(manually graded)' : (q?.correct || q?.sqlExpected || ''), explanation: q?.explanation || '' };
    });

    res.json({ title: a.title, score: attempt.score, totalMarks: attempt.totalMarks, percentage: attempt.percentage, passed: attempt.passed, passingScore: a.passingScore, timeTaken: attempt.timeTaken, status: attempt.status, violations: attempt.violations, answers: reviewed });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
