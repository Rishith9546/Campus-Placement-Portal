// Readiness factors and targets live here so later preparation modules can
// add factors without embedding scoring rules in a React component.
export const PLACEMENT_READINESS_CONFIG = Object.freeze({
  maximumScore: 100,
  // Reserve 20 points for DSA and 12 for Aptitude. Active factors are
  // normalized to 100 so unavailable modules do not count as zero.
  weights: Object.freeze({
    profileCompletion: 48,
    resumeAvailability: 16,
    skillsCompletion: 16,
    dsaPerformance: 20,
    aptitudePerformance: 12,
  }),
  targetSkillCount: 5,
  profileFields: Object.freeze([
    ["name", "Full name"],
    ["email", "Email"],
    ["phone", "Phone number"],
    ["rollNo", "Roll number"],
    ["branch", "Branch"],
    ["collegeName", "College"],
    ["degree", "Degree"],
    ["graduationYear", "Graduation year"],
    ["cgpa", "CGPA"],
    ["skills", "Skills"],
    ["resume", "Resume"],
  ]),
  levels: Object.freeze([
    { minimum: 90, label: "Excellent Preparation", message: "You have built a strong foundation. Keep your profile and skills current." },
    { minimum: 75, label: "Placement Ready", message: "You’re well prepared across the areas currently measured." },
    { minimum: 60, label: "Good Progress", message: "You’re making good progress. A few focused updates can strengthen your readiness." },
    { minimum: 40, label: "Developing", message: "You’re building your foundation. Complete the next recommended profile steps." },
    { minimum: 0, label: "Getting Started", message: "Start with your profile, resume, and skills to build placement readiness." },
  ]),
});

const hasValue = (value) => {
  if (value == null) return false;
  return typeof value === "string" ? value.trim().length > 0 : true;
};

export function getUniqueStudentSkills(skills) {
  if (typeof skills !== "string") return [];
  const unique = new Map();
  skills.split(/[,;\n]+/).map((skill) => skill.trim()).filter(Boolean).forEach((skill) => {
    const normalized = skill.toLocaleLowerCase();
    if (!unique.has(normalized)) unique.set(normalized, skill);
  });
  return [...unique.values()];
}

export function getProfileCompletion(profile = {}) {
  const fields = PLACEMENT_READINESS_CONFIG.profileFields;
  const completed = fields.filter(([key]) => key === "skills"
    ? getUniqueStudentSkills(profile?.skills).length > 0
    : hasValue(profile?.[key])).length;
  return {
    percentage: Math.round((completed / fields.length) * 100),
    completed,
    total: fields.length,
    missing: fields.filter(([key]) => key === "skills"
      ? getUniqueStudentSkills(profile?.skills).length === 0
      : !hasValue(profile?.[key])).map(([, label]) => label),
  };
}

export function calculatePlacementReadiness(profile = {}, { dsaStats = null, aptitudeAnalytics = null, resumeAnalysis = null, additionalFactors = [] } = {}) {
  const { weights, targetSkillCount, maximumScore, levels } = PLACEMENT_READINESS_CONFIG;
  const profileCompletion = getProfileCompletion(profile);
  const skills = getUniqueStudentSkills(profile?.skills);
  const skillsProgress = Math.min(skills.length / targetSkillCount, 1);
  const savedResumeScore = Number(resumeAnalysis?.score);
  const resumeAnalysisAvailable = resumeAnalysis?.status === "COMPLETED" && Number.isFinite(savedResumeScore);
  const resumeFactorScore = resumeAnalysisAvailable
    ? Math.max(0, Math.min(100, savedResumeScore))
    : hasValue(profile?.resume) ? 100 : 0;
  const components = [
    {
      id: "profile",
      label: "Profile completion",
      score: profileCompletion.percentage,
      weight: weights.profileCompletion,
      detail: `${profileCompletion.percentage}% complete · ${profileCompletion.completed} of ${profileCompletion.total} required profile items`,
    },
    {
      id: "resume",
      label: resumeAnalysisAvailable ? "Resume quality" : "Resume availability",
      score: resumeFactorScore,
      weight: weights.resumeAvailability,
      detail: resumeAnalysisAvailable
        ? `Validated AI resume quality estimate: ${resumeFactorScore}/100`
        : hasValue(profile?.resume) ? "Resume uploaded · analyze it to use its quality score" : "No resume uploaded",
    },
    {
      id: "skills",
      label: "Skills completion",
      score: Math.round(skillsProgress * 100),
      weight: weights.skillsCompletion,
      detail: `${Math.min(skills.length, targetSkillCount)} of ${targetSkillCount} target skills${skills.length > targetSkillCount ? ` · ${skills.length} saved` : ""}`,
    },
  ];
  const dsaScore = Number(dsaStats?.readinessScore);
  if (dsaStats && Number.isFinite(dsaScore)) {
    components.push({
      id: "dsa",
      label: "DSA preparation",
      score: Math.max(0, Math.min(100, dsaScore)),
      weight: weights.dsaPerformance,
      detail: `${Number(dsaStats.solvedCount) || 0} unique problems solved · ${Number(dsaStats.overallProgressPercentage) || 0}% of ${Number(dsaStats.solvedBenchmark) || 150}-problem benchmark · DSA score ${Math.max(0, Math.min(100, dsaScore))}/100`,
    });
  }
  const aptitudeScore = Number(aptitudeAnalytics?.aptitudeReadinessScore);
  if (aptitudeAnalytics && Number.isFinite(aptitudeScore) && Number(aptitudeAnalytics.completedAttempts) > 0) {
    components.push({
      id: "aptitude",
      label: "Aptitude preparation",
      score: Math.max(0, Math.min(100, aptitudeScore)),
      weight: weights.aptitudePerformance,
      detail: `${aptitudeAnalytics.completedAttempts} completed attempts · ${aptitudeAnalytics.averageAccuracy}% average accuracy · ${aptitudeAnalytics.topicCoveragePercentage}% topic coverage${aptitudeAnalytics.consistencyScore == null ? " · consistency available after another attempt" : ` · consistency ${aptitudeAnalytics.consistencyScore}%`}`,
    });
  }
  additionalFactors.filter((factor) => factor && typeof factor.id === "string"
    && Number.isFinite(Number(factor.score)) && Number(factor.weight) > 0).forEach((factor) => {
    components.push({
      id: factor.id,
      label: factor.label || factor.id,
      score: Math.max(0, Math.min(100, Number(factor.score))),
      weight: Number(factor.weight),
      detail: factor.detail || "",
    });
  });
  const activeWeight = components.reduce((total, factor) => total + factor.weight, 0);
  const factors = components.map((factor) => ({
    id: factor.id,
    label: factor.label,
    earnedPoints: activeWeight ? factor.score * factor.weight / activeWeight : 0,
    maximumPoints: activeWeight ? factor.weight * 100 / activeWeight : 0,
    progress: factor.score,
    detail: factor.detail,
  }));
  const rawScore = factors.reduce((total, factor) => total + factor.earnedPoints, 0);
  const score = Math.max(0, Math.min(maximumScore, Math.round(rawScore)));
  const level = levels.find(({ minimum }) => score >= minimum) || levels[levels.length - 1];
  const recommendations = [];

  if (profileCompletion.percentage < 100) {
    recommendations.push({
      id: "profile",
      title: "Complete your profile",
      detail: `Add the missing information: ${profileCompletion.missing.join(", ")}.`,
      action: "Complete profile",
      to: "/profile",
    });
  }
  if (!hasValue(profile?.resume)) {
    recommendations.push({
      id: "resume",
      title: "Upload your resume",
      detail: "Add a current PDF resume to complete the resume availability factor.",
      action: "Upload resume",
      to: "/profile#resume",
    });
  }
  if (hasValue(profile?.resume) && !resumeAnalysisAvailable) {
    recommendations.push({ id: "resume-analysis", title: "Analyze your resume", detail: "Run the resume analyzer to include its validated quality estimate in your readiness score.", action: "Analyze resume", to: "/resume-analyzer" });
  } else if (resumeAnalysisAvailable && resumeFactorScore < 80) {
    recommendations.push({ id: "resume-analysis", title: "Improve your resume score", detail: "Review the latest saved section feedback and suggestions, then analyze your updated PDF again.", action: "Review resume feedback", to: "/resume-analyzer" });
  }
  if (skills.length < targetSkillCount) {
    const remaining = targetSkillCount - skills.length;
    recommendations.push({
      id: "skills",
      title: "Add relevant skills",
      detail: `Add ${remaining} more ${remaining === 1 ? "skill" : "skills"} to reach the ${targetSkillCount}-skill target.`,
      action: "Update skills",
      to: "/profile#skills",
    });
  }
  if (dsaStats && Number.isFinite(dsaScore) && dsaScore < 100) {
    const solved = Number(dsaStats.solvedCount) || 0;
    const benchmark = Number(dsaStats.solvedBenchmark) || 150;
    const solvedTopics = Number(dsaStats.solvedTopicsCount) || 0;
    const totalTopics = Number(dsaStats.availableTopicCount) || 22;
    recommendations.push({
      id: "dsa",
      title: solved === 0 ? "Log your first DSA problem" : "Keep building DSA coverage",
      detail: solved === 0
        ? "Record a problem you have solved to start tracking coding preparation."
        : `${solved} of ${benchmark} benchmark problems and solved coverage in ${solvedTopics} of ${totalTopics} topics. The benchmark is a preparation target, not a placement guarantee.`,
      action: solved === 0 ? "Open DSA tracker" : "View DSA progress",
      to: "/dsa-tracker",
    });
  }
  if (aptitudeAnalytics) {
    if (Number(aptitudeAnalytics.completedAttempts) === 0) {
      recommendations.push({ id: "aptitude", title: "Start aptitude practice", detail: "Complete an aptitude practice or timed test to add real assessment data to your readiness score.", action: "Practice aptitude", to: "/aptitude" });
    } else if (aptitudeScore < 100) {
      const weak = (aptitudeAnalytics.weakTopics || []).slice(0, 2).map((item) => item.topic?.toLowerCase().replaceAll("_", " "));
      recommendations.push({ id: "aptitude", title: weak.length ? `Practice ${weak.join(" and ")}` : "Build aptitude topic coverage", detail: weak.length ? "These topics have at least five saved answers and below 60% accuracy." : "Practice more topics to strengthen coverage and build a reliable score history.", action: "Continue practice", to: "/aptitude" });
    }
  }

  return {
    score,
    level: level.label,
    message: level.message,
    profileCompletion,
    skills,
    factors,
    recommendations,
    missingProfileItems: profileCompletion.missing,
    includedFactors: factors.map(({ id, label }) => ({ id, label })),
    dsaAvailable: Boolean(dsaStats && Number.isFinite(dsaScore)),
    excludedFactors: [
      ...(dsaStats && Number.isFinite(dsaScore) ? [] : ["DSA progress (currently unavailable)"]),
      ...(aptitudeAnalytics && Number.isFinite(aptitudeScore) && Number(aptitudeAnalytics.completedAttempts) > 0 ? [] : ["Aptitude (no completed attempt yet)"]),
      "Technical assessments", "Mock interview history", ...(resumeAnalysisAvailable ? [] : ["Resume quality"]), "Training",
    ],
    resumeAnalysisAvailable,
    aptitudeAvailable: Boolean(aptitudeAnalytics && Number.isFinite(aptitudeScore) && Number(aptitudeAnalytics.completedAttempts) > 0),
  };
}
