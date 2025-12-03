import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultSettings = [
  // General Settings
  {
    key: 'siteName',
    value: JSON.stringify('AP CSA Practice Platform'),
    category: 'general',
  },
  {
    key: 'siteDescription',
    value: JSON.stringify('Master AP Computer Science A with adaptive learning'),
    category: 'general',
  },
  {
    key: 'supportEmail',
    value: JSON.stringify('support@apcsa.com'),
    category: 'general',
  },

  // Question Settings
  {
    key: 'defaultDifficulty',
    value: JSON.stringify('MEDIUM'),
    category: 'questions',
  },
  {
    key: 'questionsPerSession',
    value: JSON.stringify(40),
    category: 'questions',
  },
  {
    key: 'timePerQuestion',
    value: JSON.stringify(120),
    category: 'questions',
  },
  {
    key: 'enableHints',
    value: JSON.stringify(true),
    category: 'questions',
  },
  {
    key: 'enableExplanations',
    value: JSON.stringify(true),
    category: 'questions',
  },

  // Adaptive Learning Settings
  {
    key: 'correctStreakToAdvance',
    value: JSON.stringify(3),
    category: 'adaptive',
  },
  {
    key: 'wrongStreakToDecrease',
    value: JSON.stringify(2),
    category: 'adaptive',
  },
  {
    key: 'masteryThreshold',
    value: JSON.stringify(70),
    category: 'adaptive',
  },

  // Notification Settings
  {
    key: 'enableEmailNotifications',
    value: JSON.stringify(true),
    category: 'notifications',
  },
  {
    key: 'notifyOnNewQuestions',
    value: JSON.stringify(true),
    category: 'notifications',
  },
  {
    key: 'notifyOnLowPerformance',
    value: JSON.stringify(true),
    category: 'notifications',
  },

  // Security Settings
  {
    key: 'requireEmailVerification',
    value: JSON.stringify(true),
    category: 'security',
  },
  {
    key: 'sessionTimeout',
    value: JSON.stringify(60),
    category: 'security',
  },
  {
    key: 'maxLoginAttempts',
    value: JSON.stringify(5),
    category: 'security',
  },

  // API Keys (leave empty for now, set via settings UI)
  {
    key: 'openaiApiKey',
    value: JSON.stringify(''),
    category: 'api',
  },
  {
    key: 'clerkApiKey',
    value: JSON.stringify(''),
    category: 'api',
  },
];

async function seedSettings() {
  console.log('🌱 Seeding platform settings...');

  try {
    for (const setting of defaultSettings) {
      await prisma.platformSettings.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          category: setting.category,
        },
        create: setting,
      });

      console.log(`✅ Seeded setting: ${setting.key}`);
    }

    console.log('✅ Settings seeding complete!');
  } catch (error) {
    console.error('❌ Settings seeding failed:', error);
    throw error;
  }
}

seedSettings()
  .catch((e) => {
    console.error(e);
   // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });