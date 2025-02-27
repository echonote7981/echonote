import { format, parseISO } from 'date-fns';

const dateUtils = {
  formatDate(date: string | Date): string {
    if (typeof date === 'string') {
      date = parseISO(date);
    }
    return format(date, 'MMM d, yyyy h:mm a');
  },
  
  parseDate(dateString: string): Date {
    return parseISO(dateString);
  },
  // Add other date utility functions here
};

export default dateUtils;
