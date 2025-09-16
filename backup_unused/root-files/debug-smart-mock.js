// Copy the generateSmartMockRules function for debugging
function generateSmartMockRules(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  const rules = [];
  let name = '';
  let description = '';
  
  console.log('Debug - Input prompt:', prompt);
  console.log('Debug - Lower prompt:', lowerPrompt);
  
  // Check for spending-related keywords
  if (lowerPrompt.includes('spent') || lowerPrompt.includes('spend') || lowerPrompt.includes('purchase')) {
    console.log('Debug - Found spending keywords');
    let amount = 100; // default
    
    // Check for specific amounts in order of largest to smallest
    if (lowerPrompt.includes('$2500') || lowerPrompt.includes('2500')) amount = 2500;
    else if (lowerPrompt.includes('$2000') || lowerPrompt.includes('2000')) amount = 2000;
    else if (lowerPrompt.includes('$1500') || lowerPrompt.includes('1500')) amount = 1500;
    else if (lowerPrompt.includes('$1000') || lowerPrompt.includes('1000')) amount = 1000;
    else if (lowerPrompt.includes('$500') || lowerPrompt.includes('500')) amount = 500;
    else if (lowerPrompt.includes('$200') || lowerPrompt.includes('200')) amount = 200;
    else if (lowerPrompt.includes('$50') || lowerPrompt.includes('50')) amount = 50;
    
    console.log('Debug - Detected amount:', amount);
    
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
    
    console.log('Debug - Generated name:', name);
    console.log('Debug - Generated description:', description);
  }
  
  // Check for visit-related keywords
  if (lowerPrompt.includes('visit') || lowerPrompt.includes('visited') || lowerPrompt.includes('times')) {
    console.log('Debug - Found visit keywords');
    let visits = 2; // default
    if (lowerPrompt.includes('3') || lowerPrompt.includes('three')) visits = 3;
    else if (lowerPrompt.includes('5') || lowerPrompt.includes('five')) visits = 5;
    else if (lowerPrompt.includes('10') || lowerPrompt.includes('ten')) visits = 10;
    else if (lowerPrompt.includes('1') || lowerPrompt.includes('one')) visits = 1;
    
    console.log('Debug - Detected visits:', visits);
    
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
    console.log('Debug - Found time keywords');
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
    console.log('Debug - Found tag keywords');
    rules.push({
      field: 'tags',
      operator: 'contains',
      value: 'vip'
    });
    
    name = name ? `${name} (VIP)` : 'VIP Customers';
    description = description ? `${description} with VIP status` : 'VIP customers with special privileges';
  }
  
  console.log('Debug - Final rules count:', rules.length);
  console.log('Debug - Final name:', name);
  console.log('Debug - Final description:', description);
  
  // If no specific rules were generated, return default rules
  if (rules.length === 0) {
    console.log('Debug - No rules generated, returning default');
    return {
      rules: [
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

// Test the function
const testPrompts = [
  "Customers who spent more than $1000",
  "High value customers who spent more than $2500",
  "VIP customers with premium status"
];

console.log('🧪 Testing generateSmartMockRules function\n');

testPrompts.forEach((prompt, index) => {
  console.log(`\n=== Test ${index + 1}: "${prompt}" ===`);
  const result = generateSmartMockRules(prompt);
  console.log(`Result:`, JSON.stringify(result, null, 2));
});
