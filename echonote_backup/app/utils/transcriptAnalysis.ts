import { Action } from '../services/api';

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
