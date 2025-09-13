import OpenAI from 'openai';
import { Campaign } from '../models/campaign';
import { CommunicationLog } from '../models/communication-log';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock responses when OpenAI API key is not available
const MOCK_RESPONSES = {
  segmentRules: [
    {
      field: 'totalSpend',
      operator: 'greater_than',
      value: 100,
    },
    {
      field: 'visits',
      operator: 'greater_than',
      value: 2,
    },
  ],
  messageVariants: [
    "🔥 Don't miss out! Get 20% off all winter jackets - limited time offer!",
    "Stay warm this winter with our premium jacket collection. 20% off for you!",
    "Winter is coming! Prepare with our stylish jackets at 20% off. Shop now!",
  ],
  campaignSummary: "This campaign performed well with a 85% delivery rate. The message resonated with high-value customers, resulting in increased engagement. Consider A/B testing different offers for future campaigns.",
};

// Smart mock function that processes the user's description
function generateSmartMockRules(prompt: string): { rules: any[], name: string, description: string } {
  const lowerPrompt = prompt.toLowerCase();
  const rules: any[] = [];
  let name = '';
  let description = '';
  
  // Check for spending-related keywords
  if (lowerPrompt.includes('spent') || lowerPrompt.includes('spend') || lowerPrompt.includes('purchase')) {
    let amount = 100; // default
    
    // Check for specific amounts in order of largest to smallest
    if (lowerPrompt.includes('$2500') || lowerPrompt.includes('2500')) amount = 2500;
    else if (lowerPrompt.includes('$2000') || lowerPrompt.includes('2000')) amount = 2000;
    else if (lowerPrompt.includes('$1500') || lowerPrompt.includes('1500')) amount = 1500;
    else if (lowerPrompt.includes('$1000') || lowerPrompt.includes('1000')) amount = 1000;
    else if (lowerPrompt.includes('$500') || lowerPrompt.includes('500')) amount = 500;
    else if (lowerPrompt.includes('$200') || lowerPrompt.includes('200')) amount = 200;
    else if (lowerPrompt.includes('$50') || lowerPrompt.includes('50')) amount = 50;
    
    rules.push({
      field: 'totalSpend',
      operator: 'greater_than',
      value: amount
    });
    
    if (amount >= 2500) {
      name = 'Elite High-Value Customers';
      description = `Customers who have spent more than $${amount.toLocaleString()}`;
    } else if (amount >= 2000) {
      name = 'Ultra High-Value Customers';
      description = `Customers who have spent more than $${amount.toLocaleString()}`;
    } else if (amount >= 1000) {
      name = 'High-Value Customers';
      description = `Customers who have spent more than $${amount.toLocaleString()}`;
    } else if (amount >= 500) {
      name = 'Premium Customers';
      description = `Customers with spending over $${amount}`;
    } else {
      name = 'Active Spenders';
      description = `Customers who have spent more than $${amount}`;
    }
  }
  
  // Check for visit-related keywords
  if (lowerPrompt.includes('visit') || lowerPrompt.includes('visited') || lowerPrompt.includes('times')) {
    let visits = 2; // default
    if (lowerPrompt.includes('3') || lowerPrompt.includes('three')) visits = 3;
    else if (lowerPrompt.includes('5') || lowerPrompt.includes('five')) visits = 5;
    else if (lowerPrompt.includes('10') || lowerPrompt.includes('ten')) visits = 10;
    else if (lowerPrompt.includes('1') || lowerPrompt.includes('one')) visits = 1;
    
    rules.push({
      field: 'visits',
      operator: 'greater_than',
      value: visits
    });
    
    if (visits >= 10) {
      name = name ? `${name} & Frequent Visitors` : 'Frequent Visitors';
      description = description ? `${description} and visited at least ${visits} times` : `Customers who have visited at least ${visits} times`;
    } else if (visits >= 5) {
      name = name ? `${name} & Regular Visitors` : 'Regular Visitors';
      description = description ? `${description} and visited at least ${visits} times` : `Customers who have visited at least ${visits} times`;
    } else {
      name = name ? `${name} & Occasional Visitors` : 'Occasional Visitors';
      description = description ? `${description} and visited at least ${visits} times` : `Customers who have visited at least ${visits} times`;
    }
  }
  
  // Check for time-related keywords
  if (lowerPrompt.includes('last 30 days') || lowerPrompt.includes('30 days') || lowerPrompt.includes('recent')) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    rules.push({
      field: 'lastOrderAt',
      operator: 'greater_than',
      value: thirtyDaysAgo.toISOString()
    });
    
    name = name ? `${name} (Recent)` : 'Recent Customers';
    description = description ? `${description} in the last 30 days` : 'Customers who made purchases in the last 30 days';
  }
  
  // Check for tag-related keywords
  if (lowerPrompt.includes('vip') || lowerPrompt.includes('premium') || lowerPrompt.includes('loyal')) {
    rules.push({
      field: 'tags',
      operator: 'contains',
      value: 'vip'
    });
    
    name = name ? `${name} (VIP)` : 'VIP Customers';
    description = description ? `${description} with VIP status` : 'VIP customers with special privileges';
  }
  
  // If no specific rules were generated, return default rules
  if (rules.length === 0) {
    return {
      rules: MOCK_RESPONSES.segmentRules,
      name: 'General Segment',
      description: 'A general customer segment'
    };
  }
  
  // If no name was generated, create a generic one
  if (!name) {
    name = 'Custom Segment';
    description = description || 'A custom customer segment based on your criteria';
  }
  
  return { rules, name, description };
}

// Smart mock function for campaign generation
function generateSmartMockCampaign(objective: string, tone: string, offer?: string): { name: string, description: string, message: string, variants: string[] } {
  const lowerObjective = objective.toLowerCase();
  const lowerTone = tone.toLowerCase();
  
  // Generate campaign name based on objective
  let name = '';
  if (lowerObjective.includes('sale') || lowerObjective.includes('discount')) {
    name = 'Flash Sale Campaign';
  } else if (lowerObjective.includes('new') || lowerObjective.includes('launch')) {
    name = 'Product Launch Campaign';
  } else if (lowerObjective.includes('welcome') || lowerObjective.includes('onboard')) {
    name = 'Welcome Series Campaign';
  } else if (lowerObjective.includes('retention') || lowerObjective.includes('loyalty')) {
    name = 'Customer Retention Campaign';
  } else if (lowerObjective.includes('upsell') || lowerObjective.includes('upgrade')) {
    name = 'Upsell Campaign';
  } else {
    name = 'Marketing Campaign';
  }
  
  // Generate description
  const description = `A ${tone} campaign designed to ${objective.toLowerCase()}`;
  
  // Generate main message based on tone and objective
  let message = '';
  if (lowerTone.includes('urgent') || lowerTone.includes('urgent')) {
    const offerText = offer ? `Don't miss out on ${offer}` : 'Limited time offer - act now!';
    message = `🚨 URGENT: ${objective}! ${offerText}`;
  } else if (lowerTone.includes('friendly') || lowerTone.includes('casual')) {
    const offerText = offer ? `Here is what we have for you: ${offer}` : 'We think you will love this!';
    message = `Hey there! ${objective}. ${offerText}`;
  } else if (lowerTone.includes('professional') || lowerTone.includes('formal')) {
    const offerText = offer ? `Our special offer: ${offer}` : 'Please find details below.';
    message = `We are excited to share that ${objective.toLowerCase()}. ${offerText}`;
  } else {
    const offerText = offer ? offer : 'Check out what we have for you.';
    message = `${objective}! ${offerText}`;
  }
  
  // Generate variants
  const variants = [
    message,
    `${objective} - ${offer || 'Special offer inside!'}`,
    `Don't miss out! ${objective.toLowerCase()}. ${offer || 'Limited time only!'}`
  ];
  
  return { name, description, message, variants };
}

export async function generateSegmentRules(prompt: string): Promise<{ rules: any[], name: string, description: string }> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('🤖 Using smart mock AI response for segment rules');
    return generateSmartMockRules(prompt);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert at converting natural language descriptions into customer segmentation rules. 
          Return a JSON array of rules that can be used to filter customers. Each rule should have:
          - field: one of 'totalSpend', 'visits', 'lastOrderAt', 'tags'
          - operator: one of 'equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains', 'in', 'not_in'
          - value: the value to compare against
          
          Examples:
          - "Customers who spent more than $100" -> [{"field": "totalSpend", "operator": "greater_than", "value": 100}]
          - "Customers with 3 or more visits" -> [{"field": "visits", "operator": "greater_than", "value": 2}]
          - "Customers who ordered in the last 30 days" -> [{"field": "lastOrderAt", "operator": "greater_than", "value": "2024-01-01T00:00:00Z"}]
          - "VIP customers" -> [{"field": "tags", "operator": "contains", "value": "VIP"}]`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      rules: MOCK_RESPONSES.segmentRules,
      name: 'General Segment',
      description: 'A general customer segment'
    };
  }
}

export async function generateMessageVariants(
  objective: string,
  tone: string,
  offer?: string
): Promise<{ name: string, description: string, message: string, variants: string[] }> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('🤖 Using smart mock AI response for campaign generation');
    return generateSmartMockCampaign(objective, tone, offer);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert marketing copywriter. Generate 3 different email/message variants for a campaign.
          Each variant should be:
          - 1-2 sentences long
          - Match the specified tone
          - Include the offer if provided
          - Be engaging and action-oriented
          - Suitable for email marketing
          
          Return as a JSON array of strings.`,
        },
        {
          role: 'user',
          content: `Objective: ${objective}\nTone: ${tone}\nOffer: ${offer || 'No specific offer'}`,
        },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      name: 'Marketing Campaign',
      description: 'A marketing campaign',
      message: 'Check out our latest offer!',
      variants: MOCK_RESPONSES.messageVariants
    };
  }
}

export async function generateCampaignSummary(campaignId: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('🤖 Using mock AI response for campaign summary');
    return MOCK_RESPONSES.campaignSummary;
  }

  try {
    // Get campaign data
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get communication log stats
    const stats = await CommunicationLog.aggregate([
      { $match: { campaignId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    const totalSent = (statusCounts.SENT || 0) + (statusCounts.DELIVERED || 0);
    const totalFailed = statusCounts.FAILED || 0;
    const deliveryRate = campaign.stats.totalRecipients > 0 
      ? ((totalSent / campaign.stats.totalRecipients) * 100).toFixed(1)
      : '0';

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a marketing analytics expert. Generate a concise, insightful summary of campaign performance.
          Focus on:
          - Key metrics and performance indicators
          - What worked well and what didn't
          - Actionable recommendations for improvement
          - Overall campaign health assessment
          
          Keep it professional but accessible, 2-3 sentences.`,
        },
        {
          role: 'user',
          content: `Campaign: ${campaign.name}
          Total Recipients: ${campaign.stats.totalRecipients}
          Sent: ${totalSent}
          Failed: ${totalFailed}
          Delivery Rate: ${deliveryRate}%
          Status: ${campaign.status}
          Message: ${campaign.message}`,
        },
      ],
      temperature: 0.5,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return response;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return MOCK_RESPONSES.campaignSummary;
  }
}
