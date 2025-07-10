#!/usr/bin/env node

/**
 * Update Existing Notion Pages with Expanded Content
 * Updates the original pages with quantum-detailed, expanded content
 */

const { Client } = require('@notionhq/client');
const expandedContent = require('./notion-expanded-content');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Original page IDs (from the first creation)
const ORIGINAL_PAGE_IDS = {
  'Project Overview': '22cc06db-a88d-8132-bccc-cbccffff5028',
  'Architecture': '22cc06db-a88d-811f-8acb-c7ad9a91d302',
  'API Documentation': '22cc06db-a88d-81d5-acd2-ebca25346281',
  'Roadmap': '22cc06db-a88d-8157-b489-f633783fdedd',
  'Changelog': '22cc06db-a88d-81f3-9294-de6ee5ae9e2e',
  'Team Collaboration': '22cc06db-a88d-8134-a8f2-cbda5fc61854',
  'Security': '22cc06db-a88d-8165-b9bd-f4087df2cd58',
  'Deployment': '22cc06db-a88d-8103-b7e7-ef4c7dd057ef',
  'Support': '22cc06db-a88d-8177-b04a-cd03810f8c3c'
};

async function updateNotionPages() {
  console.log('🔄 Updating Notion pages with expanded content...\n');
  
  for (const [pageName, pageId] of Object.entries(ORIGINAL_PAGE_IDS)) {
    try {
      console.log(`📝 Updating ${pageName}...`);
      
      // Clear existing content and add new expanded content
      await notion.blocks.children.delete({
        block_id: pageId
      });
      
      await notion.blocks.children.append({
        block_id: pageId,
        children: expandedContent[pageName].content
      });
      
      console.log(`✅ Updated ${pageName}`);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error updating ${pageName}:`, error.message);
    }
  }
  
  console.log('\n🎉 All pages updated successfully with expanded content!');
}

updateNotionPages(); 