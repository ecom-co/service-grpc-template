// @ts-check
// Using @ecom-co/eslint library for clean and maintainable configuration
import { createNestJSConfig } from '@ecom-co/eslint/nestjs';

export default createNestJSConfig({
  tsconfigRootDir: import.meta.dirname,
  project: './tsconfig.json',
  
  // Additional ignore patterns for this project
  ignores: [],
  
  // Custom project-specific rules
  rules: {
    // Allow console.log in development
    'no-console': 'warn',
  },
  
  // Custom import groups for this project
  importGroups: {
    pathGroups: [
      {
        pattern: '@ecom/**',
        group: 'internal',
        position: 'before',
      },
      {
        pattern: '@/*',
        group: 'internal',
        position: 'after',
      },
    ],
  },
});