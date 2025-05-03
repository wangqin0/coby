// Default patterns for file/directory exclusion
export const DEFAULT_EXCLUSION_PATTERNS = [
    // Build and dependency directories
    'node_modules',
    'dist',
    'build',
    'bin',
    'obj',
    'target',
    '.git',
    '.vs',
    '.idea',
    'out',
    'intermediate',
    '__pycache__',
    'venv',
    '.venv',
    '.next',
    'cmake',
    'CMakeFiles',
    'Debug',
    'Release',
    'cmake-build-debug',
    'cmake-build-release',
    'cmake-build',
    '.gradle',
    'gradle',
    'gradlew',
    'gradlew.bat',
    '_deps',
    
    // Lock files
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'composer.lock',
    'Gemfile.lock',
    'Cargo.lock',
    'Pipfile.lock',
    'poetry.lock',
    
    // Log files
    'yarn-error.log',
    'npm-debug.log',
    'yarn-debug.log',
    'yarn-error.log',
    'logs',
    'log',
    '*.log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    'lerna-debug.log*',
    
    // Package files
    'package.json',
    
    // Temporary and output directories
    'output',
    'outputs',
    'temp',
    'tmp',
    'cache',
    '.cache',
    '.npm',
    '.eslintcache',
    '.stylelintcache',
    
    // Coverage and test outputs
    'coverage',
    '.coverage',
    'report',
    'reports',
    'test-results',
    'test-output',
    'junit-reports',
    'artifacts',
    '.artifacts',
    '.output',
    '.coverage.*',
    'htmlcov',
    '.tox',
    'nosetests.xml',
    'coverage.xml',
    '*.cover',
    '.hypothesis',
    'cypress/videos',
    'cypress/screenshots',
    
    // System files
    '.DS_Store',
    'Thumbs.db',
    
    // Python specific
    '*.pyc',
    '*.pyo',
    '*.pyd',
    '.Python',
    '.pytest_cache',
    
    // Environment files
    'env',
    'ENV',
    '.env',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local'
];