import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAssessments = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: db.assessments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssessmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assessment = db.assessments.find((a) => a.id === Number(id));
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    res.json({ success: true, data: assessment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAssessment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { answers } = req.body; // Array of selected option indices

    const assessment = db.assessments.find((a) => a.id === Number(id));
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const emp = db.employees.find((e) => e.user_id === user.id);
    if (!emp) {
      return res.status(400).json({ success: false, message: 'Employee profile required' });
    }

    // Auto-grading
    let correctCount = 0;
    assessment.questions.forEach((q, idx) => {
      if (answers && answers[idx] === q.correct_index) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / assessment.questions.length) * 100);
    const passed = score >= assessment.pass_score;

    // Determine new proficiency level based on score
    let newLevel = 3;
    if (score >= 90) newLevel = 5;
    else if (score >= 75) newLevel = 4;

    if (passed) {
      // Update employee skill score
      let empSkill = db.employeeSkills.find((es) => es.employee_id === emp.id && es.skill_id === assessment.skill_id);
      if (empSkill) {
        empSkill.current_proficiency = Math.max(empSkill.current_proficiency, newLevel);
        empSkill.assessed_date = new Date().toISOString().split('T')[0];
      } else {
        db.employeeSkills.push({
          id: db.employeeSkills.length + 1,
          employee_id: emp.id,
          skill_id: assessment.skill_id,
          current_proficiency: newLevel,
          assessed_date: new Date().toISOString().split('T')[0],
          verified_by: 'Automated Assessment Engine',
          created_at: new Date().toISOString(),
        });
      }

      // Recalculate gaps
      db.recalculateAllGaps();

      // Award Fast Learner badge
      db.badges.push({
        id: db.badges.length + 1,
        employee_id: emp.id,
        badge_type: 'Knowledge Expert',
        description: `Passed '${assessment.title}' with ${score}% score!`,
        icon: 'Award',
        awarded_at: new Date().toISOString().split('T')[0],
      });
    }

    const result = {
      id: db.assessmentResults.length + 1,
      employee_id: emp.id,
      assessment_id: assessment.id,
      skill_id: assessment.skill_id,
      score,
      passed,
      new_proficiency_level: newLevel,
      taken_at: new Date().toISOString(),
    };

    db.assessmentResults.push(result);

    res.json({
      success: true,
      data: result,
      message: passed ? `Congratulations! You passed with ${score}%. Skill proficiency updated to Level ${newLevel}.` : `You scored ${score}%. Minimum passing score is ${assessment.pass_score}%. Please review course materials and try again.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
