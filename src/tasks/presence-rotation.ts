import { ActivityType } from 'discord.js';
import { BaseTask } from '../core/tasks/base-task';
import { config } from '../core/config';

interface Activity {
  type: ActivityType;
  name: string;
  status: 'online' | 'idle' | 'dnd' | 'invisible';
}

/**
 * Task to rotate the bot's presence/status
 */
export default class PresenceRotationTask extends BaseTask {
  public readonly name = 'presence-rotation';
  
  // Rotate presence every 5 minutes
  protected readonly options = {
    schedule: '*/5 * * * *',
    timezone: 'UTC',
    runOnStart: true,
  };
  
  // List of activities to rotate through
  private activities: Activity[] = [
    { type: ActivityType.Playing, name: 'with the Discord API', status: 'online' },
    { type: ActivityType.Watching, name: 'for commands', status: 'online' },
    { type: ActivityType.Listening, name: 'to /help', status: 'online' },
    { type: ActivityType.Competing, name: 'in a coding competition', status: 'dnd' },
    { type: ActivityType.Streaming, name: 'live on Twitch', status: 'online', url: 'https://twitch.tv/yourchannel' },
  ];
  
  // Custom statuses can be added here
  private customStatuses = [
    { type: ActivityType.Custom, name: 'Custom Status 1', status: 'online' as const },
    { type: ActivityType.Custom, name: 'Custom Status 2', status: 'idle' as const },
  ];
  
  // Current activity index
  private currentIndex = 0;
  
  constructor() {
    super({
      schedule: '*/5 * * * *', // Every 5 minutes
      timezone: 'UTC',
      runOnStart: true,
    });
    
    // Add custom statuses if configured
    if (config.app.customStatuses?.length) {
      this.activities = [
        ...this.activities,
        ...config.app.customStatuses.map((status: string) => ({
          type: ActivityType.Custom,
          name: status,
          status: 'online' as const,
        })),
      ];
    }
  }
  
  /**
   * Rotate the bot's presence
   */
  protected async run(client: any): Promise<void> {
    try {
      // Skip if client user is not available
      if (!client.user) {
        this.logger.warn('Client user not available');
        return;
      }
      
      // Get the next activity
      const activity = this.getNextActivity();
      
      // Set the presence
      await client.user.setPresence({
        activities: [{
          name: activity.name,
          type: activity.type,
          ...(activity.type === ActivityType.Streaming && { url: 'https://twitch.tv/yourchannel' }),
        }],
        status: activity.status,
      });
      
      this.logger.debug(`Updated presence to: ${activity.type} ${activity.name} (${activity.status})`);
    } catch (error) {
      this.logger.error('Failed to update presence:', error);
      throw error;
    }
  }
  
  /**
   * Get the next activity in the rotation
   */
  private getNextActivity(): Activity {
    // Get the current activity
    const activity = this.activities[this.currentIndex];
    
    // Move to the next activity
    this.currentIndex = (this.currentIndex + 1) % this.activities.length;
    
    return activity;
  }
  
  /**
   * Add a custom activity to the rotation
   */
  public addActivity(activity: Omit<Activity, 'status'> & { status?: Activity['status'] }): void {
    this.activities.push({
      ...activity,
      status: activity.status || 'online',
    });
    
    this.logger.debug(`Added new activity: ${activity.type} ${activity.name}`);
  }
  
  /**
   * Remove an activity from the rotation by name
   */
  public removeActivity(activityName: string): boolean {
    const initialLength = this.activities.length;
    this.activities = this.activities.filter(a => a.name !== activityName);
    
    const removed = initialLength !== this.activities.length;
    if (removed) {
      this.logger.debug(`Removed activity: ${activityName}`);
      
      // Reset index if we removed the current activity
      if (this.currentIndex >= this.activities.length) {
        this.currentIndex = 0;
      }
    }
    
    return removed;
  }
  
  /**
   * Get the current list of activities
   */
  public getActivities(): Activity[] {
    return [...this.activities];
  }
}
