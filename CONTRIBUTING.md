# Contributing to Serafina Bot

Thank you for your interest in contributing to Serafina Bot! We welcome all contributions, whether they be bug reports, feature requests, or code contributions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Development Workflow](#development-workflow)
  - [Branch Naming](#branch-naming)
  - [Commit Messages](#commit-messages)
  - [Pull Requests](#pull-requests)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)
- [License](#license)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 20.x
- pnpm 9.x
- PostgreSQL 14+ (for development)
- Git

### Installation

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/Serafina.git
   cd Serafina
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
5. Run the development server:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branch Naming

Use the following format for branch names:

- `feat/feature-name` - For new features
- `fix/issue-description` - For bug fixes
- `docs/update-readme` - For documentation updates
- `chore/tooling-update` - For tooling and configuration changes

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Please format your commit messages as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Example:
```
feat(commands): add new ping command

Add a new ping command that responds with pong and latency information.

Closes #123
```

### Pull Requests

1. Create a new branch for your feature or bugfix
2. Make your changes and commit them with descriptive messages
3. Push your branch to your fork
4. Open a pull request against the `main` branch
5. Ensure all CI checks pass
6. Request a review from a maintainer

## Code Style

- Use TypeScript with strict mode enabled
- Follow the project's ESLint and Prettier configurations
- Write meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused on a single responsibility

## Testing

- Write tests for new features and bug fixes
- Ensure all tests pass before submitting a PR
- Update tests when changing functionality
- Test your changes manually in a development environment

## Documentation

- Update documentation when adding or changing features
- Keep code comments up to date
- Add examples for new features
- Document any breaking changes

## Reporting Issues

When reporting issues, please include:

1. A clear title and description
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots or logs if applicable
6. Version information (Node.js, pnpm, etc.)

## Feature Requests

We welcome feature requests! Please open an issue with:

1. A clear description of the feature
2. The problem it solves
3. Any alternative solutions you've considered
4. Additional context or examples

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE) file.
