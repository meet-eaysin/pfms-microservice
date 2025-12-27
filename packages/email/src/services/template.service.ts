import Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

export class TemplateService {
  private readonly templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private templatePath: string;

  constructor(templatePath?: string) {
    this.templatePath =
      templatePath ?? path.join(process.cwd(), 'templates', 'email');
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Date(date).toLocaleDateString();
    });

    // Currency formatting helper
    Handlebars.registerHelper('formatCurrency', (amount: number, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount);
    });

    // Conditional helper
    Handlebars.registerHelper('ifEquals', function (this: unknown, arg1: unknown, arg2: unknown, options: Handlebars.HelperOptions) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });
  }

  /**
   * Load a template from file
   */
  private async loadTemplate(templateName: string): Promise<string> {
    const templateFile = path.join(this.templatePath, `${templateName}.hbs`);
    try {
      const content = await fs.readFile(templateFile, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Template '${templateName}' not found at ${templateFile}`);
    }
  }

  /**
   * Compile and cache a template
   */
  private async compileTemplate(
    templateName: string
  ): Promise<HandlebarsTemplateDelegate> {
    const cached = this.templateCache.get(templateName);
    if (cached) {
      return cached;
    }

    const templateContent = await this.loadTemplate(templateName);
    const compiled = Handlebars.compile(templateContent);
    this.templateCache.set(templateName, compiled);

    return compiled;
  }

  /**
   * Render a template with context data
   */
  async render(templateName: string, context: Record<string, unknown>): Promise<string> {
    this.registerHelpers();
    const template = await this.compileTemplate(templateName);
    return template(context);
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Set custom template path
   */
  setTemplatePath(templatePath: string): void {
    this.templatePath = templatePath;
    this.clearCache();
  }
}
