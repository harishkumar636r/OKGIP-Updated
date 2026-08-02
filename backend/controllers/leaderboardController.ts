import { Request, Response } from 'express';
import { db } from '../config/db';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const employees = db.employees;
    const departments = db.departments;
    const trainingAssignments = db.trainingAssignments;
    const employeeSkills = db.employeeSkills;
    const badges = db.badges;
    const certificates = db.certificates;

    const leaderboard = employees.map((emp) => {
      const dept = departments.find((d) => d.id === emp.department_id);

      // Completed trainings
      const empAssignments = trainingAssignments.filter((ta) => ta.employee_id === emp.id);
      const completedTrainings = empAssignments.filter((ta) => ta.status === 'Completed').length;

      // Avg skill score
      const empSkills = employeeSkills.filter((es) => es.employee_id === emp.id);
      const avgSkillScore = empSkills.length > 0
        ? Number((empSkills.reduce((acc, curr) => acc + curr.current_proficiency, 0) / empSkills.length).toFixed(1))
        : 3.0;

      // Badges
      const empBadges = badges.filter((b) => b.employee_id === emp.id);

      // Certs
      const empCerts = certificates.filter((c) => c.employee_id === emp.id).length;

      // Overall Score calculation formula
      const score = Math.round(
        completedTrainings * 250 +
        avgSkillScore * 100 +
        empBadges.length * 150 +
        empCerts * 200 +
        (emp.status === 'Active' ? 50 : 0)
      );

      return {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        photoUrl: emp.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        designation: emp.designation,
        department: dept?.name || 'General',
        completedTrainings,
        avgSkillScore,
        certificationsCount: empCerts,
        score,
        badges: empBadges.map((b) => ({ type: b.badge_type, name: b.badge_type, icon: b.icon })),
      };
    });

    // Sort descending by score
    leaderboard.sort((a, b) => b.score - a.score);

    // Assign rank
    const rankedLeaderboard = leaderboard.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      topBadge: idx === 0 ? '👑 Rank #1 Gold Champion' : idx === 1 ? '🥈 Rank #2 Silver Leader' : idx === 2 ? '🥉 Rank #3 Bronze Specialist' : null,
    }));

    res.json({ success: true, data: rankedLeaderboard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
