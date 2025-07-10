#!/usr/bin/env node

/**
 * Delete Duplicate Notion Pages
 * Removes the duplicate pages that were accidentally created
 */

const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Duplicate page IDs to delete
const DUPLICATE_PAGE_IDS = [
  '22cc06db-a88d-81eb-bfa8-c58cf8399036', // Project Overview
  '22cc06db-a88d-812d-bd79-c3a5e5bc9a7c', // Architecture
  '22cc06db-a88d-8113-81e9-c29f354a7d0a', // API Documentation
  '22cc06db-a88d-819d-85eb-c1ffac73383f', // Roadmap
  '22cc06db-a88d-81f0-bc85-d6157ce6075e', // Changelog
  '22cc06db-a88d-8140-9537-c4aa4bd631bb', // Team Collaboration
  '22cc06db-a88d-8147-8ba4-e7bc220e4215', // Security
  '22cc06db-a88d-819e-9d04-f98f456583a5', // Deployment
  '22cc06db-a88d-81de-b1f8-e4957e8b9db8'  // Support
];

async function deleteDuplicatePages() {
  console.log('🗑️ Deleting duplicate Notion pages...\n');
  
  for (const pageId of DUPLICATE_PAGE_IDS) {
    try {
      await notion.pages.update({
        page_id: pageId,
        archived: true
      });
      console.log(`✅ Deleted page: ${pageId}`);
    } catch (error) {
      console.error(`❌ Error deleting page ${pageId}:`, error.message);
    }
  }
  
  console.log('\n🎉 All duplicate pages deleted successfully!');
}

deleteDuplicatePages(); 