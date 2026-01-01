import type { Property } from '@/lib/types';

export interface ScamFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  score: number;
}

export interface ScamAnalysis {
  score: number; // 0-1, higher = more likely scam
  flags: ScamFlag[];
  riskLevel: 'safe' | 'low' | 'medium' | 'high';
}

// Cape Town average rent prices by area (approximate, in ZAR)
const AREA_AVERAGE_PRICES: Record<string, { min: number; max: number }> = {
  'cape town cbd': { min: 8000, max: 25000 },
  'sea point': { min: 10000, max: 35000 },
  'green point': { min: 10000, max: 30000 },
  'camps bay': { min: 15000, max: 60000 },
  'clifton': { min: 20000, max: 100000 },
  'observatory': { min: 6000, max: 15000 },
  'woodstock': { min: 7000, max: 18000 },
  'salt river': { min: 5000, max: 12000 },
  'rondebosch': { min: 8000, max: 20000 },
  'claremont': { min: 9000, max: 22000 },
  'kenilworth': { min: 8000, max: 18000 },
  'newlands': { min: 10000, max: 25000 },
  'constantia': { min: 15000, max: 45000 },
  'hout bay': { min: 10000, max: 35000 },
  'muizenberg': { min: 6000, max: 15000 },
  'kalk bay': { min: 8000, max: 20000 },
  'fish hoek': { min: 6000, max: 14000 },
  'simons town': { min: 7000, max: 16000 },
  'milnerton': { min: 8000, max: 18000 },
  'table view': { min: 7000, max: 16000 },
  'blouberg': { min: 8000, max: 20000 },
  'bellville': { min: 5000, max: 12000 },
  'durbanville': { min: 8000, max: 18000 },
  'stellenbosch': { min: 6000, max: 20000 },
  'default': { min: 5000, max: 30000 },
};

// Suspicious keywords and phrases
const SCAM_KEYWORDS = [
  'send deposit',
  'western union',
  'moneygram',
  'wire transfer',
  'overseas',
  'abroad',
  'urgently',
  'first come first serve',
  'no viewing',
  'send money',
  'pay before viewing',
  'key collection',
  'landlord abroad',
  'urgent rental',
  'missionary',
  'inheritance',
];

// Legitimate agency names (sample)
const KNOWN_AGENCIES = [
  'pam golding',
  'seeff',
  'rawson',
  'lew geffen',
  'remax',
  're/max',
  'chas everitt',
  'just property',
  'jawitz',
  'harcourts',
  'engel & völkers',
];

export class ScamDetector {
  // Analyze a property listing for potential scam indicators
  analyze(property: Property): ScamAnalysis {
    const flags: ScamFlag[] = [];
    let totalScore = 0;

    // 1. Price Analysis
    const priceFlag = this.checkPrice(property);
    if (priceFlag) {
      flags.push(priceFlag);
      totalScore += priceFlag.score;
    }

    // 2. Description Analysis
    const descriptionFlags = this.checkDescription(property);
    flags.push(...descriptionFlags);
    totalScore += descriptionFlags.reduce((sum, f) => sum + f.score, 0);

    // 3. Contact Information Analysis
    const contactFlags = this.checkContactInfo(property);
    flags.push(...contactFlags);
    totalScore += contactFlags.reduce((sum, f) => sum + f.score, 0);

    // 4. Image Analysis
    const imageFlag = this.checkImages(property);
    if (imageFlag) {
      flags.push(imageFlag);
      totalScore += imageFlag.score;
    }

    // 5. Agency Verification
    const agencyFlag = this.checkAgency(property);
    if (agencyFlag) {
      flags.push(agencyFlag);
      totalScore += agencyFlag.score;
    }

    // Normalize score to 0-1 range
    const normalizedScore = Math.min(1, totalScore);

    return {
      score: normalizedScore,
      flags,
      riskLevel: this.getRiskLevel(normalizedScore),
    };
  }

  // Check if price is suspiciously low
  private checkPrice(property: Property): ScamFlag | null {
    const suburb = property.suburb.toLowerCase();
    const priceRange = AREA_AVERAGE_PRICES[suburb] || AREA_AVERAGE_PRICES['default'];
    
    // Price is suspiciously low (less than 40% of minimum)
    if (property.price < priceRange.min * 0.4) {
      return {
        type: 'suspicious_price',
        severity: 'high',
        description: `Price is unusually low for ${property.suburb}. Market average starts at R${priceRange.min.toLocaleString()}.`,
        score: 0.35,
      };
    }

    // Price is somewhat low (40-60% of minimum)
    if (property.price < priceRange.min * 0.6) {
      return {
        type: 'low_price',
        severity: 'medium',
        description: `Price is below average for ${property.suburb}. Verify listing authenticity.`,
        score: 0.15,
      };
    }

    return null;
  }

  // Check description for scam keywords
  private checkDescription(property: Property): ScamFlag[] {
    const flags: ScamFlag[] = [];
    const description = (property.description || '').toLowerCase();
    const title = property.title.toLowerCase();
    const combinedText = `${title} ${description}`;

    // Check for scam keywords
    for (const keyword of SCAM_KEYWORDS) {
      if (combinedText.includes(keyword)) {
        flags.push({
          type: 'suspicious_keyword',
          severity: 'high',
          description: `Contains suspicious phrase: "${keyword}"`,
          score: 0.25,
        });
      }
    }

    // Check for too-good-to-be-true claims
    if (combinedText.includes('all bills included') && property.price < 5000) {
      flags.push({
        type: 'unrealistic_offer',
        severity: 'medium',
        description: 'Claims all bills included at an unusually low price',
        score: 0.15,
      });
    }

    // Check for vague or short description
    if (description.length < 50 && property.price > 10000) {
      flags.push({
        type: 'vague_description',
        severity: 'low',
        description: 'Description is unusually short for this price range',
        score: 0.1,
      });
    }

    return flags;
  }

  // Check contact information
  private checkContactInfo(property: Property): ScamFlag[] {
    const flags: ScamFlag[] = [];

    // No contact information at all
    if (!property.agent_phone && !property.agent_email && !property.agent_name) {
      flags.push({
        type: 'missing_contact',
        severity: 'medium',
        description: 'No contact information provided',
        score: 0.2,
      });
    }

    // Check for international phone numbers (potential red flag)
    if (property.agent_phone) {
      const phone = property.agent_phone.replace(/\s/g, '');
      if (phone.startsWith('+') && !phone.startsWith('+27')) {
        flags.push({
          type: 'international_phone',
          severity: 'medium',
          description: 'Contact number appears to be from outside South Africa',
          score: 0.2,
        });
      }
    }

    // Check for free email providers (potential red flag for "agents")
    if (property.agent_email) {
      const freeEmails = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const emailDomain = property.agent_email.split('@')[1]?.toLowerCase();
      
      if (freeEmails.includes(emailDomain) && property.agency_name) {
        flags.push({
          type: 'personal_email',
          severity: 'low',
          description: 'Agent using personal email despite claiming agency affiliation',
          score: 0.1,
        });
      }
    }

    return flags;
  }

  // Check images
  private checkImages(property: Property): ScamFlag | null {
    // No images
    if (!property.images || property.images.length === 0) {
      return {
        type: 'no_images',
        severity: 'medium',
        description: 'No photos provided',
        score: 0.15,
      };
    }

    // Only one image
    if (property.images.length === 1) {
      return {
        type: 'few_images',
        severity: 'low',
        description: 'Only one photo provided',
        score: 0.05,
      };
    }

    return null;
  }

  // Check agency legitimacy
  private checkAgency(property: Property): ScamFlag | null {
    if (!property.agency_name) {
      return null;
    }

    const agencyLower = property.agency_name.toLowerCase();
    const isKnownAgency = KNOWN_AGENCIES.some(known => agencyLower.includes(known));

    if (!isKnownAgency) {
      return {
        type: 'unknown_agency',
        severity: 'low',
        description: 'Agency not in our verified list. Not necessarily a scam, but verify independently.',
        score: 0.05,
      };
    }

    // Known agency - slight trust bonus (negative flag)
    return null;
  }

  // Convert score to risk level
  private getRiskLevel(score: number): 'safe' | 'low' | 'medium' | 'high' {
    if (score < 0.15) return 'safe';
    if (score < 0.35) return 'low';
    if (score < 0.6) return 'medium';
    return 'high';
  }
}

// Singleton instance
export const scamDetector = new ScamDetector();

