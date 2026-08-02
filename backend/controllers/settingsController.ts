import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

let systemSettings = {
  platformName: 'Organizational Knowledge Gap Intelligence Platform (OKGIP)',
  jwtExpiration: '24h',
  defaultRole: 'Employee',
  gapAlertThreshold: 2,
  autoTrainingReminder: true,
  mysqlSyncStatus: 'Connected & Healthy',
  strictRbacMode: true,
  lastUpdated: new Date().toISOString(),
};

export const getSettings = (req: AuthRequest, res: Response) => {
  return res.json({ success: true, data: systemSettings });
};

export const updateSettings = (req: AuthRequest, res: Response) => {
  const { platformName, jwtExpiration, defaultRole, gapAlertThreshold, autoTrainingReminder, strictRbacMode } = req.body;

  if (platformName) systemSettings.platformName = platformName;
  if (jwtExpiration) systemSettings.jwtExpiration = jwtExpiration;
  if (defaultRole) systemSettings.defaultRole = defaultRole;
  if (gapAlertThreshold !== undefined) systemSettings.gapAlertThreshold = Number(gapAlertThreshold);
  if (autoTrainingReminder !== undefined) systemSettings.autoTrainingReminder = Boolean(autoTrainingReminder);
  if (strictRbacMode !== undefined) systemSettings.strictRbacMode = Boolean(strictRbacMode);
  systemSettings.lastUpdated = new Date().toISOString();

  return res.json({ success: true, message: 'System settings saved successfully', data: systemSettings });
};
