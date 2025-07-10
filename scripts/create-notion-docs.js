#!/usr/bin/env node

/**
 * GameDin Discord - Notion Documentation Creator
 * Creates comprehensive documentation pages in Notion for the project HQ
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @description Automated creation of 9 documentation pages with detailed content
 */

const { Client } = require('@notionhq/client');
require('dotenv').config();

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Main HQ page ID
const MAIN_PAGE_ID = '22cc06dba88d802f8987fb28f15caf39';

// Documentation page templates
const DOCUMENTATION_TEMPLATES = {
  'Project Overview': {
    title: '📋 Project Overview',
    content: [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'GameDin Discord - Project Overview' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: 'GameDin Discord is a comprehensive gaming community platform built with modern web technologies, featuring real-time chat, game recommendations, social features, and AI-powered moderation.' } }
          ]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '🎯 Project Goals' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Create a unified gaming community platform' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Provide AI-powered game recommendations' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Enable real-time social interactions' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Implement robust moderation and security' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '🚀 Key Features' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Discord Bot Integration with advanced commands' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'React/TypeScript Frontend with Material-UI' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'AWS Amplify Backend with GraphQL API' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Real-time WebSocket Communication' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'AI-Powered Content Moderation' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Game Recommendation Engine' } }]
        }
      }
    ]
  },
  
  'Architecture': {
    title: '🏗️ System Architecture',
    content: [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'System Architecture' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: 'GameDin Discord follows a modern microservices architecture built on AWS cloud infrastructure with real-time capabilities and scalable design patterns.' } }
          ]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Frontend Architecture' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'React 18 with TypeScript for type safety' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Material-UI for consistent design system' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Redux Toolkit for state management' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'React Router for navigation' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Backend Architecture' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'AWS Amplify Gen2 for serverless backend' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'GraphQL API with AppSync for real-time data' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'DynamoDB for scalable data storage' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Lambda functions for serverless compute' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Discord Bot Architecture' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Discord.js v14 for bot framework' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Slash commands for modern interaction' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Event-driven architecture for scalability' } }]
        }
      }
    ]
  },
  
  'API Documentation': {
    title: '🔌 API Documentation',
    content: [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'API Documentation' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: 'Comprehensive API documentation for all endpoints, GraphQL schemas, and integration patterns used in the GameDin Discord platform.' } }
          ]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'GraphQL API' } }]
        }
      },
      {
        type: 'code',
        code: {
          rich_text: [{ type: 'text', text: { content: 'type User {\n  id: ID!\n  username: String!\n  email: String!\n  profile: Profile\n  friends: [User]\n  games: [Game]\n}' } }],
          language: 'graphql'
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'REST Endpoints' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'POST /api/auth/login - User authentication' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'GET /api/games - Retrieve game recommendations' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'POST /api/messages - Send real-time messages' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'GET /api/leaderboard - Get gaming leaderboards' } }]
        }
      }
    ]
  },
  
  'Roadmap': {
    title: '🗺️ Development Roadmap',
    content: [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'Development Roadmap' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: 'Strategic development roadmap outlining current progress, upcoming features, and long-term vision for the GameDin Discord platform.' } }
          ]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Phase 1: Foundation (Completed)' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '✅ Project setup and architecture design' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '✅ Basic Discord bot implementation' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '✅ Frontend React application' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Phase 2: Core Features (In Progress)' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '🔄 Real-time messaging system' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '🔄 Game recommendation engine' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '🔄 User authentication and profiles' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Phase 3: Advanced Features (Planned)' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '📋 AI-powered content moderation' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '📋 Advanced analytics and insights' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '📋 Mobile application development' } }]
        }
      }
    ]
  },
  
  'Changelog': {
    title: '📝 Changelog',
    content: [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'Changelog' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: 'Comprehensive changelog tracking all updates, improvements, bug fixes, and new features across the GameDin Discord platform.' } }
          ]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Version 1.3.0 - Current' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '✨ Added comprehensive Notion documentation system' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '🔧 Fixed TypeScript compilation errors' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '📦 Updated dependencies and resolved conflicts' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Version 1.2.0' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '🚀 Implemented real-time WebSocket communication' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '🎨 Enhanced UI/UX with Material-UI components' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Version 1.1.0' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '🤖 Added Discord bot with slash commands' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '🔐 Implemented user authentication system' } }]
        }
      }
    ]
  },
  
  'Team Collaboration': {
    title: '👥 Team Collaboration',
    content: [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'Team Collaboration' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: 'Guidelines, workflows, and best practices for effective team collaboration and development processes.' } }
          ]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Development Workflow' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Feature branches for all new development' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Pull request reviews required for all changes' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Automated testing and CI/CD pipelines' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Code Standards' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'TypeScript for type safety across the stack' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'ESLint and Prettier for code formatting' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Comprehensive documentation requirements' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Communication Channels' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Discord for real-time team communication' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'GitHub for issue tracking and project management' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Notion for documentation and knowledge sharing' } }]
        }
      }
    ]
  },
  
  'Security': {
    title: '🔒 Security Guidelines',
    content: [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'Security Guidelines' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: 'Comprehensive security policies, best practices, and implementation guidelines for protecting user data and system integrity.' } }
          ]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Authentication & Authorization' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'AWS Cognito for secure user authentication' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'JWT tokens with proper expiration handling' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Role-based access control (RBAC) implementation' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Data Protection' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'End-to-end encryption for sensitive communications' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Secure API endpoints with rate limiting' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Regular security audits and vulnerability assessments' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Content Moderation' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'AI-powered content filtering and moderation' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'User reporting and appeal systems' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Automated threat detection and response' } }]
        }
      }
    ]
  },
  
  'Deployment': {
    title: '🚀 Deployment Guide',
    content: [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'Deployment Guide' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: 'Comprehensive deployment procedures, environment configurations, and operational guidelines for the GameDin Discord platform.' } }
          ]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Environment Setup' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'AWS Amplify for frontend and backend deployment' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Environment-specific configuration management' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Secrets management with AWS Secrets Manager' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'CI/CD Pipeline' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'GitHub Actions for automated testing and deployment' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Multi-stage deployment (dev, staging, production)' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Automated rollback capabilities' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Monitoring & Logging' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'AWS CloudWatch for application monitoring' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Structured logging with correlation IDs' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Performance metrics and alerting' } }]
        }
      }
    ]
  },
  
  'Support': {
    title: '🆘 Support & Troubleshooting',
    content: [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'Support & Troubleshooting' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: 'Comprehensive support documentation, troubleshooting guides, and resources for resolving common issues and providing user assistance.' } }
          ]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Common Issues' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Authentication problems and resolution steps' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Discord bot connection issues' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Real-time messaging troubleshooting' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Development Support' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Local development environment setup' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Debugging tools and techniques' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Testing strategies and best practices' } }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Contact Information' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Discord server for community support' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'GitHub issues for bug reports and feature requests' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Email support for urgent issues' } }]
        }
      }
    ]
  }
};

/**
 * Creates a Notion page with the specified content
 * @param {string} title - Page title
 * @param {Array} content - Page content blocks
 * @returns {Promise<string>} - Created page ID
 */
async function createNotionPage(title, content) {
  try {
    const response = await notion.pages.create({
      parent: { page_id: MAIN_PAGE_ID },
      properties: {
        title: {
          title: [
            {
              type: 'text',
              text: {
                content: title
              }
            }
          ]
        }
      },
      children: content
    });
    
    console.log(`✅ Created page: ${title} (ID: ${response.id})`);
    return response.id;
  } catch (error) {
    console.error(`❌ Error creating page ${title}:`, error.message);
    throw error;
  }
}

/**
 * Main function to create all documentation pages
 */
async function createAllDocumentationPages() {
  console.log('🚀 Starting Notion documentation creation...\n');
  
  const createdPages = {};
  
  try {
    for (const [pageName, template] of Object.entries(DOCUMENTATION_TEMPLATES)) {
      console.log(`📝 Creating ${pageName}...`);
      const pageId = await createNotionPage(template.title, template.content);
      createdPages[pageName] = pageId;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 All documentation pages created successfully!');
    console.log('\n📋 Created Pages:');
    
    for (const [pageName, pageId] of Object.entries(createdPages)) {
      console.log(`  - ${pageName}: ${pageId}`);
    }
    
    // Save page IDs to configuration file
    const configContent = `// Notion Documentation Page IDs
// Generated automatically by create-notion-docs.js
// Last updated: ${new Date().toISOString()}

module.exports = {
  mainPageId: '${MAIN_PAGE_ID}',
  documentationPages: ${JSON.stringify(createdPages, null, 2)}
};
`;
    
    require('fs').writeFileSync('config/notion-pages.js', configContent);
    console.log('\n💾 Page IDs saved to config/notion-pages.js');
    
  } catch (error) {
    console.error('❌ Error creating documentation pages:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  createAllDocumentationPages();
}

module.exports = { createAllDocumentationPages, DOCUMENTATION_TEMPLATES }; 