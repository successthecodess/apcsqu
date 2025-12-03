import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * Helper function to get all settings as an object
 */
async function getAllSettingsAsObject() {
  const settings = await prisma.platformSettings.findMany();
  
  const settingsObj: Record<string, any> = {};
  settings.forEach((setting) => {
    try {
      settingsObj[setting.key] = JSON.parse(setting.value);
    } catch (error) {
      // If parsing fails, use the raw value
      settingsObj[setting.key] = setting.value;
    }
  });

  return settingsObj;
}

/**
 * Helper function to get a single setting
 */
async function getSetting(key: string, defaultValue?: any) {
  const setting = await prisma.platformSettings.findUnique({
    where: { key },
  });

  if (!setting) {
    return defaultValue;
  }

  try {
    return JSON.parse(setting.value);
  } catch (error) {
    return setting.value;
  }
}

/**
 * Helper function to set a single setting
 */
async function setSetting(key: string, value: any, category: string = 'general') {
  return await prisma.platformSettings.upsert({
    where: { key },
    update: {
      value: JSON.stringify(value),
      category,
    },
    create: {
      key,
      value: JSON.stringify(value),
      category,
    },
  });
}

/**
 * Get all platform settings
 */
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await getAllSettingsAsObject();

  // Don't send API keys to frontend (mask them)
  if (settings.openaiApiKey) {
    settings.openaiApiKey = '**********************';
  }
  if (settings.clerkApiKey) {
    settings.clerkApiKey = '**********************';
  }

  res.status(200).json({
    status: 'success',
    data: settings,
  });
});

/**
 * Update platform settings
 */
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body;

  // Validation
  if (updates.questionsPerSession && (updates.questionsPerSession < 5 || updates.questionsPerSession > 100)) {
    throw new AppError('Questions per session must be between 5 and 100', 400);
  }

  if (updates.correctStreakToAdvance && updates.correctStreakToAdvance < 1) {
    throw new AppError('Correct streak to advance must be at least 1', 400);
  }

  if (updates.wrongStreakToDecrease && updates.wrongStreakToDecrease < 1) {
    throw new AppError('Wrong streak to decrease must be at least 1', 400);
  }

  if (updates.masteryThreshold && (updates.masteryThreshold < 0 || updates.masteryThreshold > 100)) {
    throw new AppError('Mastery threshold must be between 0 and 100', 400);
  }

  if (updates.timePerQuestion && updates.timePerQuestion < 10) {
    throw new AppError('Time per question must be at least 10 seconds', 400);
  }

  if (updates.sessionTimeout && updates.sessionTimeout < 5) {
    throw new AppError('Session timeout must be at least 5 minutes', 400);
  }

  if (updates.maxLoginAttempts && updates.maxLoginAttempts < 1) {
    throw new AppError('Max login attempts must be at least 1', 400);
  }

  // Determine category for each setting
  const categoryMap: Record<string, string> = {
    siteName: 'general',
    siteDescription: 'general',
    supportEmail: 'general',
    defaultDifficulty: 'questions',
    questionsPerSession: 'questions',
    timePerQuestion: 'questions',
    enableHints: 'questions',
    enableExplanations: 'questions',
    correctStreakToAdvance: 'adaptive',
    wrongStreakToDecrease: 'adaptive',
    masteryThreshold: 'adaptive',
    enableEmailNotifications: 'notifications',
    notifyOnNewQuestions: 'notifications',
    notifyOnLowPerformance: 'notifications',
    requireEmailVerification: 'security',
    sessionTimeout: 'security',
    maxLoginAttempts: 'security',
    openaiApiKey: 'api',
    clerkApiKey: 'api',
  };

  // Update each setting
  const updatePromises = Object.entries(updates).map(([key, value]) => {
    // Skip masked API keys
    if ((key === 'openaiApiKey' || key === 'clerkApiKey') && value === '**********************') {
      return Promise.resolve();
    }

    const category = categoryMap[key] || 'general';
    return setSetting(key, value, category);
  });

  await Promise.all(updatePromises);

  // Get updated settings
  const updatedSettings = await getAllSettingsAsObject();

  // Mask API keys
  if (updatedSettings.openaiApiKey) {
    updatedSettings.openaiApiKey = '**********************';
  }
  if (updatedSettings.clerkApiKey) {
    updatedSettings.clerkApiKey = '**********************';
  }

  res.status(200).json({
    status: 'success',
    data: updatedSettings,
    message: 'Settings updated successfully',
  });
});

/**
 * Reset settings to defaults
 */
export const resetSettings = asyncHandler(async (req: Request, res: Response) => {
  const defaultSettings = [
    { key: 'siteName', value: 'AP CSA Practice Platform', category: 'general' },
    { key: 'siteDescription', value: 'Master AP Computer Science A with adaptive learning', category: 'general' },
    { key: 'supportEmail', value: 'support@apcsa.com', category: 'general' },
    { key: 'defaultDifficulty', value: 'MEDIUM', category: 'questions' },
    { key: 'questionsPerSession', value: 40, category: 'questions' },
    { key: 'timePerQuestion', value: 120, category: 'questions' },
    { key: 'enableHints', value: true, category: 'questions' },
    { key: 'enableExplanations', value: true, category: 'questions' },
    { key: 'correctStreakToAdvance', value: 3, category: 'adaptive' },
    { key: 'wrongStreakToDecrease', value: 2, category: 'adaptive' },
    { key: 'masteryThreshold', value: 70, category: 'adaptive' },
    { key: 'enableEmailNotifications', value: true, category: 'notifications' },
    { key: 'notifyOnNewQuestions', value: true, category: 'notifications' },
    { key: 'notifyOnLowPerformance', value: true, category: 'notifications' },
    { key: 'requireEmailVerification', value: true, category: 'security' },
    { key: 'sessionTimeout', value: 60, category: 'security' },
    { key: 'maxLoginAttempts', value: 5, category: 'security' },
  ];

  // Reset all settings except API keys
  const resetPromises = defaultSettings.map((setting) =>
    setSetting(setting.key, setting.value, setting.category)
  );

  await Promise.all(resetPromises);

  const settings = await getAllSettingsAsObject();

  // Mask API keys
  if (settings.openaiApiKey) {
    settings.openaiApiKey = '**********************';
  }
  if (settings.clerkApiKey) {
    settings.clerkApiKey = '**********************';
  }

  res.status(200).json({
    status: 'success',
    data: settings,
    message: 'Settings reset to defaults',
  });
});

/**
 * Export settings as JSON
 */
export const exportSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await getAllSettingsAsObject();

  // Remove sensitive data
  delete settings.openaiApiKey;
  delete settings.clerkApiKey;

  const settingsExport = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    settings,
  };

  res.status(200).json({
    status: 'success',
    data: settingsExport,
  });
});

/**
 * Import settings from JSON
 */
export const importSettings = asyncHandler(async (req: Request, res: Response) => {
  const { settings } = req.body;

  if (!settings) {
    throw new AppError('Settings data is required', 400);
  }

  // Validate the settings object
  if (typeof settings !== 'object') {
    throw new AppError('Settings must be an object', 400);
  }

  // Category mapping
  const categoryMap: Record<string, string> = {
    siteName: 'general',
    siteDescription: 'general',
    supportEmail: 'general',
    defaultDifficulty: 'questions',
    questionsPerSession: 'questions',
    timePerQuestion: 'questions',
    enableHints: 'questions',
    enableExplanations: 'questions',
    correctStreakToAdvance: 'adaptive',
    wrongStreakToDecrease: 'adaptive',
    masteryThreshold: 'adaptive',
    enableEmailNotifications: 'notifications',
    notifyOnNewQuestions: 'notifications',
    notifyOnLowPerformance: 'notifications',
    requireEmailVerification: 'security',
    sessionTimeout: 'security',
    maxLoginAttempts: 'security',
  };

  // Import settings (excluding API keys)
  const importPromises = Object.entries(settings)
    .filter(([key]) => key !== 'openaiApiKey' && key !== 'clerkApiKey')
    .map(([key, value]) => {
      const category = categoryMap[key] || 'general';
      return setSetting(key, value, category);
    });

  await Promise.all(importPromises);

  const updatedSettings = await getAllSettingsAsObject();

  // Mask API keys
  if (updatedSettings.openaiApiKey) {
    updatedSettings.openaiApiKey = '**********************';
  }
  if (updatedSettings.clerkApiKey) {
    updatedSettings.clerkApiKey = '**********************';
  }

  res.status(200).json({
    status: 'success',
    data: updatedSettings,
    message: 'Settings imported successfully',
  });
});

/**
 * Get a specific setting by key
 */
export const getSettingByKey = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;

  const value = await getSetting(key);

  if (value === undefined) {
    throw new AppError(`Setting '${key}' not found`, 404);
  }

  // Mask API keys
  let maskedValue = value;
  if (key === 'openaiApiKey' || key === 'clerkApiKey') {
    maskedValue = '**********************';
  }

  res.status(200).json({
    status: 'success',
    data: {
      key,
      value: maskedValue,
    },
  });
});

/**
 * Update a specific setting by key
 */
export const updateSettingByKey = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined) {
    throw new AppError('Value is required', 400);
  }

  const categoryMap: Record<string, string> = {
    siteName: 'general',
    siteDescription: 'general',
    supportEmail: 'general',
    defaultDifficulty: 'questions',
    questionsPerSession: 'questions',
    timePerQuestion: 'questions',
    enableHints: 'questions',
    enableExplanations: 'questions',
    correctStreakToAdvance: 'adaptive',
    wrongStreakToDecrease: 'adaptive',
    masteryThreshold: 'adaptive',
    enableEmailNotifications: 'notifications',
    notifyOnNewQuestions: 'notifications',
    notifyOnLowPerformance: 'notifications',
    requireEmailVerification: 'security',
    sessionTimeout: 'security',
    maxLoginAttempts: 'security',
    openaiApiKey: 'api',
    clerkApiKey: 'api',
  };

  const category = categoryMap[key] || 'general';
  await setSetting(key, value, category);

  res.status(200).json({
    status: 'success',
    message: `Setting '${key}' updated successfully`,
  });
});

// Export helper functions for use in other controllers
export { getSetting, setSetting, getAllSettingsAsObject };