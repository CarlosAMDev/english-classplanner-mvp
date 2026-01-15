/**
 * BreakingNewsScraper - Extrae artículos de Breaking News English
 * https://breakingnewsenglish.com
 * 
 * Extrae: artículo, nivel (0-6), vocabulario
 */

import BaseScraper from './BaseScraper.js';

class BreakingNewsScraper extends BaseScraper {
  constructor() {
    super('BreakingNewsEnglish');
    this.baseUrl = 'https://breakingnewsenglish.com';
  }

  /**
   * Obtiene los artículos más recientes de la página principal
   */
  async getLatestArticles(limit = 5) {
    const $ = await this.fetchPage(this.baseUrl);
    const articles = [];

    // Los artículos están en .lesson-excerpt article
    $('.lesson-excerpt').each((i, el) => {
      if (articles.length >= limit) return false;
      
      const article = $(el).find('article');
      const titleLink = article.find('header h3 a').first();
      const href = titleLink.attr('href');
      const title = titleLink.text().trim();
      
      // Obtener los niveles disponibles
      const levels = [];
      article.find('.lesson-levels a').each((j, levelEl) => {
        const levelHref = $(levelEl).attr('href');
        const levelText = $(levelEl).text().trim();
        if (levelHref && levelText) {
          levels.push({
            level: levelText,
            url: levelHref.startsWith('http') ? levelHref : `${this.baseUrl}/${levelHref}`,
          });
        }
      });

      // Obtener descripción breve
      const description = article.find('.content').text().trim();
      const difficulty = article.find('.smallfont').text().trim();

      if (href && title) {
        const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}/${href}`;
        
        articles.push({
          url: fullUrl,
          title,
          description,
          difficulty,
          levels,
        });
      }
    });

    console.log(`[${this.name}] Found ${articles.length} articles to scrape`);
    return articles;
  }

  /**
   * Extrae el contenido de un artículo específico
   */
  async scrapeArticle(articleInfo) {
    // Usar el primer nivel disponible o la URL principal
    const url = articleInfo.levels && articleInfo.levels.length > 0 
      ? articleInfo.levels[0].url 
      : articleInfo.url;
    
    const $ = await this.fetchPage(url);
    
    // Extraer título
    let title = articleInfo.title || 
                $('h1').first().text().trim() || 
                $('title').text().split('-')[0].trim() ||
                'Untitled Article';

    // Determinar el nivel desde la URL o los niveles disponibles
    let level = 'Unknown';
    const urlMatch = url.match(/-(\d)\.html$/);
    if (urlMatch) {
      level = `Level ${urlMatch[1]}`;
    } else if (articleInfo.levels && articleInfo.levels.length > 0) {
      level = articleInfo.levels[0].level;
    }

    // Extraer el cuerpo del artículo - buscar el texto principal
    let body = '';
    
    // Buscar párrafos con contenido sustancial
    const paragraphs = [];
    $('p').each((i, el) => {
      const text = $(el).text().trim();
      // Filtrar párrafos cortos, de navegación o con copyright
      if (text.length > 80 && 
          !text.includes('©') && 
          !text.includes('Click') &&
          !text.includes('Subscribe') &&
          !text.includes('Help this site') &&
          !text.toLowerCase().includes('copyright')) {
        paragraphs.push(text);
      }
    });
    
    body = paragraphs.join('\n\n');

    // Si el body es muy corto, intentar obtener de otras fuentes
    if (body.length < 200) {
      // Buscar en divs con contenido
      $('div').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 300 && text.length < 3000 && !text.includes('©')) {
          if (text.length > body.length) {
            body = text;
          }
        }
      });
    }

    // Extraer vocabulario - Breaking News tiene secciones de vocabulario
    const vocabulary = [];
    
    // Lista de palabras a ignorar (no son vocabulario educativo)
    const ignoreWords = [
      'level', 'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december',
      'sources', 'news', 'rssfeed', 'rss', 'feed', 'http', 'www', 'com',
      'org', 'net', 'esl', 'efl', 'pdf', 'mp3', 'quiz', 'quizzes',
      'easier', 'harder', 'buy', 'click', 'subscribe', 'copyright',
      'help', 'home', 'back', 'next', 'previous', 'facebook', 'twitter',
      'linkedin', 'email', 'share', 'print', 'download',
    ];

    // Buscar palabras en negrita que suelen ser vocabulario clave
    $('strong, b').each((i, el) => {
      const word = $(el).text().trim();
      const lowerWord = word.toLowerCase();
      
      // Filtrar palabras válidas
      if (word.length > 2 && 
          word.length < 25 && 
          !/^\d/.test(word) &&
          !/^\$/.test(word) &&
          !word.includes('.com') &&
          !word.includes('.org') &&
          !word.includes('$') &&
          !ignoreWords.some(iw => lowerWord.includes(iw)) &&
          word.split(' ').length <= 2) {
        // Evitar duplicados
        if (!vocabulary.find(v => v.word.toLowerCase() === lowerWord)) {
          vocabulary.push({ 
            word, 
            definition: '' 
          });
        }
      }
    });

    // Buscar tablas de vocabulario (común en Breaking News)
    $('table tr').each((i, el) => {
      const cells = $(el).find('td');
      if (cells.length >= 2) {
        const word = $(cells[0]).text().trim();
        const definition = $(cells[1]).text().trim();
        if (word && definition && word.length < 30) {
          vocabulary.push({ word, definition });
        }
      }
    });

    return this.formatResult({
      title: title.trim(),
      level,
      body: body.substring(0, 5000),
      exercises: vocabulary.slice(0, 20).map(v => ({
        type: 'vocabulary',
        word: v.word,
        definition: v.definition,
      })),
    });
  }

  /**
   * Ejecuta el scraping completo
   */
  async scrape() {
    const articles = await this.getLatestArticles(3);
    const results = [];

    for (const article of articles) {
      try {
        await this.sleep();
        const data = await this.scrapeArticle(article);
        data.url = article.url;
        data.availableLevels = article.levels;
        data.description = article.description;
        results.push(data);
      } catch (error) {
        console.error(`[${this.name}] Error scraping ${article.url}: ${error.message}`);
      }
    }

    return results;
  }
}

export default BreakingNewsScraper;
