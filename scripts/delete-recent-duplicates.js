#!/usr/bin/env node

/**
 * Delete Recent Duplicate Notion Pages
 * Removes recently created duplicate pages
 */

const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Main HQ page ID
const MAIN_PAGE_ID = '22cc06dba88d802f8987fb28f15caf39';

// Original page IDs (keep these)
const ORIGINAL_PAGE_IDS = [
  '22cc06db-a88d-8132-bccc-cbccffff5028', // Project Overview
  '22cc06db-a88d-811f-8acb-c7ad9a91d302', // System Architecture
  '22cc06db-a88d-81d5-acd2-ebca25346281', // API Documentation
  '22cc06db-a88d-8157-b489-f633783fdedd', // Development Roadmap
  '22cc06db-a88d-81f3-9294-de6ee5ae9e2e', // Changelog
  '22cc06db-a88d-8134-a8f2-cbda5fc61854', // Team Collaboration
  '22cc06db-a88d-8165-b9bd-f4087df2cd58', // Security Guidelines
  '22cc06db-a88d-8103-b7e7-ef4c7dd057ef', // Deployment Guide
  '22cc06db-a88d-8177-b04a-cd03810f8c3c'  // Support & Troubleshooting
];

async function deleteDuplicatePages() {
  console.log('🗑️ Finding and deleting duplicate Notion pages...\n');
  
  try {
    // Get all child pages of the main HQ page
    const response = await notion.blocks.children.list({
      block_id: MAIN_PAGE_ID,
      page_size: 100
    });
    
    const pagesToDelete = [];
    
    for (const block of response.results) {
      if (block.type === 'child_page') {
        const pageId = block.id;
        const pageTitle = block.child_page.title[0]?.plain_text || 'Unknown';
        
        // Check if this is a duplicate (not in original list)
        if (!ORIGINAL_PAGE_IDS.includes(pageId)) {
          pagesToDelete.push({ id: pageId, title: pageTitle });
          console.log(`📝 Found duplicate: ${pageTitle} (${pageId})`);
        }
      }
    }
    
    if (pagesToDelete.length === 0) {
      console.log('✅ No duplicate pages found!');
      return;
    }
    
    console.log(`\n🗑️ Deleting ${pagesToDelete.length} duplicate pages...\n`);
    
    for (const page of pagesToDelete) {
      try {
        await notion.pages.update({
          page_id: page.id,
          archived: true
        });
        console.log(`✅ Deleted: ${page.title}`);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error deleting ${page.title}:`, error.message);
      }
    }
    
    console.log('\n🎉 Duplicate pages cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error finding pages:', error.message);
  }
}

deleteDuplicatePages(); 