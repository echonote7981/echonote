import { Action } from '../services/api';

// Extend the Action type to include details
interface ExtendedAction extends Action {
  details?: string;
}

const actionTriggerPhrases = [
  'action item','todo','to do','need to','needs to','should','will','must','take action','follow up',
  'assign', 'resolve', 'confirm', 'update', 'approve', 'notify', 'implement', 'investigate', 'schedule', 
  'submit', 'draft', 'organize', 'execute', 'prepare', 'discuss', 'finalize', 'prioritize', 'review', 
  'verify', 'test', 'implement', 'address', 'reject', 'rework', 'complete', 'close', 'cancel', 'suspend',
  'evaluate', 'analyze', 'plan', 'coordinate', 'delegate', 'respond', 'clarify', 'review', 'initiate',
  'revise', 'track', 'set up', 'communicate', 'consolidate', 'verify', 'test', 'collaborate',
  'investigate', 'resolve', 'prioritize', 'initiate', 'revise', 'track', 'set up', 'communicate',
  'consolidate', 'verify', 'test', 'collaborate', 'investigate', 'resolve', 'prioritize', 'Confirm',
  'Troubleshoot', 'Design', 'Schedule', 'Research','Launch', 'Track','Update','Maintain', 'Collect', 
  'Review', 'Execute', 'Clarify','Adjust', 'Optimize', 'Finalize','Cross-check','Reconcile', 
];

// Capitalize first letter and proper nouns
const capitalize = (text: string): string => {
  return text.replace(/\b\w/g, char => char.toUpperCase());
};

// Extracts a concise title with proper capitalization
const extractTitle = (sentence: string): string => {
  const match = sentence.match(/(?:need to|should|must|will|shall)\s+(.*)/i);
  const title = match ? match[1].split(/,|\./)[0].trim() : sentence.split(/,|\./)[0].trim();
  return capitalize(title);
};

// Rephrases details to be more descriptive and comprehensive
const rephraseDetails = (sentence: string): string => {
  let details = sentence;
  const lowerSentence = sentence.toLowerCase();

  // Extract timing information
  let timeContext = '';
  if (lowerSentence.includes('today') || lowerSentence.includes('tomorrow') || 
      lowerSentence.includes('this week') || lowerSentence.includes('next week') ||
      lowerSentence.includes('by ') || lowerSentence.includes('before ') ||
      lowerSentence.includes('after ') || lowerSentence.includes(' on ')) {
    
    const timePatterns = [
      /by\s+([^,.]+)/i, 
      /before\s+([^,.]+)/i, 
      /after\s+([^,.]+)/i,
      /on\s+([^,.]+)/i,
      /this\s+([^,.]+)/i,
      /next\s+([^,.]+)/i,
      /today|tomorrow/i
    ];
    
    for (const pattern of timePatterns) {
      const match = sentence.match(pattern);
      if (match) {
        timeContext = match[0];
        break;
      }
    }
  }

  // Determine action type and generate more context
  let actionType = 'Task';
  if (lowerSentence.includes('follow up') || lowerSentence.includes('check')) {
    actionType = 'Follow-up';
  } else if (lowerSentence.includes('review') || lowerSentence.includes('evaluate')) {
    actionType = 'Review';
  } else if (lowerSentence.includes('discuss') || lowerSentence.includes('meeting')) {
    actionType = 'Discussion';
  } else if (lowerSentence.includes('prepare') || lowerSentence.includes('create')) {
    actionType = 'Preparation';
  } else if (lowerSentence.includes('decide') || lowerSentence.includes('finalize')) {
    actionType = 'Decision';
  }

  // Extract who is responsible (if mentioned)
  let responsible = '';
  const whoPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:will|should|needs to|has to|is going to)/i,
    /(?:assign|delegate)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ];
  
  for (const pattern of whoPatterns) {
    const match = sentence.match(pattern);
    if (match && match[1]) {
      responsible = match[1];
      break;
    }
  }

  // Combine everything into a comprehensive details field
  let detailsText = `${actionType}: ${details}`;
  
  if (responsible) {
    detailsText += `\n\nResponsible: ${responsible}`;
  }
  
  if (timeContext) {
    detailsText += `\n\nTimeframe: ${timeContext}`;
  }
  
  // Add any additional context based on the action type
  switch (actionType) {
    case 'Follow-up':
      detailsText += '\n\nThis requires following up to ensure completion or to get an update on progress.';
      break;
    case 'Review':
      detailsText += '\n\nThis requires reviewing or evaluating something before proceeding.';
      break;
    case 'Discussion':
      detailsText += '\n\nThis topic needs to be discussed further in a conversation or meeting.';
      break;
    case 'Decision':
      detailsText += '\n\nA decision needs to be made regarding this matter.';
      break;
  }

  return detailsText;
};

const transcriptAnalysis = {
  extractActionItems(transcript: string): Partial<ExtendedAction>[] {
    if (!transcript) return [];

    const sentences = transcript.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const actionItems: Partial<ExtendedAction>[] = [];

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();

      if (actionTriggerPhrases.some(phrase => lowerSentence.includes(phrase))) {
        const cleanedSentence = sentence
          .replace(/^(action item|todo|to do|we need to|we should|we will|we must):/i, '')
          .trim();

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
          title: extractTitle(cleanedSentence),
          details: rephraseDetails(cleanedSentence),
          priority,
          status: 'pending',
          notes: '',
        });
      }
    });

    return actionItems;
  },
};

export default transcriptAnalysis;
