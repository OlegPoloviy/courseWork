export class ParserUtils {
  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static cleanText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  static isValidEquipmentName(name: string): boolean {
    return Boolean(
      name && name.length > 2 && !/^(test|example|sample)/i.test(name),
    );
  }

  static extractCountry(text: string): string {
    const countryMatch = text.match(/(?:from|in|by)\s+([A-Za-z\s]+)/i);
    return countryMatch ? countryMatch[1].trim() : 'Unknown';
  }

  static extractYear(text: string): number | undefined {
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? parseInt(yearMatch[0]) : undefined;
  }

  static normalizeImageUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `${baseUrl}${url}`;
    return `${baseUrl}/${url}`;
  }
}

export class ParserErrorHandler {
  handleError(error: Error): void {
    console.error('Parser error:', error.message);
  }
}

export class RetryableError extends Error {
  constructor(
    message: string,
    public source: string,
    public url: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'RetryableError';
  }
}
