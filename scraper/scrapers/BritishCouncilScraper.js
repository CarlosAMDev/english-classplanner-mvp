/**
 * BritishCouncilScraper - Extrae materiales de lectura del British Council
 * https://learnenglish.britishcouncil.org
 * 
 * Extrae: texto, nivel (A1-C2), preguntas de comprensión
 * 
 * NOTA: Este sitio tiene protección anti-bot. El scraper intenta
 * múltiples estrategias para obtener el contenido.
 */

import BaseScraper from './BaseScraper.js';

class BritishCouncilScraper extends BaseScraper {
  constructor() {
    super('BritishCouncil');
    this.baseUrl = 'https://learnenglish.britishcouncil.org';
    // URLs directas a secciones de lectura por nivel
    this.levelUrls = {
      'A1': `${this.baseUrl}/skills/reading/a1-reading`,
      'A2': `${this.baseUrl}/skills/reading/a2-reading`,
      'B1': `${this.baseUrl}/skills/reading/b1-reading`,
      'B2': `${this.baseUrl}/skills/reading/b2-reading`,
      'C1': `${this.baseUrl}/skills/reading/c1-reading`,
    };
    // Aumentar delays para evitar bloqueos
    this.minDelay = 3000;
    this.maxDelay = 6000;
  }

  /**
   * Mapea niveles CEFR
   */
  normalizeLevel(levelText) {
    if (!levelText) return 'Unknown';
    
    const lower = levelText.toLowerCase().trim();
    
    // Buscar patrón A1, B2, etc.
    const cefrMatch = lower.match(/([abc][12])/i);
    if (cefrMatch) {
      return cefrMatch[1].toUpperCase();
    }

    const levelMap = {
      'beginner': 'A1',
      'elementary': 'A2',
      'pre-intermediate': 'B1',
      'intermediate': 'B1',
      'upper-intermediate': 'B2',
      'upper intermediate': 'B2',
      'advanced': 'C1',
    };

    for (const [key, value] of Object.entries(levelMap)) {
      if (lower.includes(key)) {
        return value;
      }
    }

    return levelText || 'Unknown';
  }

  /**
   * Obtiene la lista de artículos de lectura
   */
  async getReadingArticles(limit = 5) {
    const articles = [];
    
    // Intentar obtener artículos de cada nivel
    for (const [level, url] of Object.entries(this.levelUrls)) {
      if (articles.length >= limit) break;
      
      try {
        console.log(`[${this.name}] Fetching ${level} reading articles...`);
        const $ = await this.fetchPage(url);
        await this.sleep(1000, 2000);

        // Buscar enlaces a artículos individuales
        // British Council usa diferentes estructuras según la página
        const selectors = [
          'a[href*="/reading/"][href*="-reading/"]',
          '.node-teaser a',
          '.views-row a',
          'article a',
          '.content a[href*="reading"]',
        ];

        for (const selector of selectors) {
          $(selector).each((i, el) => {
            if (articles.length >= limit) return false;

            const href = $(el).attr('href');
            const text = $(el).text().trim();

            // Filtrar solo artículos válidos
            if (href && text && 
                text.length > 5 && 
                text.length < 150 &&
                !text.toLowerCase().includes('next') &&
                !text.toLowerCase().includes('previous') &&
                !text.toLowerCase().includes('home') &&
                !text.toLowerCase().includes('back')) {
              
              let fullUrl = href;
              if (!href.startsWith('http')) {
                fullUrl = href.startsWith('/') ? `${this.baseUrl}${href}` : `${this.baseUrl}/${href}`;
              }

              // Evitar duplicados y URLs de navegación
              if (!articles.find(a => a.url === fullUrl) && 
                  fullUrl.includes('/reading/') &&
                  !fullUrl.endsWith('/reading') &&
                  !fullUrl.endsWith('-reading')) {
                articles.push({
                  url: fullUrl,
                  title: text.substring(0, 100),
                  level: level,
                });
              }
            }
          });

          if (articles.length > 0) break;
        }
      } catch (error) {
        console.log(`[${this.name}] Could not fetch ${level} articles: ${error.message}`);
      }
    }

    // Si no encontramos artículos en las secciones por nivel,
    // usar URLs conocidas como fallback
    if (articles.length === 0) {
      console.log(`[${this.name}] Using fallback URLs...`);
      articles.push(
        {
          url: `${this.baseUrl}/skills/reading/a2-reading/a-message-to-a-new-colleague`,
          title: 'A message to a new colleague',
          level: 'A2',
        },
        {
          url: `${this.baseUrl}/skills/reading/b1-reading/an-email-from-a-friend`,
          title: 'An email from a friend',
          level: 'B1',
        },
        {
          url: `${this.baseUrl}/skills/reading/a1-reading/business-cards`,
          title: 'Business cards',
          level: 'A1',
        }
      );
    }

    console.log(`[${this.name}] Found ${articles.length} reading articles`);
    return articles.slice(0, limit);
  }

  /**
   * Extrae el contenido de un artículo específico
   */
  async scrapeArticle(articleInfo) {
    const $ = await this.fetchPage(articleInfo.url);

    // Extraer título
    let title = $('h1').first().text().trim() ||
                $('.page-title').text().trim() ||
                $('title').text().split('|')[0].trim() ||
                articleInfo.title ||
                'Untitled Reading';

    // Detectar si el acceso fue bloqueado
    if (title.toLowerCase().includes('access denied') || 
        title.toLowerCase().includes('blocked') ||
        title.toLowerCase().includes('forbidden')) {
      console.log(`[${this.name}] Access blocked for: ${articleInfo.url}`);
      return this.formatResult({
        title: articleInfo.title || 'Access Blocked',
        level: articleInfo.level || 'Unknown',
        body: '[BLOCKED] British Council has anti-bot protection. Consider using their official API or manual access.',
        exercises: [],
        blocked: true,
      });
    }

    // Usar el nivel de la info del artículo o detectar
    let level = articleInfo.level || 'Unknown';
    
    if (level === 'Unknown') {
      // Buscar en la URL
      const urlLevel = articleInfo.url.match(/([abc][12])/i);
      if (urlLevel) {
        level = urlLevel[1].toUpperCase();
      }
    }

    // Extraer el cuerpo del texto
    let body = '';
    
    // British Council tiene el contenido en varios contenedores posibles
    const contentSelectors = [
      '.field--name-body p',
      '.field--type-text-with-summary p',
      '.node__content p',
      '.article-body p',
      '.reading-text p',
      '.text-long p',
      'article p',
      '.content p',
    ];

    for (const selector of contentSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        const texts = elements.map((i, el) => {
          const text = $(el).text().trim();
          // Filtrar párrafos muy cortos o de UI
          if (text.length > 30 && 
              !text.includes('Log in') &&
              !text.includes('Sign up') &&
              !text.includes('©')) {
            return text;
          }
          return null;
        }).get().filter(Boolean);
        
        if (texts.length > 0) {
          body = texts.join('\n\n');
          break;
        }
      }
    }

    // Fallback: obtener todo el texto del main content
    if (body.length < 100) {
      const mainContent = $('main, .main-content, #main-content, article').first();
      if (mainContent.length) {
        body = mainContent.find('p').map((i, el) => $(el).text().trim())
          .get()
          .filter(t => t.length > 30)
          .join('\n\n');
      }
    }

    // Extraer ejercicios/preguntas de comprensión
    const exercises = [];
    
    // Buscar preguntas de quiz
    const questionSelectors = [
      '.quiz-question',
      '.question-text',
      '.task-item',
      'form .form-item',
      '.field--name-field-task',
      '[data-drupal-selector*="question"]',
    ];

    for (const selector of questionSelectors) {
      $(selector).each((i, el) => {
        const questionText = $(el).text().trim();
        
        if (questionText.length > 10 && questionText.length < 500) {
          // Buscar opciones
          const options = [];
          $(el).find('input[type="radio"] + label, .option, li').each((j, opt) => {
            const optText = $(opt).text().trim();
            if (optText && optText.length < 200) {
              options.push(optText);
            }
          });

          exercises.push({
            type: 'comprehension',
            question: questionText.split('\n')[0].trim().substring(0, 200),
            options: options.slice(0, 4),
          });
        }
      });

      if (exercises.length > 0) break;
    }

    // Buscar instrucciones de tareas
    if (exercises.length === 0) {
      $('.task, .exercise, [class*="task"]').each((i, el) => {
        const instruction = $(el).find('h2, h3, .task-title').first().text().trim();
        const content = $(el).find('p').first().text().trim();
        
        if (instruction || content) {
          exercises.push({
            type: 'task',
            instruction: instruction || 'Reading Task',
            description: content.substring(0, 300),
          });
        }
      });
    }

    return this.formatResult({
      title: title.trim(),
      level,
      body: body.substring(0, 5000),
      exercises: exercises.slice(0, 10),
    });
  }

  /**
   * Ejecuta el scraping completo
   */
  async scrape() {
    const articles = await this.getReadingArticles(3);
    const results = [];

    for (const article of articles) {
      try {
        await this.sleep();
        const data = await this.scrapeArticle(article);
        data.url = article.url;
        results.push(data);
      } catch (error) {
        console.error(`[${this.name}] Error scraping ${article.url}: ${error.message}`);
      }
    }

    return results;
  }
}

export default BritishCouncilScraper;
