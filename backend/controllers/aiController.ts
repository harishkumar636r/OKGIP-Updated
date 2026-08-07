import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../config/db';
import { queryAsync } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { getExternalCourses } from '../services/externalCourseService';

const getAiClient = () => {
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return null;
};

// 1. AI Training Recommendations
export const getAiRecommendations = async (req: Request, res: Response) => {
  try {
    const gaps = db.knowledgeGaps;
    const skills = db.skills;
    const programs = db.trainingPrograms;

    const courseMap: Record<string, any[]> = {
      'Cloud Infrastructure (AWS/GCP)': [
        { title: 'AWS Certified Cloud Practitioner Mastery', duration: '20 Hours', provider: 'AWS Training', difficulty: 'Beginner', priority: 'High', matchScore: 98 },
        { title: 'Docker & Containerization Essentials', duration: '12 Hours', provider: 'Docker Academy', difficulty: 'Intermediate', priority: 'High', matchScore: 95 },
        { title: 'Kubernetes Production Fundamentals (CKA)', duration: '28 Hours', provider: 'CNCF Labs', difficulty: 'Advanced', priority: 'High', matchScore: 92 },
        { title: 'Azure Administrator Associate (AZ-104)', duration: '24 Hours', provider: 'Microsoft Learn', difficulty: 'Intermediate', priority: 'Medium', matchScore: 88 },
      ],
      'React & Frontend Architecture': [
        { title: 'Advanced React 19 State Patterns & Performance', duration: '18 Hours', provider: 'Frontend Masters', difficulty: 'Advanced', priority: 'High', matchScore: 96 },
        { title: 'Next.js 15 Full Stack Architecture', duration: '16 Hours', provider: 'Vercel Academy', difficulty: 'Intermediate', priority: 'High', matchScore: 93 },
        { title: 'TypeScript for Enterprise React Applications', duration: '10 Hours', provider: 'Ultimate Courses', difficulty: 'Intermediate', priority: 'Medium', matchScore: 90 },
      ],
      'Node.js & Microservices': [
        { title: 'Node.js Microservices Architecture & gRPC', duration: '22 Hours', provider: 'Node.js Foundation', difficulty: 'Advanced', priority: 'High', matchScore: 97 },
        { title: 'Express API Security & OWASP Standards', duration: '14 Hours', provider: 'Secure Code Academy', difficulty: 'Intermediate', priority: 'High', matchScore: 94 },
      ],
      'SQL & Database Optimization': [
        { title: 'MySQL High Availability & Query Tuning', duration: '16 Hours', provider: 'Oracle University', difficulty: 'Intermediate', priority: 'High', matchScore: 95 },
        { title: 'PostgreSQL Indexing & Partitioning Masterclass', duration: '20 Hours', provider: 'DBA Institute', difficulty: 'Advanced', priority: 'High', matchScore: 91 },
      ],
      'Cybersecurity & Risk Audit': [
        { title: 'CompTIA Security+ SY0-701 Prep', duration: '30 Hours', provider: 'Cybrary', difficulty: 'Intermediate', priority: 'High', matchScore: 99 },
        { title: 'SOC 2 Type II Compliance & Threat Modeling', duration: '18 Hours', provider: 'SANS Institute', difficulty: 'Advanced', priority: 'High', matchScore: 94 },
      ],
      'Agile Team Leadership': [
        { title: 'Certified ScrumMaster (CSM) Training', duration: '16 Hours', provider: 'Scrum Alliance', difficulty: 'Beginner', priority: 'Medium', matchScore: 92 },
      ],
    };

    const recommendations = gaps.map((gap) => {
      const emp = db.employees.find((e) => e.id === gap.employee_id);
      const sk = db.skills.find((s) => s.id === gap.skill_id);
      const skillName = sk?.name || 'Technical Skill';
      const defaultCourses = courseMap[skillName] || [
        { title: `${skillName} Professional Upskilling`, duration: '15 Hours', provider: 'OKGIP Learning Hub', difficulty: 'Intermediate', priority: 'High', matchScore: 90 },
        { title: `Advanced ${skillName} Best Practices`, duration: '20 Hours', provider: 'Global Academy', difficulty: 'Advanced', priority: 'Medium', matchScore: 85 },
      ];

      return {
        gapId: gap.id,
        employeeId: gap.employee_id,
        employeeName: emp ? `${emp.first_name} ${emp.last_name}` : 'Employee',
        skillId: gap.skill_id,
        skillName,
        gapScore: gap.gap_score,
        priority: gap.priority,
        recommendedCourses: defaultCourses,
      };
    });

    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 1b. Personalized AI Recommendation for a single employee — this is the
// one that actually calls the Gemini LLM with the employee's real gap
// data (Task 3: "Integrate AI/LLM for Recommendations"), and folds in
// missing skills, priority, role, and current proficiency into the
// prompt and the fallback logic (Task 6: "Implement Recommendation Logic").
export const getPersonalizedRecommendation = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    const emp = db.employees.find(e => e.id === employeeId);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    db.recalculateAllGaps();

    const gaps = db.knowledgeGaps
      .filter(g => g.employee_id === employeeId && g.status !== 'Resolved')
      .sort((a, b) => {
        const weight = { High: 3, Medium: 2, Low: 1 };
        return weight[b.priority] - weight[a.priority] || b.gap_score - a.gap_score;
      })
      .slice(0, 5); // focus on the top 5 most urgent gaps

    const gapContext = await Promise.all(
      gaps.map(async (g) => {
        const skill = db.skills.find(s => s.id === g.skill_id);
        const skillName = skill?.name || 'Unknown Skill';
        const internalProgram = db.trainingPrograms.find(
          tp => tp.target_skill_id === g.skill_id && tp.status === 'Active'
        );
        const externalCourses = await getExternalCourses(skillName);
        return {
          skillName,
          category: skill?.category || 'Technical',
          currentProficiency: g.current_proficiency,
          requiredProficiency: g.required_proficiency,
          gapScore: g.gap_score,
          priority: g.priority,
          internalProgram: internalProgram
            ? { title: internalProgram.title, provider: internalProgram.provider, durationHours: internalProgram.duration_hours }
            : null,
          externalCourses: externalCourses.slice(0, 2), // top 2 options per skill
        };
      })
    );

    // Rule-based fallback: works with zero API key, and is also what we
    // fall back to if the Gemini call fails for any reason.
    const buildFallback = () => ({
      summary: `${emp.first_name} ${emp.last_name} (${emp.designation}) has ${gaps.length} active skill gap${gaps.length === 1 ? '' : 's'}. Recommendations are prioritized by gap severity and role relevance.`,
      recommendations: gapContext.map((g) => {
        const best = g.internalProgram
          ? { title: g.internalProgram.title, provider: g.internalProgram.provider, source: 'Internal' as const }
          : g.externalCourses[0]
            ? { title: g.externalCourses[0].title, provider: g.externalCourses[0].provider, source: 'External' as const }
            : { title: `${g.skillName} Upskilling`, provider: 'OKGIP Learning Hub', source: 'Internal' as const };

        return {
          skillName: g.skillName,
          priority: g.priority,
          suggestedCourse: best.title,
          provider: best.provider,
          source: best.source,
          rationale: `${emp.designation} needs ${g.skillName} at proficiency ${g.requiredProficiency}, currently at ${g.currentProficiency} (${g.priority.toLowerCase()} priority gap).`,
        };
      }),
    });

    const ai = getAiClient();
    if (!ai || gapContext.length === 0) {
      return res.json({ success: true, aiGenerated: false, data: buildFallback() });
    }

    try {
      const prompt = `You are an enterprise learning & development advisor for OKGIP.
Employee: ${emp.first_name} ${emp.last_name}, role: ${emp.designation}.
Their skill gaps (most urgent first), with available internal training and external course options for each:
${JSON.stringify(gapContext, null, 2)}

Based on the employee's role, current proficiency, required proficiency, and gap priority, write personalized training recommendations.
Respond with ONLY valid JSON (no markdown fences, no commentary) in exactly this shape:
{
  "summary": "1-2 sentence overview of this employee's development priorities",
  "recommendations": [
    { "skillName": string, "priority": "High"|"Medium"|"Low", "suggestedCourse": string, "provider": string, "source": "Internal"|"External", "rationale": "1 sentence, specific to this employee's role and gap" }
  ]
}
Pick the single best course per skill from the options given (prefer Internal when it exists and its level fits, otherwise pick the best-fitting External course). Do not invent courses that aren't in the data above.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      const raw = (response.text || '').trim().replace(/^```json\s*|\s*```$/g, '');
      const parsed = JSON.parse(raw);

      return res.json({ success: true, aiGenerated: true, data: parsed });
    } catch (err) {
      console.error('Gemini personalized recommendation failed, using rule-based fallback:', err);
      return res.json({ success: true, aiGenerated: false, data: buildFallback() });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Predictive Skill Gap Analysis
export const getPredictiveAnalysis = async (req: Request, res: Response) => {
  try {
    const departments = db.departments;
    const gaps = db.knowledgeGaps;
    const employees = db.employees;

    // Predictions logic
    const futureShortages = [
      { skill: 'Cloud Infrastructure (AWS/GCP)', projectedDeficit: 45, timeline: 'Q3 2026', riskLevel: 'Critical' },
      { skill: 'Cybersecurity & Risk Audit', projectedDeficit: 38, timeline: 'Q4 2026', riskLevel: 'High' },
      { skill: 'SQL & Database Optimization', projectedDeficit: 25, timeline: 'Q1 2027', riskLevel: 'Medium' },
    ];

    const departmentsAtRisk = departments.map((dept) => {
      const deptGaps = gaps.filter((g) => {
        const emp = employees.find((e) => e.id === g.employee_id);
        return emp?.department_id === dept.id;
      });
      const highRiskGaps = deptGaps.filter((g) => g.priority === 'High').length;
      const riskScore = highRiskGaps * 25 + deptGaps.length * 10;
      return {
        departmentId: dept.id,
        departmentName: dept.name,
        totalGaps: deptGaps.length,
        highPriorityGaps: highRiskGaps,
        riskScore: Math.min(100, riskScore || 15),
        riskLevel: riskScore > 50 ? 'High Risk' : riskScore > 20 ? 'Moderate Risk' : 'Low Risk',
      };
    });

    const employeesAtRisk = employees.slice(0, 5).map((emp) => {
      const empGaps = gaps.filter((g) => g.employee_id === emp.id);
      return {
        employeeId: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        department: departments.find((d) => d.id === emp.department_id)?.name || 'General',
        gapsCount: empGaps.length,
        maxDeficit: Math.max(...empGaps.map((g) => g.gap_score), 0),
        status: empGaps.length > 2 ? 'At Risk of Falling Behind' : 'On Track',
      };
    });

    const trendingSkills = [
      { name: 'Generative AI & LLM Engineering', growthRate: '+142%', demand: 'High' },
      { name: 'Kubernetes Cloud Native Security', growthRate: '+98%', demand: 'High' },
      { name: 'SOC2 Type II Automated Auditing', growthRate: '+76%', demand: 'Medium' },
      { name: 'Micro-Frontend React 19', growthRate: '+65%', demand: 'Medium' },
    ];

    res.json({
      success: true,
      data: {
        futureShortages,
        departmentsAtRisk,
        employeesAtRisk,
        trendingSkills,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Persists each chat exchange to MySQL's audit_logs table (fire-and-forget,
// same pattern as the gap snapshot persistence — never blocks the reply,
// never throws if MySQL is unreachable).
const persistChatLog = (req: AuthRequest, message: string, reply: string) => {
  queryAsync(
    `INSERT INTO audit_logs (user_email, action, resource, details, ip_address, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      req.user?.email || 'unknown',
      'AI_CHAT',
      'ai_chat',
      JSON.stringify({ question: message, reply }),
      req.ip || null,
      new Date().toISOString(),
    ]
  ).catch(() => {});
};

// 3. AI Chat Assistant
export const handleAiChat = async (req: AuthRequest, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const ai = getAiClient();

    if (ai) {
      try {
        const systemPrompt = `You are OKGIP AI Assistant, an expert enterprise advisor for the Organizational Knowledge Gap Intelligence Platform.
Context:
- Platform monitors Employee Skills, Knowledge Gaps, Departments, Training Programs, Leave Management, Tasks, and Audit Logs.
- Keep responses clear, professional, well-formatted with bullet points if helpful.
- Answer user queries regarding skills, trainings, knowledge gaps, leaves, tasks, and system policies.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `${systemPrompt}\n\nUser Question: ${message}`,
        });

        if (response.text) {
          persistChatLog(req, message, response.text);
          return res.json({ success: true, reply: response.text });
        }
      } catch (err) {
        console.error('Gemini API call error, falling back to smart rules:', err);
      }
    }

    // Smart Fallback Assistant Logic
    const msg = message.toLowerCase();
    let reply = 'I am the OKGIP AI Assistant. I can help you analyze knowledge gaps, suggest training courses, check leave policies, track task progress, or review department competencies.';

    if (msg.includes('skill') || msg.includes('gap')) {
      const highGaps = db.knowledgeGaps.filter((g) => g.priority === 'High').length;
      reply = `🔍 **Knowledge Gap Summary**: Currently, there are **${db.knowledgeGaps.length} total knowledge gaps** identified across departments, with **${highGaps} critical high-priority gaps** (deficit ≥ 2 proficiency levels). The top deficient skill is **Cloud Infrastructure (AWS/GCP)**.`;
    } else if (msg.includes('training') || msg.includes('course') || msg.includes('recommend')) {
      reply = `🎓 **AI Training Recommendation**: Based on active skill deficits, we strongly recommend:
1. **Enterprise Cloud & Docker Mastery** (Target: Cloud Infrastructure)
2. **Advanced Database Query Tuning** (Target: SQL Optimization)
3. **Zero Trust Security Operations** (Target: Cybersecurity & Audit)
Employees can enroll directly from the **Training** page!`;
    } else if (msg.includes('leave') || msg.includes('vacation') || msg.includes('sick')) {
      reply = `📅 **Leave Policy & Status**: Employees can apply for Annual, Sick, Casual, Study, or Maternity/Paternity leave in the **Leave Management** tab. Managers review and approve requests instantly.`;
    } else if (msg.includes('task') || msg.includes('assignment')) {
      reply = `📋 **Task Management**: Managers can assign tasks with priorities (High, Medium, Low) and due dates. Employees can update progress percentages and mark tasks as Completed.`;
    } else if (msg.includes('report') || msg.includes('export') || msg.includes('pdf')) {
      reply = `📊 **Reports & Exporting**: You can generate comprehensive PDF, Excel, or CSV reports filtered by Department, Date, Role, or Employee directly from the **Reports & Analytics** module.`;
    }

    persistChatLog(req, message, reply);
    res.json({ success: true, reply });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
