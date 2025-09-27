import chalk from 'chalk';
import { DogArt } from '../character/dog-art.js';

/**
 * Notification Manager
 * Handles alerts and notifications with ASCII art
 */
export class NotificationManager {
  constructor() {
    this.initialized = false;
    this.notifications = [];
  }

  async initialize() {
    console.log(chalk.yellow('🔔 Notification system initializing...'));

    // Basic initialization
    this.initialized = true;
    console.log(chalk.green('✅ Notification system ready'));

    return this.initialized;
  }

  async sendAlert(message, asciiArt = null) {
    const notification = {
      id: Date.now().toString(),
      type: 'alert',
      message,
      asciiArt,
      timestamp: new Date()
    };

    this.notifications.push(notification);

    // Display notification
    console.log(chalk.red('\n🚨 ALERT:'));
    if (asciiArt) {
      console.log(chalk.cyan(asciiArt));
    }
    console.log(chalk.yellow(`📢 ${message}`));
    console.log('');

    return notification;
  }

  async sendSuccess(message, asciiArt = null) {
    const notification = {
      id: Date.now().toString(),
      type: 'success',
      message,
      asciiArt,
      timestamp: new Date()
    };

    this.notifications.push(notification);

    // Display notification
    console.log(chalk.green('\n🎉 SUCCESS:'));
    if (asciiArt) {
      console.log(chalk.cyan(asciiArt));
    }
    console.log(chalk.green(`✅ ${message}`));
    console.log('');

    return notification;
  }

  async sendWelcome() {
    await this.sendSuccess(
      'Welcome to Spec Kit Assistant!',
      DogArt.party
    );
  }

  async getNotifications() {
    return this.notifications;
  }

  async clearNotifications() {
    this.notifications = [];
    console.log(chalk.gray('🗑️ Notifications cleared'));
  }
}

export default NotificationManager;