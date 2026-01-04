/**
 * Project Archetypes
 * Pre-defined patterns for common project types.
 * Used by SmartDefaults to infer reasonable defaults from minimal user input.
 */

/**
 * Archetype identifiers
 */
export const ArchetypeId = {
  WEB_APP: 'web-app',
  CLI_TOOL: 'cli-tool',
  API: 'api',
  MOBILE: 'mobile',
  LIBRARY: 'library',
  DESKTOP: 'desktop',
  UNKNOWN: 'unknown'
};

/**
 * Archetype definitions with keywords and defaults
 */
export const archetypes = {
  [ArchetypeId.WEB_APP]: {
    id: ArchetypeId.WEB_APP,
    name: 'Web Application',
    description: 'Interactive web app with frontend and possibly backend',
    keywords: [
      'web', 'website', 'webapp', 'frontend', 'react', 'vue', 'angular',
      'nextjs', 'next.js', 'remix', 'svelte', 'dashboard', 'portal',
      'saas', 'platform', 'ui', 'interface', 'browser'
    ],
    defaults: {
      hasUI: { value: true, confidence: 0.95, reasoning: 'Web apps have user interfaces' },
      hasBackend: { value: true, confidence: 0.8, reasoning: 'Most web apps need a backend' },
      hasDatabase: { value: true, confidence: 0.75, reasoning: 'Common for web apps' },
      authNeeded: { value: true, confidence: 0.7, reasoning: 'Many web apps require authentication' },
      framework: { value: 'react', confidence: 0.6, reasoning: 'Most popular framework' }
    }
  },

  [ArchetypeId.CLI_TOOL]: {
    id: ArchetypeId.CLI_TOOL,
    name: 'CLI Tool',
    description: 'Command-line application or developer tool',
    keywords: [
      'cli', 'command', 'terminal', 'shell', 'tool', 'script', 'utility',
      'automation', 'devtool', 'npm', 'yarn', 'executable', 'bash'
    ],
    defaults: {
      hasUI: { value: false, confidence: 0.9, reasoning: 'CLI tools use terminal' },
      hasBackend: { value: false, confidence: 0.8, reasoning: 'Usually standalone' },
      hasDatabase: { value: false, confidence: 0.7, reasoning: 'Most CLI tools don\'t need DB' },
      authNeeded: { value: false, confidence: 0.8, reasoning: 'CLI tools rarely need auth' },
      framework: { value: 'commander', confidence: 0.7, reasoning: 'Popular CLI framework' }
    }
  },

  [ArchetypeId.API]: {
    id: ArchetypeId.API,
    name: 'API / Backend Service',
    description: 'REST or GraphQL API service',
    keywords: [
      'api', 'backend', 'rest', 'graphql', 'microservice', 'service',
      'server', 'endpoint', 'express', 'fastify', 'nest', 'koa'
    ],
    defaults: {
      hasUI: { value: false, confidence: 0.85, reasoning: 'APIs don\'t have UI' },
      hasBackend: { value: true, confidence: 0.99, reasoning: 'APIs are backends' },
      hasDatabase: { value: true, confidence: 0.85, reasoning: 'Most APIs use databases' },
      authNeeded: { value: true, confidence: 0.8, reasoning: 'APIs usually need auth' },
      framework: { value: 'express', confidence: 0.6, reasoning: 'Popular API framework' }
    }
  },

  [ArchetypeId.MOBILE]: {
    id: ArchetypeId.MOBILE,
    name: 'Mobile Application',
    description: 'iOS, Android, or cross-platform mobile app',
    keywords: [
      'mobile', 'ios', 'android', 'react native', 'flutter', 'expo',
      'app', 'phone', 'tablet', 'native', 'swift', 'kotlin'
    ],
    defaults: {
      hasUI: { value: true, confidence: 0.99, reasoning: 'Mobile apps have UI' },
      hasBackend: { value: true, confidence: 0.85, reasoning: 'Most mobile apps need backend' },
      hasDatabase: { value: true, confidence: 0.7, reasoning: 'Often for caching' },
      authNeeded: { value: true, confidence: 0.8, reasoning: 'User accounts common' },
      framework: { value: 'react-native', confidence: 0.5, reasoning: 'Popular cross-platform' }
    }
  },

  [ArchetypeId.LIBRARY]: {
    id: ArchetypeId.LIBRARY,
    name: 'Library / Package',
    description: 'Reusable code library or npm package',
    keywords: [
      'library', 'package', 'npm', 'module', 'sdk', 'component',
      'plugin', 'extension', 'helper', 'utility', 'framework'
    ],
    defaults: {
      hasUI: { value: false, confidence: 0.7, reasoning: 'Libraries usually don\'t have UI' },
      hasBackend: { value: false, confidence: 0.8, reasoning: 'Libraries are reusable code' },
      hasDatabase: { value: false, confidence: 0.9, reasoning: 'Libraries don\'t own data' },
      authNeeded: { value: false, confidence: 0.9, reasoning: 'Libraries don\'t auth' },
      framework: { value: null, confidence: 0.8, reasoning: 'Depends on purpose' }
    }
  },

  [ArchetypeId.DESKTOP]: {
    id: ArchetypeId.DESKTOP,
    name: 'Desktop Application',
    description: 'Desktop app using Electron, Tauri, or native',
    keywords: [
      'desktop', 'electron', 'tauri', 'native', 'windows', 'mac', 'linux',
      'gui', 'application', 'program'
    ],
    defaults: {
      hasUI: { value: true, confidence: 0.99, reasoning: 'Desktop apps have GUI' },
      hasBackend: { value: false, confidence: 0.6, reasoning: 'Often self-contained' },
      hasDatabase: { value: true, confidence: 0.6, reasoning: 'Local storage common' },
      authNeeded: { value: false, confidence: 0.6, reasoning: 'Depends on app type' },
      framework: { value: 'electron', confidence: 0.5, reasoning: 'Popular choice' }
    }
  },

  [ArchetypeId.UNKNOWN]: {
    id: ArchetypeId.UNKNOWN,
    name: 'Unknown',
    description: 'Could not determine project type',
    keywords: [],
    defaults: {
      hasUI: { value: null, confidence: 0.3, reasoning: 'Unable to determine' },
      hasBackend: { value: null, confidence: 0.3, reasoning: 'Unable to determine' },
      hasDatabase: { value: null, confidence: 0.3, reasoning: 'Unable to determine' },
      authNeeded: { value: null, confidence: 0.3, reasoning: 'Unable to determine' },
      framework: { value: null, confidence: 0.3, reasoning: 'Unable to determine' }
    }
  }
};

/**
 * Detect archetype from project description
 * @param {string} description - User's project description
 * @returns {Object} { archetype: Object, confidence: number, matchedKeywords: string[] }
 */
export function detectArchetype(description) {
  const lowerDesc = description.toLowerCase();
  const scores = [];

  for (const [id, archetype] of Object.entries(archetypes)) {
    if (id === ArchetypeId.UNKNOWN) continue;

    const matchedKeywords = archetype.keywords.filter(kw => lowerDesc.includes(kw));
    const score = matchedKeywords.length;

    if (score > 0) {
      scores.push({
        archetype,
        score,
        matchedKeywords,
        confidence: Math.min(0.5 + (score * 0.1), 0.95)
      });
    }
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  if (scores.length > 0) {
    return scores[0];
  }

  // Default to unknown
  return {
    archetype: archetypes[ArchetypeId.UNKNOWN],
    confidence: 0.3,
    matchedKeywords: []
  };
}

/**
 * Get archetype by ID
 * @param {string} id - Archetype ID
 * @returns {Object|null}
 */
export function getArchetype(id) {
  return archetypes[id] || null;
}

/**
 * Get all archetype IDs for selection
 * @returns {Object[]}
 */
export function getAllArchetypes() {
  return Object.values(archetypes)
    .filter(a => a.id !== ArchetypeId.UNKNOWN)
    .map(a => ({
      id: a.id,
      name: a.name,
      description: a.description
    }));
}
