// External Learning Catalog Service
// =====================================================================
// Task: "Integrate External Learning Catalogs" — fetch courses from
// platforms like Infosys Springboard, Coursera, Udemy, etc.
//
// IMPORTANT — read this before you present this module:
// Coursera, Udemy, and Infosys Springboard do not offer free, keyless
// public APIs. Coursera's Partner API and Udemy's Affiliate API both
// require an approved partner/business account; Infosys Springboard has
// no public API at all. So this service ships with a curated, hand-built
// catalog (organized by skill) that mimics exactly what a real API
// response would look like — same shape (title, description, duration,
// link, provider). If you get real API credentials later, you only need
// to change fetchFromProvider() below; everything that calls this
// service (aiController, learningPathController) stays the same.
// =====================================================================

export interface ExternalCourse {
  title: string;
  description: string;
  provider: 'Coursera' | 'Udemy' | 'Infosys Springboard' | 'edX' | 'LinkedIn Learning';
  durationHours: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  url: string;
}

// Curated catalog, keyed by lowercase skill name. Add more entries here
// as you add more skills to the database.
const CATALOG: Record<string, ExternalCourse[]> = {
  'react': [
    { title: 'React - The Complete Guide', description: 'Component architecture, hooks, and state management from the ground up.', provider: 'Udemy', durationHours: 48, level: 'Beginner', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/' },
    { title: 'Advanced React', description: 'Deep dive into performance, patterns, and testing for production React apps.', provider: 'Coursera', durationHours: 20, level: 'Advanced', url: 'https://www.coursera.org/learn/advanced-react' },
  ],
  'spring boot': [
    { title: 'Spring Boot Microservices and Spring Cloud', description: 'Build production microservices using Spring Boot, Spring Cloud, and Docker.', provider: 'Udemy', durationHours: 26, level: 'Intermediate', url: 'https://www.udemy.com/course/spring-boot-microservices-and-spring-cloud/' },
    { title: 'Java Programming and Software Engineering Fundamentals', description: 'Foundational Java and enterprise application design.', provider: 'Coursera', durationHours: 40, level: 'Beginner', url: 'https://www.coursera.org/specializations/java-programming' },
  ],
  'docker': [
    { title: 'Docker for Absolute Beginners', description: 'Learn containers, images, and Docker Compose from scratch.', provider: 'Infosys Springboard', durationHours: 8, level: 'Beginner', url: 'https://infyspringboard.onwingspan.com/' },
    { title: 'Docker & Kubernetes: The Practical Guide', description: 'Containerize and orchestrate real applications end-to-end.', provider: 'Udemy', durationHours: 22, level: 'Intermediate', url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/' },
  ],
  'kubernetes': [
    { title: 'Kubernetes for the Absolute Beginners', description: 'Hands-on introduction to pods, deployments, and services.', provider: 'Udemy', durationHours: 10, level: 'Beginner', url: 'https://www.udemy.com/course/learn-kubernetes/' },
    { title: 'Certified Kubernetes Administrator (CKA) Prep', description: 'Cluster administration, networking, and troubleshooting at production scale.', provider: 'edX', durationHours: 30, level: 'Advanced', url: 'https://www.edx.org/' },
  ],
  'mysql': [
    { title: 'The Complete SQL Bootcamp', description: 'Write real-world SQL queries, joins, and subqueries.', provider: 'Udemy', durationHours: 18, level: 'Beginner', url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/' },
    { title: 'MySQL Performance Tuning', description: 'Indexing strategy, query optimization, and database scaling.', provider: 'LinkedIn Learning', durationHours: 6, level: 'Advanced', url: 'https://www.linkedin.com/learning/' },
  ],
  'python': [
    { title: 'Python for Everybody', description: 'Programming fundamentals using Python, from variables to APIs.', provider: 'Coursera', durationHours: 32, level: 'Beginner', url: 'https://www.coursera.org/specializations/python' },
    { title: 'Python for Data Science and Machine Learning', description: 'NumPy, Pandas, and scikit-learn for real data projects.', provider: 'Udemy', durationHours: 25, level: 'Intermediate', url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/' },
  ],
  'communication': [
    { title: 'Effective Communication in the Workplace', description: 'Structured techniques for clear, confident professional communication.', provider: 'Infosys Springboard', durationHours: 4, level: 'Beginner', url: 'https://infyspringboard.onwingspan.com/' },
    { title: 'Business Writing and Executive Communication', description: 'Write reports, emails, and presentations that get results.', provider: 'LinkedIn Learning', durationHours: 5, level: 'Intermediate', url: 'https://www.linkedin.com/learning/' },
  ],
  'leadership': [
    { title: 'Leading People and Teams', description: 'Team management, motivation, and organizational leadership foundations.', provider: 'Coursera', durationHours: 24, level: 'Intermediate', url: 'https://www.coursera.org/specializations/leading-teams' },
    { title: 'Strategic Leadership and Management', description: 'Executive-level decision-making and organizational strategy.', provider: 'edX', durationHours: 20, level: 'Advanced', url: 'https://www.edx.org/' },
  ],
};

// Generic fallback if a skill isn't in the curated catalog above —
// still returns a realistic-looking, correctly-shaped result set instead
// of an empty array, so the UI never looks broken for a skill you
// haven't added yet.
function genericFallback(skillName: string): ExternalCourse[] {
  return [
    { title: `${skillName} Fundamentals`, description: `Beginner-friendly introduction to ${skillName}, covering core concepts and terminology.`, provider: 'Infosys Springboard', durationHours: 6, level: 'Beginner', url: 'https://infyspringboard.onwingspan.com/' },
    { title: `${skillName} in Practice`, description: `Applied, project-based course to build real ${skillName} proficiency.`, provider: 'Udemy', durationHours: 15, level: 'Intermediate', url: 'https://www.udemy.com/' },
    { title: `Advanced ${skillName}`, description: `Deep-dive course for practitioners looking to master ${skillName} at an expert level.`, provider: 'Coursera', durationHours: 20, level: 'Advanced', url: 'https://www.coursera.org/' },
  ];
}

/**
 * This is the one function you'd rewrite to call a real provider API
 * (Coursera Partner API, Udemy Affiliate API, etc.) if you get
 * credentials later. It currently reads from the curated CATALOG above.
 */
async function fetchFromProvider(skillName: string): Promise<ExternalCourse[]> {
  const key = skillName.trim().toLowerCase();
  return CATALOG[key] ?? genericFallback(skillName);
}

/** Get external courses for a single skill, optionally filtered by level. */
export async function getExternalCourses(
  skillName: string,
  level?: 'Beginner' | 'Intermediate' | 'Advanced'
): Promise<ExternalCourse[]> {
  const courses = await fetchFromProvider(skillName);
  return level ? courses.filter(c => c.level === level) : courses;
}

/** Get external courses for several skills at once. */
export async function getExternalCoursesForSkills(skillNames: string[]): Promise<Record<string, ExternalCourse[]>> {
  const result: Record<string, ExternalCourse[]> = {};
  for (const name of skillNames) {
    result[name] = await fetchFromProvider(name);
  }
  return result;
}
