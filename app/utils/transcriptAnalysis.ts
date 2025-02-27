import { Action } from '../services/api';

const actionTriggerPhrases = [
  'action item',
  'todo',
  'to do',
  'need to',
  'needs to',
  'should',
  'will',
  'must',
  'take action',
  'follow up',
  'follow-up',
];

const transcriptAnalysis = {
  extractActionItems(transcript: string): Partial<Action>[] {
    if (!transcript) return [];

    const sentences = transcript.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const actionItems: Partial<Action>[] = [];

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      // Check if sentence contains any action trigger phrases
      if (actionTriggerPhrases.some(phrase => lowerSentence.includes(phrase))) {
        // Remove common prefixes that might appear before the actual action
        const cleanedSentence = sentence
          .replace(/^(action item|todo|to do|we need to|we should|we will|we must):/i, '')
          .trim();

        // Basic priority detection based on keywords
        let priority: Action['priority'] = 'Medium';
        if (lowerSentence.includes('urgent') || 
            lowerSentence.includes('asap') || 
            lowerSentence.includes('important')) {
          priority = 'High';
        } else if (lowerSentence.includes('maybe') || 
                   lowerSentence.includes('consider') || 
                   lowerSentence.includes('could')) {
          priority = 'Low';
        }

        actionItems.push({
          title: cleanedSentence,
          priority,
          status: 'pending',
          notes: `Automatically extracted from meeting transcript`,
        });
      }
    });

    return actionItems;
  },
};

export default transcriptAnalysis;
