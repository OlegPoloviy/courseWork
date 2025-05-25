import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Browser, chromium } from 'playwright';
import { Logger } from '@nestjs/common';

@Injectable()
export class BrowserManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BrowserManagerService.name);
  private browser: Browser | null = null;

  async onModuleInit() {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
        ],
      });
      this.logger.log('🌐 Browser instance initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize browser: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.log('🌐 Browser instance closed');
    }
  }

  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }
    return this.browser;
  }

  async createPage() {
    const browser = await this.getBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (compatible; Equipment-Parser/1.0)',
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      javaScriptEnabled: true,
      bypassCSP: true,
    });

    // Block unnecessary resources
    await context.route(
      '**/*.{png,jpg,jpeg,gif,svg,css,font,woff,woff2,eot,ttf,otf}',
      (route) => route.abort(),
    );
    await context.route('**/analytics/**', (route) => route.abort());
    await context.route('**/tracking/**', (route) => route.abort());
    await context.route('**/ads/**', (route) => route.abort());

    const page = await context.newPage();

    // Set default timeout
    page.setDefaultTimeout(30000);

    // Add error handling
    page.on('pageerror', (err) => {
      // Only log errors that might affect our parsing
      if (
        !err.message.includes('permutive') &&
        !err.message.includes('Unexpected identifier')
      ) {
        this.logger.error(`Page error: ${err.message}`);
      }
    });

    // Handle console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // Only log errors that might affect our parsing
        if (
          !msg.text().includes('permutive') &&
          !msg.text().includes('Unexpected identifier')
        ) {
          this.logger.error(`Console error: ${msg.text()}`);
        }
      }
    });

    return { page, context };
  }
}
