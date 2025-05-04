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
    'result',
    'results',  // Added 'results' here
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

// Extensions that should always be considered binary
export const BINARY_FILE_EXTENSIONS = [
    // Images
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.tiff', '.svg',
    // Documents and PDFs
    '.pdf', 
    // Archives
    '.zip', '.gz', '.tar', '.rar', '.7z', '.bz2', '.xz',
    // Executables and libraries
    '.exe', '.dll', '.so', '.dylib', '.o', '.obj', '.a', '.lib',
    // Binary and data files
    '.bin', '.dat', '.db', '.sqlite', '.vsix', '.class',
    // Media
    '.mp3', '.mp4', '.avi', '.mov', '.wav', '.ogg', '.flac', '.mkv', '.webm',
    // Fonts
    '.ttf', '.woff', '.woff2', '.eot', '.otf',
    // Other binary formats
    '.swf', '.fla', '.psd', '.ai', '.eps', '.indd'
];

// Lock files that should always be excluded (too large)
export const LOCK_FILES = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'composer.lock',
    'Gemfile.lock',
    'Cargo.lock',
    'Pipfile.lock',
    'poetry.lock',
    'npm-shrinkwrap.json',
    'gradle.lockfile',
    'mix.lock',
    'Podfile.lock',
    'pubspec.lock',
    'flake.lock',
    'go.sum',
    'Carthage.resolved',
    'paket.lock'
];

// Extensions that should always be considered text
export const TEXT_FILE_EXTENSIONS = [
    // Web files
    '.html', '.htm', '.xhtml', '.css', '.js', '.jsx', '.ts', '.tsx', '.php', '.asp', '.aspx',
    // Configuration files
    '.json', '.yaml', '.yml', '.toml', '.ini', '.conf', '.config', '.xml', '.xsd', '.wsdl', '.plist',
    // Markdown and text
    '.md', '.markdown', '.txt', '.text', '.rst', '.rtf', '.csv', '.tsv',
    // Source code
    '.c', '.cpp', '.h', '.hpp', '.cs', '.java', '.py', '.rb', '.go', '.rs', '.swift',
    '.kt', '.scala', '.sh', '.bash', '.ps1', '.bat', '.cmd', '.vb', '.fs', '.dart',
    '.lua', '.pl', '.pm', '.php', '.php5', '.inc', '.hs', '.elm', '.ex', '.exs',
    '.erl', '.hrl', '.clj', '.cljs', '.groovy', '.gradle', '.r', '.rmd',
    // Documentation
    '.tex', '.bib', '.sty',
    // Other text formats
    '.sql', '.graphql', '.gql', '.proto', '.pug', '.jade', '.haml', '.vue', '.svelte'
];

// Files that should always be included regardless of exclusion patterns
export const ALWAYS_INCLUDE_FILES = [
    // Package and configuration files
    'package.json',
    'tsconfig.json',
    'composer.json',
    'bower.json',
    'manifest.json',
    'project.json',
    'README.md',
    'LICENSE',
    'Makefile',
    'Dockerfile',
    'docker-compose.yml',
    '.gitignore',
    '.editorconfig',
    '.eslintrc.json',
    '.prettierrc',
    '.babelrc',
    '.gitlab-ci.yml',
    '.travis.yml',
    'appveyor.yml',
    'serverless.yml',
    'gatsby-config.js',
    'next.config.js',
    'webpack.config.js',
    'rollup.config.js',
];