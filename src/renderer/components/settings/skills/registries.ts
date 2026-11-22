export interface SkillRegistryEntry {
  id: string
  title: string
  description: string
  source: string
  installs?: number
  icon?: string
  homepage?: string
}

export const SKILLS_POPULAR: SkillRegistryEntry[] = [
  {
    id: 'find-skills',
    title: 'Find Skills',
    description: 'Discover and search for available agent skills from the ecosystem.',
    source: 'vercel-labs/skills',
    installs: 223200,
    homepage: 'https://skills.sh/vercel-labs/skills/find-skills',
  },
  {
    id: 'vercel-react-best-practices',
    title: 'Vercel React Best Practices',
    description:
      'React and Next.js performance optimization guidelines from Vercel Engineering. Contains 40+ rules for ' +
      'eliminating waterfalls, reducing bundle size, and optimizing rendering.',
    source: 'vercel-labs/agent-skills',
    installs: 130500,
    homepage: 'https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices',
  },
  {
    id: 'remotion-best-practices',
    title: 'Remotion Best Practices',
    description: 'Guidelines for creating high-quality video animations and motion graphics using Remotion framework.',
    source: 'remotion-dev/skills',
    installs: 89400,
    homepage: 'https://skills.sh/remotion-dev/skills/remotion-best-practices',
  },
  {
    id: 'frontend-design',
    title: 'Frontend Design',
    description:
      'Create distinctive, production-grade frontend interfaces with high design quality. Avoid generic AI ' +
      'aesthetics and implement bold, memorable designs.',
    source: 'anthropics/skills',
    installs: 67400,
    homepage: 'https://skills.sh/anthropics/skills/frontend-design',
  },
  {
    id: 'agent-browser',
    title: 'Agent Browser',
    description:
      'Fast Rust-based headless browser automation CLI with Node.js fallback for navigating, clicking, typing, ' +
      'and capturing web pages.',
    source: 'vercel-labs/agent-browser',
    installs: 34900,
    homepage: 'https://skills.sh/vercel-labs/agent-browser/agent-browser',
  },
  {
    id: 'browser-use',
    title: 'Browser Use',
    description:
      'Comprehensive browser automation framework for web testing, form filling, data extraction, and web ' +
      'application interaction.',
    source: 'browser-use/browser-use',
    installs: 28800,
    homepage: 'https://skills.sh/browser-use/browser-use/browser-use',
  },
  {
    id: 'brainstorming',
    title: 'Brainstorming',
    description:
      'Structured brainstorming techniques and frameworks for generating creative ideas and exploring solution ' +
      'spaces.',
    source: 'obra/superpowers',
    installs: 19000,
    homepage: 'https://skills.sh/obra/superpowers/brainstorming',
  },
  {
    id: 'supabase-postgres-best-practices',
    title: 'Supabase PostgreSQL Best Practices',
    description: 'Database design, optimization, and best practices for PostgreSQL and Supabase applications.',
    source: 'supabase/agent-skills',
    installs: 17200,
    homepage: 'https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices',
  },
  {
    id: 'pdf',
    title: 'PDF Processing',
    description: 'Tools and techniques for reading, analyzing, and manipulating PDF documents programmatically.',
    source: 'anthropics/skills',
    installs: 14300,
    homepage: 'https://skills.sh/anthropics/skills/pdf',
  },
  {
    id: 'systematic-debugging',
    title: 'Systematic Debugging',
    description: 'Methodical approaches to identifying, isolating, and resolving bugs in complex systems.',
    source: 'obra/superpowers',
    installs: 10400,
    homepage: 'https://skills.sh/obra/superpowers/systematic-debugging',
  },
  {
    id: 'test-driven-development',
    title: 'Test-Driven Development',
    description: 'TDD methodology and patterns for writing tests first to drive software design and implementation.',
    source: 'obra/superpowers',
    installs: 8700,
    homepage: 'https://skills.sh/obra/superpowers/test-driven-development',
  },
  {
    id: 'writing-plans',
    title: 'Writing Plans',
    description: 'Structured planning and outlining techniques for creating clear, organized written content.',
    source: 'obra/superpowers',
    installs: 9000,
    homepage: 'https://skills.sh/obra/superpowers/writing-plans',
  },
  {
    id: 'code-review',
    title: 'Code Review',
    description:
      'Best practices for conducting thorough code reviews, identifying issues, and providing constructive feedback.',
    source: 'anthropics/skills',
    installs: 12000,
    homepage: 'https://skills.sh/anthropics/skills/code-review',
  },
  {
    id: 'api-design',
    title: 'API Design',
    description: 'Principles and patterns for designing clean, intuitive, and maintainable APIs.',
    source: 'wshobson/agents',
    installs: 4500,
    homepage: 'https://skills.sh/wshobson/agents/api-design-principles',
  },
  {
    id: 'database-optimization',
    title: 'Database Optimization',
    description: 'Techniques for optimizing database queries, indexing strategies, and performance tuning.',
    source: 'wshobson/agents',
    installs: 3300,
    homepage: 'https://skills.sh/wshobson/agents/sql-optimization-patterns',
  },
  {
    id: 'technical-writing',
    title: 'Technical Writing',
    description: 'Guidelines for writing clear, accurate, and user-friendly technical documentation.',
    source: 'obra/superpowers',
    installs: 6200,
    homepage: 'https://skills.sh/obra/superpowers/writing-skills',
  },
  {
    id: 'architecture-patterns',
    title: 'Architecture Patterns',
    description: 'Common architectural patterns and design principles for building scalable, maintainable systems.',
    source: 'wshobson/agents',
    installs: 3600,
    homepage: 'https://skills.sh/wshobson/agents/architecture-patterns',
  },
  {
    id: 'error-handling',
    title: 'Error Handling Patterns',
    description: 'Best practices for implementing robust error handling, recovery, and user feedback mechanisms.',
    source: 'wshobson/agents',
    installs: 2800,
    homepage: 'https://skills.sh/wshobson/agents/error-handling-patterns',
  },
  {
    id: 'responsive-design',
    title: 'Responsive Design',
    description: 'Techniques for creating mobile-first, responsive web interfaces that work across all device sizes.',
    source: 'wshobson/agents',
    installs: 3000,
    homepage: 'https://skills.sh/wshobson/agents/responsive-design',
  },
]
