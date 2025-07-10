// scripts/notion-expanded-content.js
// Expanded content for all Notion HQ documentation pages

module.exports = {
  "Project Overview": {
    title: "📋 Project Overview",
    content: [
      { type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: 'GameDin Discord - Project Overview' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'GameDin Discord is a next-generation gaming community platform that unifies Discord bot automation, real-time chat, AI-powered recommendations, and robust moderation into a seamless experience for gamers, moderators, and developers.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Mission & Vision' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'Our mission is to empower gaming communities with intelligent, accessible, and secure tools for social connection, discovery, and growth.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Stakeholders & Personas' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Gamers: Seeking new friends, games, and experiences.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Moderators: Managing safe, inclusive communities.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Developers: Extending and integrating platform features.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Key Features' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Discord Bot with advanced moderation, social, and utility commands.' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'React/TypeScript frontend with Material-UI and mobile-first design.' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'AWS Amplify backend with GraphQL API, Cognito auth, and DynamoDB storage.' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'AI-powered game recommendations and content moderation.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'System Context Diagram' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'See the Architecture page for a full system diagram and integration map.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'KPIs & Success Metrics' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'User growth and retention' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Message volume and engagement' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Moderation actions and incident response time' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Recommendation accuracy and user satisfaction' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Changelog & References' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'See the Changelog page for version history. Cross-reference: @memories.md, @lessons-learned.md.' } }] } }
    ]
  },
  "System Architecture": {
    title: "🏗️ System Architecture",
    content: [
      { type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: 'System Architecture' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'GameDin Discord is architected as a modular, scalable, and cloud-native platform. It leverages microservices, serverless functions, and real-time communication to deliver a seamless user experience.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Architecture Diagram' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: '```mermaid\ngraph TD;\n  User[User Devices] -->|Web/App| Frontend;\n  Frontend -->|GraphQL| Backend;\n  Backend -->|Lambda| Functions;\n  Backend -->|DynamoDB| Database;\n  Backend -->|WebSocket| RealTime;\n  Frontend -->|WebSocket| RealTime;\n  Bot[Discord Bot] -->|API| Backend;\n  Backend -->|Cognito| Auth;\n```' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Component Breakdown' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Frontend: React 18, TypeScript, Material-UI, Redux Toolkit, React Router.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Backend: AWS Amplify Gen2, AppSync GraphQL, Lambda, DynamoDB, Cognito.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Bot: Discord.js v14, event-driven, slash commands, moderation.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Infrastructure: CloudFormation, CI/CD, CloudWatch, WAF, S3.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Data Flow & Integration' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'Data flows securely between frontend, backend, and bot via GraphQL, REST, and WebSocket APIs. All sensitive data is encrypted in transit and at rest.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Tech Stack Matrix' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'React, TypeScript, Material-UI, Redux, AWS Amplify, AppSync, Lambda, DynamoDB, Cognito, Discord.js, CloudFormation, S3, CloudWatch.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Scalability & Reliability' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Auto-scaling serverless backend.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Multi-region deployment for high availability.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Comprehensive monitoring and alerting.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'References' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'See @docs/ARCHITECTURE.md and @docs/deployment/DEPLOYMENT.md for more details.' } }] } }
    ]
  },
  "API Documentation": {
    title: "🔌 API Documentation",
    content: [
      { type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: 'API Documentation' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'This section documents all REST and GraphQL endpoints, request/response schemas, authentication flows, and usage examples for GameDin Discord.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'GraphQL API' } }] } },
      { type: 'code', code: { rich_text: [{ type: 'text', text: { content: 'type User {\n  id: ID!\n  username: String!\n  email: String!\n  profile: Profile\n  friends: [User]\n  games: [Game]\n}' } }], language: 'graphql' } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'REST Endpoints' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'POST /api/auth/login - User authentication' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'GET /api/games - Retrieve game recommendations' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'POST /api/messages - Send real-time messages' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'GET /api/leaderboard - Get gaming leaderboards' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Authentication & Authorization' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'All endpoints require JWT authentication via AWS Cognito. Role-based access control (RBAC) is enforced for sensitive operations.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Usage Example' } }] } },
      { type: 'code', code: { rich_text: [{ type: 'text', text: { content: 'fetch("/api/games", { headers: { Authorization: `Bearer ${token}` } })' } }], language: 'javascript' } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Error Handling & Rate Limiting' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'All APIs implement structured error responses and rate limiting to prevent abuse.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'References' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'See @docs/API.md and @docs/api/README.md for full schemas and live examples.' } }] } }
    ]
  },
  "Development Roadmap": {
    title: "🗺️ Development Roadmap",
    content: [
      { type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: 'Development Roadmap' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'This roadmap outlines the phased development plan, milestones, and release criteria for GameDin Discord.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Phases & Milestones' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Phase 1: Foundation (Setup, architecture, initial bot, basic frontend)' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Phase 2: Core Features (Real-time messaging, recommendations, profiles)' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Phase 3: Advanced Features (AI moderation, analytics, mobile app)' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Timeline' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'See Gantt chart in @docs/roadmap.md for detailed schedule.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Release Criteria' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'All features tested and documented.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Performance and security benchmarks met.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'No critical bugs or regressions.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'References' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'See @scratchpad.md for current phase and @docs/roadmap.md for full details.' } }] } }
    ]
  },
  "Changelog": {
    title: "📝 Changelog",
    content: [
      { type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: 'Changelog' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'This changelog tracks all releases, improvements, bug fixes, and migrations for GameDin Discord.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Version History' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'v1.3.1: Expanded Notion HQ documentation with quantum-detailed content.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'v1.3.0: Added Notion documentation sync system.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'v1.2.0: Implemented real-time WebSocket communication.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'v1.1.0: Added Discord bot with slash commands.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Upgrade & Migration Notes' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'See @docs/CHANGELOG.md for full release notes and migration instructions.' } }] } }
    ]
  },
  "Team Collaboration": {
    title: "👥 Team Collaboration",
    content: [
      { type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: 'Team Collaboration' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'This section documents team roles, onboarding, communication protocols, and development workflows.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Roles & Responsibilities' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Product Owner: Vision, roadmap, priorities.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Developers: Feature implementation, code quality.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Moderators: Community safety, incident response.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Onboarding Checklist' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Access Notion HQ and review all documentation.' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Clone repository and set up local environment.' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Join Discord server and introduce yourself.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Communication Protocols' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Discord: Real-time chat and support.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'GitHub: Issue tracking and code reviews.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Notion: Documentation and knowledge base.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Development Workflow' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Create feature branches for all new work.' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Submit pull requests for review.' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Run automated tests and CI/CD checks.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'References' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'See @docs/ARCHITECTURE.md and @memories.md for team decisions and process logs.' } }] } }
    ]
  },
  "Security Guidelines": {
    title: "🔒 Security Guidelines",
    content: [
      { type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: 'Security Guidelines' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'This section documents security policies, best practices, and incident response for GameDin Discord.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Threat Model & Risk Assessment' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'DDoS, account takeover, data breach, bot abuse.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Data Protection & Privacy' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'All user data encrypted in transit and at rest.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'GDPR and CCPA compliance.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Secure Coding Standards' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Input validation and output encoding everywhere.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Principle of least privilege for all roles.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Incident Response Plan' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Detect and triage security incidents.' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Contain, eradicate, and recover.' } }] } },
      { type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: 'Post-mortem and lessons learned.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'References' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'See @docs/security/ and @lessons-learned.md for security incidents and solutions.' } }] } }
    ]
  },
  "Deployment Guide": {
    title: "🚀 Deployment Guide",
    content: [
      { type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: 'Deployment Guide' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'This section documents deployment procedures, environment setup, CI/CD, and monitoring for GameDin Discord.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Environment Matrix' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Dev: Feature testing, staging: pre-prod validation, prod: live users.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'CI/CD Pipeline' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'GitHub Actions for build, test, deploy.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Automated rollback and hotfix support.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Monitoring & Alerting' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'AWS CloudWatch for logs and metrics.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Performance and error alerting.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'References' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'See @docs/deployment/DEPLOYMENT.md and @docs/deployment/ci-cd.md for full details.' } }] } }
    ]
  },
  "Support & Troubleshooting": {
    title: "🆘 Support & Troubleshooting",
    content: [
      { type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: 'Support & Troubleshooting' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'This section provides FAQs, diagnostic guides, and escalation paths for GameDin Discord.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'FAQ & Common Issues' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Login/authentication problems: Check credentials, reset password.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Bot not responding: Check bot status, permissions, and logs.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Real-time messaging issues: Check WebSocket connection and network.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Diagnostic Flowcharts' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'See @docs/support/ for troubleshooting diagrams and guides.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Contact & Escalation' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Discord: #support channel for real-time help.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'GitHub: File issues for bugs and feature requests.' } }] } },
      { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Email: support@gamedin.com for urgent matters.' } }] } },
      { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'References' } }] } },
      { type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'See @docs/support/ and @memories.md for support history and escalation logs.' } }] } }
    ]
  }
}; 