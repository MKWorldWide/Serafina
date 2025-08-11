import { Client } from 'discord.js';
import { createLogger } from '../pino-logger';
import { BaseTask, type TaskOptions } from './base-task';
import { ScheduledTask, type ScheduledTaskOptions } from 'node-cron';
import { config } from '../config';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const logger = createLogger('task:manager');

/**
 * Manages scheduled tasks for the bot
 */
export class TaskManager {
  private readonly client: Client;
  private readonly tasks: Map<string, { task: BaseTask; job: ScheduledTask }> = new Map();
  private readonly taskDirectory: string;
  
  constructor(client: Client) {
    this.client = client;
    this.taskDirectory = path.join(process.cwd(), 'dist', 'src', 'tasks');
    
    // Ensure the task directory exists
    if (!fs.existsSync(this.taskDirectory)) {
      fs.mkdirSync(this.taskDirectory, { recursive: true });
      logger.info(`Created task directory: ${this.taskDirectory}`);
    }
  }
  
  /**
   * Load all tasks from the tasks directory
   */
  public async loadTasks(): Promise<void> {
    try {
      const files = await readdir(this.taskDirectory);
      const taskFiles = files.filter(file => 
        file.endsWith('.js') && 
        !file.endsWith('.d.ts') && 
        file !== 'index.js' && 
        file !== 'base-task.js' && 
        file !== 'task-manager.js'
      );
      
      logger.info(`Found ${taskFiles.length} task(s) to load`);
      
      for (const file of taskFiles) {
        try {
          const taskModule = await import(path.join(this.taskDirectory, file));
          const TaskClass = taskModule.default || Object.values(taskModule)[0];
          
          if (TaskClass && TaskClass.prototype instanceof BaseTask) {
            const taskInstance = new TaskClass();
            this.addTask(taskInstance);
          } else {
            logger.warn(`Skipping invalid task file: ${file}`);
          }
        } catch (error) {
          logger.error(`Failed to load task from ${file}:`, error);
        }
      }
      
      logger.info(`Successfully loaded ${this.tasks.size} task(s)`);
    } catch (error) {
      logger.error('Failed to load tasks:', error);
      throw error;
    }
  }
  
  /**
   * Add a task to the manager
   */
  public addTask(task: BaseTask): void {
    if (this.tasks.has(task.name)) {
      throw new Error(`A task with the name '${task.name}' already exists`);
    }
    
    if (!task.isEnabled()) {
      logger.info(`Skipping disabled task: ${task.name}`);
      return;
    }
    
    try {
      // Initialize the task with the client
      task.initialize(this.client);
      
      // Import node-cron dynamically to avoid loading it if not needed
      import('node-cron').then(({ schedule }) => {
        const options: ScheduledTaskOptions = {
          scheduled: false,
          timezone: task.getTimezone(),
          name: task.name,
        };
        
        // Create the scheduled task
        const job = schedule(
          task.getSchedule(),
          this.createTaskHandler(task),
          options
        );
        
        // Store the task and job
        this.tasks.set(task.name, { task, job });
        
        // Start the job
        job.start();
        
        // Run immediately if configured to do so
        if (task.shouldRunOnStart()) {
          this.executeTask(task).catch(error => {
            logger.error(`Error running task on start: ${task.name}`, error);
          });
        }
        
        logger.info(`Scheduled task: ${task.name} (${task.getSchedule()})`);
      }).catch(error => {
        logger.error(`Failed to schedule task ${task.name}:`, error);
      });
    } catch (error) {
      logger.error(`Failed to initialize task ${task.name}:`, error);
    }
  }
  
  /**
   * Create a handler function for a task
   */
  private createTaskHandler(task: BaseTask): () => Promise<void> {
    return async () => {
      try {
        await this.executeTask(task);
      } catch (error) {
        logger.error(`Unhandled error in task ${task.name}:`, error);
      }
    };
  }
  
  /**
   * Execute a task with concurrency control
   */
  private async executeTask(task: BaseTask): Promise<void> {
    const taskInfo = this.tasks.get(task.name);
    if (!taskInfo) {
      throw new Error(`Task not found: ${task.name}`);
    }
    
    const runningTasks = Array.from(this.tasks.values())
      .filter(({ task: t }) => t.name === task.name && t.isRunning)
      .length;
    
    const maxConcurrent = task.getMaxConcurrent();
    if (runningTasks >= maxConcurrent) {
      if (task.shouldQueue()) {
        logger.debug(`Queueing task ${task.name} (${runningTasks}/${maxConcurrent} running)`);
        // Wait for a slot to become available
        await new Promise(resolve => {
          const check = () => {
            const currentRunning = Array.from(this.tasks.values())
              .filter(({ task: t }) => t.name === task.name && t.isRunning)
              .length;
              
            if (currentRunning < maxConcurrent) {
              resolve(undefined);
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        });
      } else {
        logger.warn(`Skipping task ${task.name} (${runningTasks}/${maxConcurrent} running)`);
        return;
      }
    }
    
    // Mark task as running
    task.isRunning = true;
    
    try {
      await task.execute();
    } finally {
      // Mark task as not running
      task.isRunning = false;
    }
  }
  
  /**
   * Remove a task from the manager
   */
  public removeTask(name: string): boolean {
    const taskInfo = this.tasks.get(name);
    if (!taskInfo) return false;
    
    // Stop the cron job
    taskInfo.job.stop();
    
    // Destroy the task
    taskInfo.task.destroy().catch(error => {
      logger.error(`Error destroying task ${name}:`, error);
    });
    
    // Remove from the tasks map
    this.tasks.delete(name);
    
    logger.info(`Removed task: ${name}`);
    return true;
  }
  
  /**
   * Get a task by name
   */
  public getTask(name: string): BaseTask | undefined {
    return this.tasks.get(name)?.task;
  }
  
  /**
   * Get all tasks
   */
  public getAllTasks(): BaseTask[] {
    return Array.from(this.tasks.values()).map(({ task }) => task);
  }
  
  /**
   * Start all tasks
   */
  public startAll(): void {
    for (const [name, { job }] of this.tasks) {
      try {
        job.start();
        logger.debug(`Started task: ${name}`);
      } catch (error) {
        logger.error(`Failed to start task ${name}:`, error);
      }
    }
  }
  
  /**
   * Stop all tasks
   */
  public stopAll(): void {
    for (const [name, { job }] of this.tasks) {
      try {
        job.stop();
        logger.debug(`Stopped task: ${name}`);
      } catch (error) {
        logger.error(`Failed to stop task ${name}:`, error);
      }
    }
  }
  
  /**
   * Destroy the task manager and clean up resources
   */
  public async destroy(): Promise<void> {
    logger.info('Destroying task manager...');
    
    // Stop all tasks
    this.stopAll();
    
    // Destroy all tasks
    const destroyPromises = Array.from(this.tasks.values()).map(({ task }) => 
      task.destroy().catch(error => {
        logger.error(`Error destroying task ${task.name}:`, error);
      })
    );
    
    await Promise.all(destroyPromises);
    
    // Clear the tasks map
    this.tasks.clear();
    
    logger.info('Task manager destroyed');
  }
}
