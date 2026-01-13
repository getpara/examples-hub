export const SKIP_DIRS: readonly string[] = [
  'node_modules',
  '.next',
  '.nuxt',
  '.vite',
  '.output',
  'dist',
  '.yarn',
  'build',
  '.cache',
  '.git',
  '.turbo',
  '.parcel-cache',
  'coverage',
  '.svelte-kit'
];

export const BUILD_ARTIFACTS = [
  'dist',
  'build',
  '.next',
  '.nuxt',
  '.vite',
  '.output',
  '.turbo',
  '.parcel-cache',
  '.svelte-kit',
  'coverage',
  'out'
] as const;

export const CACHE_DIRS = [
  '.cache',
  '.yarn-cache-local',
  '.eslintcache',
  '.stylelintcache',
  'tsconfig.tsbuildinfo',
  '.yarn/cache',
  '.yarn/unplugged',
  '.yarn/build-state.yml',
  '.yarn/install-state.gz'
] as const;

export const MOBILE_ARTIFACTS = {
  ios: [
    'ios/build',
    'ios/Pods',
    'ios/DerivedData',
    '*.xcworkspace/xcuserdata',
    '*.xcodeproj/xcuserdata'
  ],
  android: [
    'android/build',
    'android/.gradle',
    'android/app/build',
    'android/.idea',
    '*.iml'
  ]
} as const;

export const CONCURRENCY_LIMITS = {
  install: 4,
  lint: 4,
  typecheck: 4,
  build: 4,
  clean: 8,
  retry: 2
} as const;

export const TIMEOUTS = {
  install: 120000,  // 2 minutes
  lint: 60000,      // 1 minute
  typecheck: 300000, // 5 minutes
  build: 300000,    // 5 minutes
  clean: 30000      // 30 seconds
} as const;

export const MAX_TRAVERSAL_DEPTH = 4;