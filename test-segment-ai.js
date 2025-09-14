const { generateSmartMockRules } = require('./backend/src/services/ai');

// Test different prompts
const testPrompts = [
  "Customers who spent more than $1000",
  "High value customers who visited more than 5 times",
  "VIP customers with premium status",
  "Recent customers from last 30 days",
  "Customers who spent $2500 or more",
  "Frequent visitors with 10+ visits",
  "Premium customers with VIP tags"
];

console.log('🧪 Testing AI Segment Generation\n');

testPrompts.forEach((prompt, index) => {
  console.log(`Test ${index + 1}: "${prompt}"`);
  try {
    const result = generateSmartMockRules(prompt);
    console.log(`  Name: ${result.name}`);
    console.log(`  Description: ${result.description}`);
    console.log(`  Rules: ${JSON.stringify(result.rules, null, 2)}`);
    console.log('---');
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    console.log('---');
  }
});
