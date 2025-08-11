import { ping } from '../../src/services/heartbeat';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

// Define test services
const TEST_SERVICES = [
  { name: 'mock-api', url: 'http://localhost:8080/health' },
  // Add more test services as needed
];

// Create test results directory
const RESULTS_DIR = join(process.cwd(), 'test-results');
const REPORT_PATH = join(RESULTS_DIR, 'heartbeat-results.md');

interface TestResult {
  service: string;
  url: string;
  status: number;
  responseTime: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

async function runHeartbeatChecks(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  for (const service of TEST_SERVICES) {
    const startTime = Date.now();
    let result: TestResult;
    
    try {
      const response = await ping(service.url);
      const responseTime = Date.now() - startTime;
      
      result = {
        service: service.name,
        url: service.url,
        status: response.status || 200,
        responseTime,
        success: response.ok,
        timestamp: new Date().toISOString(),
      };
      
      if (!response.ok) {
        result.error = response.error?.message || 'Unknown error';
      }
    } catch (error) {
      result = {
        service: service.name,
        url: service.url,
        status: 0,
        responseTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
    
    results.push(result);
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

function generateMarkdownReport(results: TestResult[]): string {
  const date = new Date().toLocaleString();
  let report = `# ❤️ Heartbeat Check Report\n`;
  report += `**Generated on:** ${date}\n\n`;
  
  // Summary
  const totalChecks = results.length;
  const passedChecks = results.filter(r => r.success).length;
  const failedChecks = totalChecks - passedChecks;
  
  report += `## 📊 Summary\n`;
  report += `✅ **Passed:** ${passedChecks}  
`;
  report += `❌ **Failed:** ${failedChecks}  \n\n`;
  
  // Details
  report += `## 🔍 Detailed Results\n\n`;
  report += `| Service | Status | Response Time | Details |\n`;
  report += `|---------|--------|---------------|---------|\n`;
  
  for (const result of results) {
    const statusEmoji = result.success ? '✅' : '❌';
    const statusText = result.success ? 'UP' : `DOWN (${result.status || 'Error'})`;
    const details = result.error ? `\`${result.error}\`` : 'OK';
    
    report += `| ${result.service} | ${statusEmoji} ${statusText} | ${result.responseTime}ms | ${details} |\n`;
  }
  
  // Add a note about the test environment
  report += '\n> *Note: This is a test run in a controlled environment. Results may vary in production.*';
  
  return report;
}

async function main() {
  try {
    console.log('🚀 Starting heartbeat checks...');
    
    // Create results directory if it doesn't exist
    await mkdir(RESULTS_DIR, { recursive: true });
    
    // Run checks
    const results = await runHeartbeatChecks();
    
    // Generate report
    const report = generateMarkdownReport(results);
    
    // Save report to file
    await writeFile(REPORT_PATH, report, 'utf8');
    console.log(`📊 Report saved to ${REPORT_PATH}`);
    
    // Log summary to console
    const failedServices = results.filter(r => !r.success);
    if (failedServices.length > 0) {
      console.error('❌ Some services failed the heartbeat check:');
      for (const service of failedServices) {
        console.error(`  - ${service.service}: ${service.error}`);
      }
      process.exit(1);
    }
    
    console.log('✅ All services are healthy!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running heartbeat checks:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
