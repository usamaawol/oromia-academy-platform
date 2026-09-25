//#region node_modules/.nitro/vite/services/ssr/assets/exam-engine-C-iWJGOh.js
function autoGrade(presented, questions, answers) {
	const byId = new Map(questions.map((q) => [q.id, q]));
	let autoScore = 0;
	let totalPoints = 0;
	let correctCount = 0;
	let wrongCount = 0;
	let unansweredCount = 0;
	let needsManualGrading = false;
	for (const p of presented) {
		const q = byId.get(p.questionId);
		if (!q) continue;
		totalPoints += q.points;
		const answer = answers[q.id];
		if (answer === void 0 || answer === "") {
			unansweredCount++;
			if (q.type === "short" || q.type === "essay") needsManualGrading = true;
			continue;
		}
		if (q.type === "mcq") if (answer === q.correctOptionId) {
			autoScore += q.points;
			correctCount++;
		} else wrongCount++;
		else if (q.type === "truefalse") if (answer === String(q.correctBool)) {
			autoScore += q.points;
			correctCount++;
		} else wrongCount++;
		else needsManualGrading = true;
	}
	return {
		autoScore,
		totalPoints,
		correctCount,
		wrongCount,
		unansweredCount,
		needsManualGrading
	};
}
function examWindowState(exam, now) {
	if (exam.startAt && now < exam.startAt) return "before";
	if (exam.endAt && now > exam.endAt) return "after";
	return "open";
}
function formatClock(ms) {
	const total = Math.max(0, Math.floor(ms / 1e3));
	const h = Math.floor(total / 3600);
	const m = Math.floor(total % 3600 / 60);
	const s = total % 60;
	const pad = (n) => String(n).padStart(2, "0");
	return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
//#endregion
export { examWindowState as n, formatClock as r, autoGrade as t };
