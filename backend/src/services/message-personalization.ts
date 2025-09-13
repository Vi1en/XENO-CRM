import { ICustomer } from '../models/customer';

export interface PersonalizationData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  totalSpend: number;
  visits: number;
  lastOrderAt?: Date;
  tags: string[];
}

export interface PersonalizedMessage {
  subject?: string;
  message: string;
  email: string;
  phone?: string;
}

/**
 * Personalizes a message template using customer data
 * Supports placeholders like {{firstName}}, {{lastName}}, {{totalSpend}}, etc.
 */
export function personalizeMessage(
  template: string,
  customer: PersonalizationData
): PersonalizedMessage {
  let personalizedMessage = template;
  
  // Replace common placeholders
  const placeholders: Record<string, string | number> = {
    '{{firstName}}': customer.firstName,
    '{{lastName}}': customer.lastName,
    '{{fullName}}': `${customer.firstName} ${customer.lastName}`,
    '{{email}}': customer.email,
    '{{phone}}': customer.phone || '',
    '{{totalSpend}}': customer.totalSpend.toFixed(2),
    '{{visits}}': customer.visits.toString(),
    '{{lastOrderDate}}': customer.lastOrderAt ? customer.lastOrderAt.toLocaleDateString() : 'Never',
    '{{tags}}': customer.tags.join(', '),
  };
  
  // Replace all placeholders
  for (const [placeholder, value] of Object.entries(placeholders)) {
    personalizedMessage = personalizedMessage.replace(new RegExp(placeholder, 'g'), String(value));
  }
  
  // Generate subject line if not provided
  let subject = '';
  if (personalizedMessage.includes('{{subject}}')) {
    const subjectMatch = personalizedMessage.match(/\{\{subject:(.*?)\}\}/);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      personalizedMessage = personalizedMessage.replace(/\{\{subject:.*?\}\}/, '');
    }
  }
  
  return {
    subject: subject || `Hi ${customer.firstName}!`,
    message: personalizedMessage.trim(),
    email: customer.email,
    phone: customer.phone,
  };
}

/**
 * Generates a smart personalized message based on customer data
 * This creates contextual messages without requiring templates
 */
export function generateSmartPersonalizedMessage(
  baseMessage: string,
  customer: PersonalizationData
): PersonalizedMessage {
  const { firstName, totalSpend, visits, lastOrderAt, tags } = customer;
  
  // Determine customer tier based on spending
  let tier = 'valued';
  if (totalSpend >= 1000) tier = 'VIP';
  else if (totalSpend >= 500) tier = 'premium';
  else if (totalSpend >= 100) tier = 'loyal';
  
  // Determine recency
  const daysSinceLastOrder = lastOrderAt 
    ? Math.floor((Date.now() - lastOrderAt.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  let recency = 'new';
  if (daysSinceLastOrder <= 7) recency = 'recent';
  else if (daysSinceLastOrder <= 30) recency = 'returning';
  else if (daysSinceLastOrder <= 90) recency = 'occasional';
  
  // Generate personalized greeting
  let greeting = `Hi ${firstName}!`;
  if (tier === 'VIP') greeting = `Hi ${firstName}, our VIP customer!`;
  else if (tier === 'premium') greeting = `Hi ${firstName}, our premium customer!`;
  else if (visits >= 5) greeting = `Hi ${firstName}, our loyal customer!`;
  
  // Generate contextual offer based on customer data
  let offer = '';
  if (totalSpend >= 1000) {
    offer = `As our VIP customer, here's an exclusive 15% off your next order!`;
  } else if (totalSpend >= 500) {
    offer = `As a premium customer, here's 12% off your next order!`;
  } else if (visits >= 3) {
    offer = `Thanks for being a loyal customer! Here's 10% off your next order!`;
  } else if (recency === 'new') {
    offer = `Welcome! Here's 10% off your first order!`;
  } else {
    offer = `Here's 10% off your next order!`;
  }
  
  // Combine base message with personalization
  let personalizedMessage = baseMessage;
  
  // Replace generic greetings with personalized ones
  if (personalizedMessage.toLowerCase().includes('hi') || personalizedMessage.toLowerCase().includes('hello')) {
    personalizedMessage = personalizedMessage.replace(/^(hi|hello|hey)[^!]*!?/i, greeting);
  } else {
    personalizedMessage = `${greeting} ${personalizedMessage}`;
  }
  
  // Add contextual offer if message doesn't already contain an offer
  if (!personalizedMessage.toLowerCase().includes('off') && !personalizedMessage.toLowerCase().includes('discount')) {
    personalizedMessage += ` ${offer}`;
  }
  
  return {
    subject: `Hi ${firstName}!`,
    message: personalizedMessage,
    email: customer.email,
    phone: customer.phone,
  };
}

/**
 * Example message templates with placeholders
 */
export const MESSAGE_TEMPLATES = {
  WELCOME: `Hi {{firstName}}! Welcome to our store. Here's 10% off your first order!`,
  DISCOUNT: `Hi {{firstName}}, here's {{discount}}% off your next order!`,
  VIP: `Hi {{firstName}}, our VIP customer! Here's an exclusive 15% off for you!`,
  RETURNING: `Hi {{firstName}}! We miss you. Here's 10% off to welcome you back!`,
  BIRTHDAY: `Happy Birthday {{firstName}}! Here's a special 20% off just for you!`,
  CUSTOM: `Hi {{firstName}}, {{message}}`,
};

/**
 * Smart message generation based on campaign type and customer data
 */
export function generateCampaignMessage(
  campaignType: 'welcome' | 'discount' | 'vip' | 'returning' | 'custom',
  baseMessage: string,
  customer: PersonalizationData,
  customData?: Record<string, any>
): PersonalizedMessage {
  switch (campaignType) {
    case 'welcome':
      return personalizeMessage(MESSAGE_TEMPLATES.WELCOME, customer);
    
    case 'discount':
      const discount = customData?.discount || 10;
      return personalizeMessage(
        MESSAGE_TEMPLATES.DISCOUNT.replace('{{discount}}', discount.toString()),
        customer
      );
    
    case 'vip':
      return personalizeMessage(MESSAGE_TEMPLATES.VIP, customer);
    
    case 'returning':
      return personalizeMessage(MESSAGE_TEMPLATES.RETURNING, customer);
    
    case 'custom':
    default:
      return generateSmartPersonalizedMessage(baseMessage, customer);
  }
}

