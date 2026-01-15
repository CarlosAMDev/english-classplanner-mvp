/**
 * ClassPlanner Scraper - Sistema de scraping para contenido educativo de inglés
 * 
 * Ejecuta múltiples scrapers y guarda los resultados en content.json
 * 
 * Uso:
 *   npm run scrape           - Ejecuta todos los scrapers
 *   node scraper/index.js    - Ejecuta directamente
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import BreakingNewsScraper from './scrapers/BreakingNewsScraper.js';
import BritishCouncilScraper from './scrapers/BritishCouncilScraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Ejecuta todos los scrapers con manejo de errores independiente
 * Si un scraper falla, los demás continúan ejecutándose
 */
async function runAll() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       ClassPlanner Content Scraper v1.0.0                   ║');
  console.log('║       Educational English Content Extraction                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const startTime = Date.now();
  const results = {
    metadata: {
      scrapedAt: new Date().toISOString(),
      version: '1.0.0',
      sources: [],
    },
    content: [],
  };

  // Lista de scrapers a ejecutar
  const scrapers = [
    { name: 'BreakingNewsEnglish', instance: new BreakingNewsScraper() },
    { name: 'BritishCouncil', instance: new BritishCouncilScraper() },
  ];

  // Ejecutar cada scraper de forma secuencial (para evitar sobrecarga)
  for (const { name, instance } of scrapers) {
    try {
      console.log(`\n🔍 Starting ${name} scraper...`);
      
      const data = await instance.run();
      
      if (data && Array.isArray(data) && data.length > 0) {
        results.content.push(...data);
        results.metadata.sources.push({
          name,
          status: 'success',
          itemsFound: data.length,
        });
        console.log(`✅ ${name}: Successfully scraped ${data.length} items`);
      } else if (data) {
        results.content.push(data);
        results.metadata.sources.push({
          name,
          status: 'success',
          itemsFound: 1,
        });
        console.log(`✅ ${name}: Successfully scraped 1 item`);
      } else {
        results.metadata.sources.push({
          name,
          status: 'no_data',
          itemsFound: 0,
        });
        console.log(`⚠️  ${name}: No data returned`);
      }
    } catch (error) {
      console.error(`❌ ${name} failed: ${error.message}`);
      results.metadata.sources.push({
        name,
        status: 'error',
        error: error.message,
        itemsFound: 0,
      });
      // Continuar con el siguiente scraper
    }
  }

  // Calcular estadísticas
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  results.metadata.duration = `${duration}s`;
  results.metadata.totalItems = results.content.length;

  // Guardar resultados en archivo
  const outputPath = path.join(__dirname, 'content.json');
  
  try {
    await fs.writeFile(
      outputPath,
      JSON.stringify(results, null, 2),
      'utf-8'
    );
    console.log(`\n📁 Results saved to: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error saving results: ${error.message}`);
  }

  // Resumen final
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      SCRAPING SUMMARY                       ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Total items scraped: ${String(results.content.length).padEnd(35)}║`);
  console.log(`║  Duration: ${String(duration + 's').padEnd(46)}║`);
  console.log(`║  Sources processed: ${String(scrapers.length).padEnd(36)}║`);
  console.log('╠════════════════════════════════════════════════════════════╣');
  
  for (const source of results.metadata.sources) {
    const status = source.status === 'success' ? '✅' : source.status === 'error' ? '❌' : '⚠️';
    const line = `  ${status} ${source.name}: ${source.itemsFound} items`;
    console.log(`║${line.padEnd(59)}║`);
  }
  
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  return results;
}

/**
 * Ejecuta un scraper específico por nombre
 */
async function runSingle(scraperName) {
  const scraperMap = {
    'breaking': BreakingNewsScraper,
    'breakingnews': BreakingNewsScraper,
    'britishcouncil': BritishCouncilScraper,
    'british': BritishCouncilScraper,
    'bc': BritishCouncilScraper,
  };

  const ScraperClass = scraperMap[scraperName.toLowerCase()];
  
  if (!ScraperClass) {
    console.error(`Unknown scraper: ${scraperName}`);
    console.log('Available scrapers: breaking, britishcouncil');
    process.exit(1);
  }

  const scraper = new ScraperClass();
  const results = await scraper.run();
  
  // Guardar resultados
  const outputPath = path.join(__dirname, `content-${scraperName.toLowerCase()}.json`);
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n📁 Results saved to: ${outputPath}`);
  
  return results;
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length > 0 && args[0] !== '--all') {
  // Ejecutar scraper específico
  runSingle(args[0]).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} else {
  // Ejecutar todos los scrapers
  runAll().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runAll, runSingle };
