/**
 * Deterministic Matching Engine for Campus Lost & Found
 * 
 * Rules and Weighted Scoring (Max 100 pts):
 * 1. Opposite Item Type (Hard constraint: Lost <-> Found)
 * 2. Category Match: +35 points
 * 3. Location Proximity:
 *    - Exact campus location: +25 points
 *    - Nearby campus zone: +15 points
 * 4. Date Proximity:
 *    - Within 1 day: +20 points
 *    - Within 3 days: +15 points
 *    - Within 7 days: +10 points
 *    - Within 14 days: +5 points
 * 5. Title & Description Keyword Overlap (Stopword filtered):
 *    - 3+ shared keywords: +20 points
 *    - 2 shared keywords: +14 points
 *    - 1 shared keyword: +8 points
 * 
 * Minimum score threshold: 25 points.
 * Fully deterministic, inspectable, and reproducible without external APIs or ML.
 */

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', 'did', 'do', 'does', 'doing', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
  'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i',
  'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she',
  'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
  'yours', 'yourself', 'yourselves', 'lost', 'found', 'please', 'help', 'item', 'items'
]);

// Campus geographical zones for nearby location heuristics
const LOCATION_ZONES = [
  { name: 'Core Academic & Library', locations: ['Main Library', 'Student Center', 'Dining Commons', 'North Campus Quad'] },
  { name: 'Science & Technology', locations: ['Science & Engineering Complex', 'Computer Science Lab'] },
  { name: 'Residential & Sports', locations: ['Dormitory Hall', 'Athletics & Gymnasium'] },
  { name: 'Public Assembly & Transit', locations: ['Auditorium', 'Campus Bus Stop'] },
];

/**
 * Tokenize string into cleaned lowercase keyword set
 */
export function extractKeywords(text) {
  if (!text) return new Set();
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
  return new Set(words);
}

/**
 * Check if two locations share a campus zone
 */
function areLocationsNearby(loc1, loc2) {
  if (!loc1 || !loc2 || loc1 === loc2) return false;
  return LOCATION_ZONES.some(
    (zone) => zone.locations.includes(loc1) && zone.locations.includes(loc2)
  );
}

/**
 * Calculate match score and explanations between two items
 */
export function calculateMatchScore(sourceItem, candidateItem) {
  // Hard constraint: items must be of opposite types
  if (sourceItem.type === candidateItem.type) {
    return { score: 0, reasons: [] };
  }

  let score = 0;
  const reasons = [];

  // 1. Category comparison (up to 35 pts)
  if (sourceItem.category === candidateItem.category) {
    score += 35;
    reasons.push(`Same category: ${sourceItem.category}`);
  }

  // 2. Location comparison (up to 25 pts)
  if (sourceItem.campusLocation === candidateItem.campusLocation) {
    score += 25;
    reasons.push(`Exact location match: ${sourceItem.campusLocation}`);
  } else if (areLocationsNearby(sourceItem.campusLocation, candidateItem.campusLocation)) {
    score += 15;
    reasons.push(`Nearby campus location: ${candidateItem.campusLocation}`);
  }

  // 3. Date proximity comparison (up to 20 pts)
  if (sourceItem.eventDate && candidateItem.eventDate) {
    const d1 = new Date(sourceItem.eventDate).getTime();
    const d2 = new Date(candidateItem.eventDate).getTime();
    const diffHours = Math.abs(d1 - d2) / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffDays <= 1) {
      score += 20;
      reasons.push('Dates within 24 hours of each other');
    } else if (diffDays <= 3) {
      score += 15;
      reasons.push(`Dates within ${Math.ceil(diffDays)} days of each other`);
    } else if (diffDays <= 7) {
      score += 10;
      reasons.push(`Dates within 1 week of each other`);
    } else if (diffDays <= 14) {
      score += 5;
      reasons.push(`Dates within 2 weeks of each other`);
    }
  }

  // 4. Keyword overlap in Title and Description (up to 20 pts)
  const sourceText = `${sourceItem.title} ${sourceItem.description}`;
  const candidateText = `${candidateItem.title} ${candidateItem.description}`;
  const sourceKeywords = extractKeywords(sourceText);
  const candidateKeywords = extractKeywords(candidateText);

  const sharedKeywords = [];
  sourceKeywords.forEach((word) => {
    if (candidateKeywords.has(word)) {
      sharedKeywords.push(word);
    }
  });

  if (sharedKeywords.length >= 3) {
    score += 20;
    reasons.push(`High keyword overlap: "${sharedKeywords.slice(0, 3).join(', ')}"`);
  } else if (sharedKeywords.length === 2) {
    score += 14;
    reasons.push(`Keywords in common: "${sharedKeywords.join(', ')}"`);
  } else if (sharedKeywords.length === 1) {
    score += 8;
    reasons.push(`Shared keyword: "${sharedKeywords[0]}"`);
  }

  // Cap at 100
  score = Math.min(score, 100);

  return {
    score,
    reasons,
  };
}

/**
 * Rank candidates for a given target item
 */
export function rankMatches(targetItem, candidates, minScore = 25) {
  const matches = [];

  for (const candidate of candidates) {
    // Avoid matching with self or same owner
    if (
      candidate._id.toString() === targetItem._id.toString() ||
      candidate.owner.toString() === targetItem.owner.toString()
    ) {
      continue;
    }

    const { score, reasons } = calculateMatchScore(targetItem, candidate);
    if (score >= minScore) {
      matches.push({
        item: candidate,
        score,
        reasons,
      });
    }
  }

  // Sort descending by score
  matches.sort((a, b) => b.score - a.score);
  return matches;
}
