import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta' | 'hi' | 'es' | 'fr' | 'de' | 'zh';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    users: 'User Management',
    employees: 'Employee Directory',
    departments: 'Departments',
    skills: 'Skills Matrix',
    gaps: 'Gap Intelligence',
    ai_insights: 'AI Training Insights',
    training: 'Training & Development',
    assessments: 'Skill Assessments',
    leaderboard: 'Leaderboard & Badges',
    certificates: 'Certificates',
    tasks: 'Task Assignment',
    leave: 'Leave Management',
    messages: 'In-App Messaging',
    reports: 'Reports & Analytics',
    notifications: 'Notifications',
    audit_logs: 'Audit Logs',
    settings: 'System Settings',
    profile: 'My Profile',
    welcome: 'Welcome back',
    logout: 'Logout',
    search_placeholder: 'Search skills, employees, gaps...',
    live_intel: 'Live Intel Sync',
  },
  ta: {
    dashboard: 'டாஷ்போர்டு',
    users: 'பயனாளர்கள் மேலாண்மை',
    employees: 'பணியாளர்கள் விவரம்',
    departments: 'துறைகள்',
    skills: 'திறன்கள் மேலாண்மை',
    gaps: 'அறிவு இடைவெளி',
    ai_insights: 'AI பயிற்சி ஆலோசனைகள்',
    training: 'பயிற்சி மற்றும் வளர்ச்சி',
    assessments: 'திறன் தேர்வுகள்',
    leaderboard: 'தரவரிசை & பேட்ஜ்கள்',
    certificates: 'சான்றிதழ்கள்',
    tasks: 'பணி ஒதுக்கீடு',
    leave: 'விடுப்பு மேலாண்மை',
    messages: 'செய்திகள்',
    reports: 'அறிக்கைகள் & பகுப்பாய்வு',
    notifications: 'அறிவிப்புகள்',
    audit_logs: 'பாதுகாப்பு பதிவுகள்',
    settings: 'அமைப்புகள்',
    profile: 'எனது சுயவிவரம்',
    welcome: 'நல்வரவு',
    logout: 'வெளியேறு',
    search_placeholder: 'தேடுங்கள்...',
    live_intel: 'நேரலை மேலாண்மை',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    users: 'उपयोगकर्ता प्रबंधन',
    employees: 'कर्मचारी निर्देशिका',
    departments: 'विभाग',
    skills: 'कौशल मैट्रिक्स',
    gaps: 'ज्ञान अंतराल बुद्धिमत्ता',
    ai_insights: 'एआई प्रशिक्षण अंतर्दृष्टि',
    training: 'प्रशिक्षण एवं विकास',
    assessments: 'कौशल मूल्यांकन',
    leaderboard: 'लीडरबोर्ड और बैज',
    certificates: 'प्रमाणपत्र',
    tasks: 'कार्य आवंटन',
    leave: 'अवकाश प्रबंधन',
    messages: 'इन-ऐप संदेश',
    reports: 'रिपोर्ट और विश्लेषण',
    notifications: 'सूचनाएं',
    audit_logs: 'ऑडिट लॉग',
    settings: 'सिस्टम सेटिंग्स',
    profile: 'मेरी प्रोफ़ाइल',
    welcome: 'वापसी पर स्वागत है',
    logout: 'लॉग आउट',
    search_placeholder: 'कौशल, कर्मचारी खोजें...',
    live_intel: 'लाइव सिंक',
  },
  es: {
    dashboard: 'Panel de Control',
    users: 'Gestión de Usuarios',
    employees: 'Directorio de Empleados',
    departments: 'Departamentos',
    skills: 'Matriz de Habilidades',
    gaps: 'Inteligencia de Brechas',
    ai_insights: 'Insights de IA',
    training: 'Capacitación y Desarrollo',
    assessments: 'Evaluaciones de Habilidades',
    leaderboard: 'Tabla de Clasificación y Insignias',
    certificates: 'Certificados',
    tasks: 'Asignación de Tareas',
    leave: 'Gestión de Licencias',
    messages: 'Mensajería Interna',
    reports: 'Informes y Analítica',
    notifications: 'Notificaciones',
    audit_logs: 'Registros de Auditoría',
    settings: 'Configuración del Sistema',
    profile: 'Mi Perfil',
    welcome: 'Bienvenido de nuevo',
    logout: 'Cerrar Sesión',
    search_placeholder: 'Buscar habilidades, empleados...',
    live_intel: 'Sincronización en Vivo',
  },
  fr: {
    dashboard: 'Tableau de Bord',
    users: 'Gestion des Utilisateurs',
    employees: 'Annuaire des Employés',
    departments: 'Départements',
    skills: 'Matrice des Compétences',
    gaps: 'Analyse des Écarts',
    ai_insights: 'Aperçus IA',
    training: 'Formation & Développement',
    assessments: 'Évaluations des Compétences',
    leaderboard: 'Classement & Badges',
    certificates: 'Certificats',
    tasks: 'Assignation des Tâches',
    leave: 'Gestion des Congés',
    messages: 'Messagerie',
    reports: 'Rapports & Analyses',
    notifications: 'Notifications',
    audit_logs: 'Journaux d’Audits',
    settings: 'Paramètres Système',
    profile: 'Mon Profil',
    welcome: 'Bon retour',
    logout: 'Déconnexion',
    search_placeholder: 'Rechercher compétences, employés...',
    live_intel: 'Synchro en Direct',
  },
  de: {
    dashboard: 'Dashboard',
    users: 'Benutzerverwaltung',
    employees: 'Mitarbeiterverzeichnis',
    departments: 'Abteilungen',
    skills: 'Kompetenzmatrix',
    gaps: 'Wissenslücken-Analyse',
    ai_insights: 'KI-Einblicke',
    training: 'Schulung & Entwicklung',
    assessments: 'Kompetenzprüfungen',
    leaderboard: 'Bestenliste & Abzeichen',
    certificates: 'Zertifikate',
    tasks: 'Aufgabenvergabe',
    leave: 'Urlaubsverwaltung',
    messages: 'In-App-Nachrichten',
    reports: 'Berichte & Analysen',
    notifications: 'Benachrichtigungen',
    audit_logs: 'Audit-Protokolle',
    settings: 'Systemeinstellungen',
    profile: 'Mein Profil',
    welcome: 'Willkommen zurück',
    logout: 'Abmelden',
    search_placeholder: 'Fähigkeiten, Mitarbeiter suchen...',
    live_intel: 'Live-Sync',
  },
  zh: {
    dashboard: '仪表板',
    users: '用户管理',
    employees: '员工名录',
    departments: '部门',
    skills: '技能矩阵',
    gaps: '知识差距情报',
    ai_insights: 'AI 培训见解',
    training: '培训与发展',
    assessments: '技能评估',
    leaderboard: '排行榜与徽章',
    certificates: '证书',
    tasks: '任务分配',
    leave: '请假管理',
    messages: '应用内消息',
    reports: '报告与分析',
    notifications: '通知',
    audit_logs: '审计日志',
    settings: '系统设置',
    profile: '个人资料',
    welcome: '欢迎回来',
    logout: '退出登录',
    search_placeholder: '搜索技能、员工...',
    live_intel: '实时同步',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('okgip_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('okgip_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
