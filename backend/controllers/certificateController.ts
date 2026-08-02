import { Request, Response } from 'express';
import { db } from '../config/db';

export const getCertificates = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let list = db.certificates;

    if (user?.role === 'Employee') {
      const emp = db.employees.find((e) => e.user_id === user.id);
      if (emp) {
        list = list.filter((c) => c.employee_id === emp.id);
      }
    }

    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyCertificate = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const cert = db.certificates.find((c) => c.verification_code === code || c.cert_number === code);

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Invalid or expired certificate code' });
    }

    res.json({
      success: true,
      valid: true,
      data: cert,
      message: 'Certificate is authentic and verified by OKGIP Platform.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateCertificate = async (req: Request, res: Response) => {
  try {
    const { trainingAssignmentId } = req.body;
    const user = (req as any).user;

    const assignment = db.trainingAssignments.find((ta) => ta.id === Number(trainingAssignmentId));
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Training assignment not found' });
    }

    const emp = db.employees.find((e) => e.id === assignment.employee_id);
    const program = db.trainingPrograms.find((tp) => tp.id === assignment.training_program_id);

    if (!emp || !program) {
      return res.status(400).json({ success: false, message: 'Associated employee or training program missing' });
    }

    const certNum = `OKGIP-CERT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const verCode = `VER-${Math.floor(10000 + Math.random() * 90000)}-${program.category.substring(0, 4).toUpperCase()}`;

    const newCert = {
      id: db.certificates.length + 1,
      employee_id: emp.id,
      employee_name: `${emp.first_name} ${emp.last_name}`,
      training_assignment_id: assignment.id,
      program_title: program.title,
      cert_number: certNum,
      issued_date: new Date().toISOString().split('T')[0],
      verification_code: verCode,
    };

    db.certificates.push(newCert);

    // Update assignment status
    assignment.status = 'Completed';
    assignment.progress_percentage = 100;
    assignment.completed_at = new Date().toISOString();
    assignment.certificate_url = `/api/certificates/verify/${verCode}`;

    // Award badge
    db.badges.push({
      id: db.badges.length + 1,
      employee_id: emp.id,
      badge_type: 'Training Master',
      description: `Completed '${program.title}' certified training.`,
      icon: 'Award',
      awarded_at: new Date().toISOString().split('T')[0],
    });

    // Notify user
    db.notifications.push({
      id: db.notifications.length + 1,
      user_id: emp.user_id,
      title: 'Certificate Earned! 🎓',
      message: `Congratulations! Your certificate for '${program.title}' is ready to download.`,
      type: 'Certificate Earned',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    res.json({ success: true, data: newCert, message: 'Certificate generated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
