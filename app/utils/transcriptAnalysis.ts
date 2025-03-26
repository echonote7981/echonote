// import { Action } from '../services/api';

// // Extend the Action type to include details
// interface ExtendedAction extends Action {
//   details?: string;
// }

// const actionTriggerPhrases = [
//   'action item','todo','to do','need to','needs to','should','will','must','take action','follow up',
//   'assign', 'resolve', 'confirm', 'update', 'approve', 'notify', 'implement', 'investigate', 'schedule', 
//   'submit', 'draft', 'organize', 'execute', 'prepare', 'discuss', 'finalize', 'prioritize', 'review', 
//   'verify', 'test', 'implement', 'address', 'reject', 'rework', 'complete', 'close', 'cancel', 'suspend',
//   'evaluate', 'analyze', 'plan', 'coordinate', 'delegate', 'respond', 'clarify', 'review', 'initiate',
//   'revise', 'track', 'set up', 'communicate', 'consolidate', 'verify', 'test', 'collaborate',
//   'investigate', 'resolve', 'prioritize', 'initiate', 'revise', 'track', 'set up', 'communicate',
//   'consolidate', 'verify', 'test', 'collaborate', 'investigate', 'resolve', 'prioritize', 'Confirm',
//   'Troubleshoot', 'Design', 'Schedule', 'Research','Launch', 'Track','Update','Maintain', 'Collect', 
//   'Review', 'Execute', 'Clarify','Adjust', 'Optimize', 'Finalize','Cross-check','Reconcile', 
// ];

// // Capitalize first letter and proper nouns
// const capitalize = (text: string): string => {
//   return text.replace(/\b\w/g, char => char.toUpperCase());
// };

// // Extracts a concise title with proper capitalization
// const extractTitle = (sentence: string): string => {
//   const match = sentence.match(/(?:need to|should|must|will|shall)\s+(.*)/i);
//   const title = match ? match[1].split(/,|\./)[0].trim() : sentence.split(/,|\./)[0].trim();
//   return capitalize(title);
// };

// // Rephrases details to be more descriptive and comprehensive
// const rephraseDetails = (sentence: string): string => {
//   let details = sentence;
//   const lowerSentence = sentence.toLowerCase();

//   // Extract timing information
//   let timeContext = '';
//   if (lowerSentence.includes('today') || lowerSentence.includes('tomorrow') || 
//       lowerSentence.includes('this week') || lowerSentence.includes('next week') ||
//       lowerSentence.includes('by ') || lowerSentence.includes('before ') ||
//       lowerSentence.includes('after ') || lowerSentence.includes(' on ')) {
    
//     const timePatterns = [
//       /by\s+([^,.]+)/i, 
//       /before\s+([^,.]+)/i, 
//       /after\s+([^,.]+)/i,
//       /on\s+([^,.]+)/i,
//       /this\s+([^,.]+)/i,
//       /next\s+([^,.]+)/i,
//       /today|tomorrow/i
//     ];
    
//     for (const pattern of timePatterns) {
//       const match = sentence.match(pattern);
//       if (match) {
//         timeContext = match[0];
//         break;
//       }
//     }
//   }

//   // Determine action type and generate more context
//   let actionType = 'Task';
//   if (lowerSentence.includes('follow up') || lowerSentence.includes('check')) {
//     actionType = 'Follow-up';
//   } else if (lowerSentence.includes('review') || lowerSentence.includes('evaluate')) {
//     actionType = 'Review';
//   } else if (lowerSentence.includes('discuss') || lowerSentence.includes('meeting')) {
//     actionType = 'Discussion';
//   } else if (lowerSentence.includes('prepare') || lowerSentence.includes('create')) {
//     actionType = 'Preparation';
//   } else if (lowerSentence.includes('decide') || lowerSentence.includes('finalize')) {
//     actionType = 'Decision';
//   }

//   // Extract who is responsible (if mentioned)
//   let responsible = '';
//   const whoPatterns = [
//     /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:will|should|needs to|has to|is going to)/i,
//     /(?:assign|delegate)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
//   ];
  
//   for (const pattern of whoPatterns) {
//     const match = sentence.match(pattern);
//     if (match && match[1]) {
//       responsible = match[1];
//       break;
//     }
//   }

//   // Combine everything into a comprehensive details field
//   let detailsText = `${actionType}: ${details}`;
  
//   if (responsible) {
//     detailsText += `\n\nResponsible: ${responsible}`;
//   }
  
//   if (timeContext) {
//     detailsText += `\n\nTimeframe: ${timeContext}`;
//   }
  
//   // Add any additional context based on the action type
//   switch (actionType) {
//     case 'Follow-up':
//       detailsText += '\n\nThis requires following up to ensure completion or to get an update on progress.';
//       break;
//     case 'Review':
//       detailsText += '\n\nThis requires reviewing or evaluating something before proceeding.';
//       break;
//     case 'Discussion':
//       detailsText += '\n\nThis topic needs to be discussed further in a conversation or meeting.';
//       break;
//     case 'Decision':
//       detailsText += '\n\nA decision needs to be made regarding this matter.';
//       break;
//   }

//   return detailsText;
// };

// const transcriptAnalysis = {
//   extractActionItems(transcript: string): Partial<ExtendedAction>[] {
//     if (!transcript) return [];

//     const sentences = transcript.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
//     const actionItems: Partial<ExtendedAction>[] = [];

//     sentences.forEach(sentence => {
//       const lowerSentence = sentence.toLowerCase();

//       if (actionTriggerPhrases.some(phrase => lowerSentence.includes(phrase))) {
//         const cleanedSentence = sentence
//           .replace(/^(action item|todo|to do|we need to|we should|we will|we must):/i, '')
//           .trim();

//         let priority: Action['priority'] = 'Medium';
//         if (lowerSentence.includes('urgent') || 
//             lowerSentence.includes('asap') || 
//             lowerSentence.includes('important')) {
//           priority = 'High';
//         } else if (lowerSentence.includes('maybe') || 
//                    lowerSentence.includes('consider') || 
//                    lowerSentence.includes('could')) {
//           priority = 'Low';
//         }

//         actionItems.push({
//           title: extractTitle(cleanedSentence),
//           details: rephraseDetails(cleanedSentence),
//           priority,
//           status: 'pending',
//           notes: '',
//         });
//       }
//     });

//     return actionItems;
//   },
// };

// export default transcriptAnalysis;
import { Action } from '../services/api';

// Extend the Action type to include details
interface ExtendedAction extends Action {
  details?: string;
}

// Refined list of action trigger phrases (more specific to explicit tasks)
const actionTriggerPhrases = [
  'action item', 'todo', 'to do', 'need to', 'needs to', 'should', 'must', 'will', 'assign', 
  'follow up', 'implement', 'schedule', 'submit', 'draft', 'execute', 'prepare', 'finalize', 
  'prioritize', 'review', 'complete', 'evaluate', 'plan', 'coordinate', 'delegate', 'respond', 
  'initiate', 'track', 'set up', 'collaborate', 'resolve', 'create', 'encourage', 'adopt'
];

// Key themes from your highlights to filter relevant actions
const keyThemes = [
  'grow', 'growth', 'mindset', 'mentor', 'environment', 'support', 'development', 
  'challenge', 'improve', 'collaboration', 'motivate', 'engage', 'openness', 'team', 
  'leader', 'leadership', 're-evaluate', 'process'
];

// Capitalize first letter and proper nouns
const capitalize = (text: string): string => {
  return text.replace(/\b\w/g, char => char.toUpperCase());
};

// Extracts a concise, specific title
const extractTitle = (sentence: string): string => {
  const match = sentence.match(/(?:need to|should|must|will|needs to)\s+(.*)/i);
  let title = match ? match[1].split(/,|\./)[0].trim() : sentence.split(/,|\./)[0].trim();
  
  // Avoid overly generic titles
  if (title.length < 10 || !keyThemes.some(theme => title.toLowerCase().includes(theme))) {
    title = sentence.split(' ').slice(0, 5).join(' ').trim(); // Fallback to first few words
  }
  return capitalize(title);
};

// Rephrases details with more context
const rephraseDetails = (sentence: string): string => {
  let details = sentence;
  const lowerSentence = sentence.toLowerCase();

  // Extract timing information
  let timeContext = '';
  const timePatterns = [
    /by\s+([^,.]+)/i, /before\s+([^,.]+)/i, /after\s+([^,.]+)/i, /on\s+([^,.]+)/i,
    /this\s+([^,.]+)/i, /next\s+([^,.]+)/i, /today|tomorrow/i
  ];
  for (const pattern of timePatterns) {
    const match = sentence.match(pattern);
    if (match) {
      timeContext = match[0];
      break;
    }
  }

  // Determine action type
  let actionType = 'Task';
  if (lowerSentence.includes('follow up')) actionType = 'Follow-up';
  else if (lowerSentence.includes('review') || lowerSentence.includes('evaluate')) actionType = 'Review';
  else if (lowerSentence.includes('discuss')) actionType = 'Discussion';
  else if (lowerSentence.includes('prepare') || lowerSentence.includes('create')) actionType = 'Preparation';
  else if (lowerSentence.includes('finalize') || lowerSentence.includes('adopt')) actionType = 'Decision';

  // Extract responsible party
  let responsible = '';
  const whoPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:will|should|needs to|has to)/i,
    /(?:assign|delegate)\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ];
  for (const pattern of whoPatterns) {
    const match = sentence.match(pattern);
    if (match && match[1]) {
      responsible = match[1];
      break;
    }
  }

  // Build detailed description
  let detailsText = `${actionType}: ${details}`;
  if (responsible) detailsText += `\n\nResponsible: ${responsible}`;
  if (timeContext) detailsText += `\n\nTimeframe: ${timeContext}`;

  // Add context based on action type
  switch (actionType) {
    case 'Follow-up':
      detailsText += '\n\nEnsure progress is tracked or updates are provided.';
      break;
    case 'Review':
      detailsText += '\n\nEvaluate before moving forward.';
      break;
    case 'Discussion':
      detailsText += '\n\nDiscuss in a meeting or with relevant stakeholders.';
      break;
    case 'Decision':
      detailsText += '\n\nRequires a final decision to proceed.';
      break;
  }

  return detailsText;
};

// Key phrases that indicate important information in a transcript
const highlightPhrases = [
  'important', 'critical', 'crucial', 'essential', 'key', 'significant', 'vital',
  'priority', 'focus', 'emphasize', 'highlight', 'note', 'remember', 'attention',
  'main point', 'takeaway', 'conclusion', 'summary', 'result', 'outcome',
  'decision', 'agreement', 'consensus', 'approved', 'finalized', 'confirmed',
  'deadline', 'target', 'goal', 'objective', 'milestone', 'achievement',
  'success', 'failure', 'challenge', 'obstacle', 'risk', 'issue', 'problem',
  'solution', 'strategy', 'plan', 'approach', 'method', 'technique',
  'specifically', 'particularly', 'notably', 'especially', 'primarily',
  'first', 'second', 'third', 'finally', 'lastly', 'in conclusion',
  'congratulate', 'thank', 'appreciate', 'recognize', 'acknowledge'
];

const transcriptAnalysis = {
  extractActionItems(transcript: string): Partial<ExtendedAction>[] {
    if (!transcript) return [];

    const sentences = transcript.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const actionItems: Partial<ExtendedAction>[] = [];

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();

      // Check for action trigger and thematic relevance
      const hasTrigger = actionTriggerPhrases.some(phrase => lowerSentence.includes(phrase));
      const hasTheme = keyThemes.some(theme => lowerSentence.includes(theme));

      if (hasTrigger && hasTheme) {
        const cleanedSentence = sentence
          .replace(/^(action item|todo|to do|we need to|we should|we will|we must):/i, '')
          .trim();

        // Set priority based on urgency cues
        let priority: Action['priority'] = 'Medium';
        if (lowerSentence.includes('urgent') || lowerSentence.includes('asap') || lowerSentence.includes('important')) {
          priority = 'High';
        } else if (lowerSentence.includes('maybe') || lowerSentence.includes('consider')) {
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

  /**
   * Extract highlights from a transcript
   * @param transcript The meeting transcript
   * @returns An array of highlight strings
   */
  extractHighlights(transcript: string): string[] {
    if (!transcript) return [];

    const sentences = transcript.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const highlights: string[] = [];
    
    // Process each sentence to find potential highlights
    sentences.forEach(sentence => {
      if (sentence.length < 10) return; // Skip very short sentences
      
      const lowerSentence = sentence.toLowerCase();
      
      // Check if the sentence contains any highlight phrases
      const hasHighlightPhrase = highlightPhrases.some(phrase => 
        lowerSentence.includes(phrase.toLowerCase())
      );
      
      // Check for sentences that might be important based on structure
      const isStructurallyImportant = 
        /^(first|second|third|finally|lastly|in conclusion|to summarize)/i.test(sentence) ||
        /^(i want to emphasize|i need to highlight|please note|remember that)/i.test(sentence);
      
      // Add sentences that contain highlight phrases or are structurally important
      if (hasHighlightPhrase || isStructurallyImportant) {
        // Clean up the sentence
        let highlight = sentence
          .replace(/^(please note that|note that|remember that|i want to emphasize that|i need to highlight that)/i, '')
          .trim();
        
        // Capitalize first letter if needed
        if (highlight.length > 0 && /[a-z]/.test(highlight[0])) {
          highlight = highlight.charAt(0).toUpperCase() + highlight.slice(1);
        }
        
        // Add to highlights if not already included and not too long
        if (!highlights.includes(highlight) && highlight.length <= 150) {
          highlights.push(highlight);
        }
      }
    });
    
    // Limit to top 5 highlights
    return highlights.slice(0, 5);
  }
};

export default transcriptAnalysis;