/**
 * BaseScraper - Clase base para todos los scrapers
 * Gestiona headers, User-Agents aleatorios y retardos anti-detección
 */

import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

// Lista de User-Agents reales para rotación
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
];

class BaseScraper {
  constructor(name) {
    this.name = name;
    this.browser = null;
    this.context = null;
    this.minDelay = 2000; // Mínimo 2 segundos entre requests
    this.maxDelay = 5000; // Máximo 5 segundos entre requests
  }

  /**
   * Obtiene un User-Agent aleatorio
   */
  getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  /**
   * Sleep con tiempo aleatorio para evitar detección
   */
  async sleep(min = this.minDelay, max = this.maxDelay) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`[${this.name}] Waiting ${delay}ms...`);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Inicializa el navegador con configuración anti-detección
   */
  async initBrowser() {
    console.log(`[${this.name}] Initializing browser...`);
    
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ]
    });

    const userAgent = this.getRandomUserAgent();
    
    this.context = await this.browser.newContext({
      userAgent,
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      }
    });

    console.log(`[${this.name}] Browser initialized with UA: ${userAgent.substring(0, 50)}...`);
  }

  /**
   * Cierra el navegador de forma segura
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      console.log(`[${this.name}] Browser closed.`);
    }
  }

  /**
   * Navega a una URL y retorna el HTML parseado con Cheerio
   */
  async fetchPage(url) {
    if (!this.context) {
      await this.initBrowser();
    }

    console.log(`[${this.name}] Fetching: ${url}`);
    
    const page = await this.context.newPage();
    
    try {
      // Navegar con timeout y esperar a que cargue
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Esperar un poco para que cargue el contenido dinámico
      await page.waitForTimeout(1500);
      
      const html = await page.content();
      const $ = cheerio.load(html);
      
      await page.close();
      
      return $;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  /**
   * Método abstracto - debe ser implementado por las clases hijas
   */
  async scrape() {
    throw new Error('scrape() method must be implemented by subclass');
  }

  /**
   * Formatea el resultado en el formato JSON estándar
   */
  formatResult(data) {
    return {
      source: this.name,
      level: data.level || 'Unknown',
      title: data.title || 'Untitled',
      body: data.body || '',
      exercises: data.exercises || [],
      scrapedAt: new Date().toISOString(),
    };
  }

  /**
   * Ejecuta el scraping con manejo de errores
   */
  async run() {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`[${this.name}] Starting scraper...`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      await this.initBrowser();
      const results = await this.scrape();
      await this.closeBrowser();
      
      console.log(`[${this.name}] Completed successfully. Found ${Array.isArray(results) ? results.length : 1} item(s).`);
      return results;
    } catch (error) {
      console.error(`[${this.name}] Error: ${error.message}`);
      await this.closeBrowser();
      return null;
    }
  }
}

export default BaseScraper;
