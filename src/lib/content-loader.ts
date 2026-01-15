/**
 * Content Loader - Loads scraped educational content for lesson plans
 * 
 * This module reads content from the scraper's output and provides
 * it to the AI generator for creating lesson plans with real materials.
 */

import fs from 'fs';
import path from 'path';

/**
 * Scraped content item structure
 */
export interface ScrapedContent {
  source: string;
  level: string;
  title: string;
  body: string;
  description?: string;
  url?: string;
  exercises?: Array<{
    type: string;
    word?: string;
    definition?: string;
    question?: string;
    options?: string[];
  }>;
  availableLevels?: Array<{
    level: string;
    url: string;
  }>;
  scrapedAt: string;
  blocked?: boolean;
}

/**
 * Full scraped content file structure
 */
export interface ScrapedContentFile {
  metadata: {
    scrapedAt: string;
    version: string;
    sources: Array<{
      name: string;
      status: string;
      itemsFound: number;
    }>;
    duration: string;
    totalItems: number;
  };
  content: ScrapedContent[];
}

/**
 * Maps Breaking News English levels (0-6) to CEFR levels
 */
function mapBNELevelToCEFR(level: string): string {
  const levelNum = parseInt(level.replace(/\D/g, ''));
  
  if (isNaN(levelNum)) return level;
  
  // Breaking News levels 0-6 mapping to CEFR
  if (levelNum <= 1) return 'A1';
  if (levelNum === 2) return 'A2';
  if (levelNum === 3) return 'B1';
  if (levelNum === 4) return 'B1';
  if (levelNum === 5) return 'B2';
  if (levelNum >= 6) return 'C1';
  
  return level;
}

/**
 * Normalizes level to CEFR format
 */
export function normalizeToCEFR(level: string): string {
  if (!level) return 'Unknown';
  
  // Already CEFR format
  if (/^[ABC][12]$/i.test(level)) {
    return level.toUpperCase();
  }
  
  // Breaking News English format
  if (level.toLowerCase().includes('level')) {
    return mapBNELevelToCEFR(level);
  }
  
  return level;
}

/**
 * Gets the path to the scraped content file
 */
function getContentFilePath(): string {
  return path.join(process.cwd(), 'scraper', 'content.json');
}

/**
 * Loads all scraped content from the content.json file
 */
export function loadScrapedContent(): ScrapedContentFile | null {
  try {
    const filePath = getContentFilePath();
    
    if (!fs.existsSync(filePath)) {
      console.log('No scraped content file found at:', filePath);
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: ScrapedContentFile = JSON.parse(fileContent);
    
    console.log(`Loaded ${data.content.length} scraped items from ${data.metadata.sources.length} sources`);
    
    return data;
  } catch (error) {
    console.error('Error loading scraped content:', error);
    return null;
  }
}

/**
 * Gets valid content items (non-blocked, with body content)
 */
export function getValidContent(data: ScrapedContentFile): ScrapedContent[] {
  return data.content.filter(item => 
    !item.blocked && 
    item.body && 
    item.body.length > 100 &&
    !item.body.includes('[BLOCKED]') &&
    !item.title.toLowerCase().includes('access denied')
  );
}

/**
 * Filters content by CEFR level
 */
export function filterByLevel(content: ScrapedContent[], targetLevel: string): ScrapedContent[] {
  const normalizedTarget = normalizeToCEFR(targetLevel);
  
  return content.filter(item => {
    const itemLevel = normalizeToCEFR(item.level);
    return itemLevel === normalizedTarget;
  });
}

/**
 * Filters content by approximate level (same or adjacent level)
 */
export function filterByApproximateLevel(content: ScrapedContent[], targetLevel: string): ScrapedContent[] {
  const normalizedTarget = normalizeToCEFR(targetLevel);
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const targetIndex = levelOrder.indexOf(normalizedTarget);
  
  if (targetIndex === -1) return content;
  
  // Include same level and adjacent levels
  const validLevels = new Set<string>();
  validLevels.add(normalizedTarget);
  if (targetIndex > 0) validLevels.add(levelOrder[targetIndex - 1]);
  if (targetIndex < levelOrder.length - 1) validLevels.add(levelOrder[targetIndex + 1]);
  
  return content.filter(item => {
    const itemLevel = normalizeToCEFR(item.level);
    return validLevels.has(itemLevel);
  });
}

/**
 * Gets the best matching content for lesson parameters
 */
export function getBestContentForLesson(
  targetLevel: string,
  topic?: string
): ScrapedContent | null {
  const data = loadScrapedContent();
  
  if (!data) return null;
  
  let validContent = getValidContent(data);
  
  if (validContent.length === 0) {
    console.log('No valid content available');
    return null;
  }
  
  // Try exact level match first
  let filtered = filterByLevel(validContent, targetLevel);
  
  // If no exact match, try approximate level
  if (filtered.length === 0) {
    filtered = filterByApproximateLevel(validContent, targetLevel);
  }
  
  // If still nothing, use any available content
  if (filtered.length === 0) {
    filtered = validContent;
  }
  
  // If topic is provided, try to find relevant content
  if (topic && filtered.length > 1) {
    const topicLower = topic.toLowerCase();
    const topicMatch = filtered.find(item => 
      item.title.toLowerCase().includes(topicLower) ||
      item.body.toLowerCase().includes(topicLower) ||
      (item.description && item.description.toLowerCase().includes(topicLower))
    );
    
    if (topicMatch) return topicMatch;
  }
  
  // Return random item from filtered content
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Gets all available content for a level
 */
export function getAllContentForLevel(targetLevel: string): ScrapedContent[] {
  const data = loadScrapedContent();
  
  if (!data) return [];
  
  const validContent = getValidContent(data);
  return filterByApproximateLevel(validContent, targetLevel);
}

/**
 * Formats scraped content for use in AI prompt
 */
export function formatContentForPrompt(content: ScrapedContent): string {
  const cefrLevel = normalizeToCEFR(content.level);
  
  let formatted = `
=== AUTHENTIC TEACHING MATERIAL ===
Source: ${content.source}
Level: ${cefrLevel}
Title: ${content.title}

ARTICLE TEXT:
${content.body.substring(0, 2000)}
`;

  // Add vocabulary if available
  if (content.exercises && content.exercises.length > 0) {
    const vocabItems = content.exercises
      .filter(e => e.type === 'vocabulary' && e.word)
      .slice(0, 10);
    
    if (vocabItems.length > 0) {
      formatted += `
KEY VOCABULARY:
${vocabItems.map(v => `- ${v.word}${v.definition ? `: ${v.definition}` : ''}`).join('\n')}
`;
    }
  }

  // Add description if available
  if (content.description) {
    formatted += `
BRIEF SUMMARY:
${content.description}
`;
  }

  return formatted;
}

/**
 * Checks if scraped content is available and recent
 */
export function isContentAvailable(): { available: boolean; itemCount: number; lastScraped: string | null } {
  const data = loadScrapedContent();
  
  if (!data) {
    return { available: false, itemCount: 0, lastScraped: null };
  }
  
  const validContent = getValidContent(data);
  
  return {
    available: validContent.length > 0,
    itemCount: validContent.length,
    lastScraped: data.metadata.scrapedAt,
  };
}
