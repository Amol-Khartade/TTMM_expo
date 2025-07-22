/**
 * Utility functions for formatting data consistently across the app
 */

/**
 * Format currency with proper locale and currency symbol
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported locales
    return `$${amount.toFixed(2)}`;
  }
};

/**
 * Format date in a user-friendly way
 */
export const formatDate = (
  date: Date,
  format: 'short' | 'medium' | 'long' | 'relative' = 'medium'
): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (format === 'relative') {
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks}w ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  const options: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case 'short':
      options.month = 'numeric';
      options.day = 'numeric';
      options.year = '2-digit';
      break;
    case 'medium':
      options.month = 'short';
      options.day = 'numeric';
      options.year = 'numeric';
      break;
    case 'long':
      options.weekday = 'long';
      options.month = 'long';
      options.day = 'numeric';
      options.year = 'numeric';
      break;
  }

  return date.toLocaleDateString('en-US', options);
};

/**
 * Format date and time together
 */
export const formatDateTime = (
  date: Date,
  includeSeconds: boolean = false
): string => {
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  if (includeSeconds) {
    timeOptions.second = '2-digit';
  }

  const formattedDate = date.toLocaleDateString('en-US', dateOptions);
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

  return `${formattedDate} at ${formattedTime}`;
};

/**
 * Format percentage with proper rounding
 */
export const formatPercentage = (
  value: number,
  decimalPlaces: number = 1
): string => {
  return `${value.toFixed(decimalPlaces)}%`;
};

/**
 * Format numbers with proper thousand separators
 */
export const formatNumber = (
  value: number,
  decimalPlaces: number = 0
): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Format phone number (US format)
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
};

/**
 * Format initials from a name
 */
export const getInitials = (name: string, maxInitials: number = 2): string => {
  return name
    .split(' ')
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

/**
 * Format duration in human readable format
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

/**
 * Format balance with color indication
 */
export const formatBalance = (balance: number, currency: string = 'USD'): {
  formatted: string;
  color: string;
  isPositive: boolean;
} => {
  const formatted = formatCurrency(Math.abs(balance), currency);
  const isPositive = balance >= 0;
  
  return {
    formatted: isPositive ? formatted : `-${formatted}`,
    color: isPositive ? '#4CAF50' : '#f44336',
    isPositive,
  };
};

/**
 * Format split type for display
 */
export const formatSplitType = (splitType: string): string => {
  const splitTypes: Record<string, string> = {
    equal: 'Split Equally',
    percentage: 'Split by Percentage',
    exact: 'Split by Amount',
  };
  
  return splitTypes[splitType] || 'Unknown Split';
};

/**
 * Format expense category for display
 */
export const formatCategory = (category: string): string => {
  const categories: Record<string, string> = {
    food: 'Food & Dining',
    transport: 'Transportation',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    utilities: 'Utilities',
    healthcare: 'Healthcare',
    education: 'Education',
    travel: 'Travel',
    other: 'Other',
  };
  
  return categories[category.toLowerCase()] || capitalizeWords(category);
};

/**
 * Format validation errors for display
 */
export const formatValidationError = (error: string): string => {
  // Convert field names to more user-friendly names
  const fieldMappings: Record<string, string> = {
    email: 'email address',
    displayName: 'display name',
    phoneNumber: 'phone number',
    groupId: 'group',
    userId: 'user',
  };

  let formatted = error;
  
  // Replace field names with friendlier versions
  Object.entries(fieldMappings).forEach(([field, friendly]) => {
    const regex = new RegExp(`\\b${field}\\b`, 'gi');
    formatted = formatted.replace(regex, friendly);
  });

  return formatted;
};