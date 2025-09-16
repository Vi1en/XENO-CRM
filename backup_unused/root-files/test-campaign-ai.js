// Test the campaign AI generation function
function generateSmartMockCampaign(objective, tone, offer) {
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

// Test with the user's exact inputs
const objective = "Navratra sale";
const tone = "Friendly";
const offer = "30%off on all items";

console.log('🧪 Testing Campaign AI Generation');
console.log('Objective:', objective);
console.log('Tone:', tone);
console.log('Offer:', offer);
console.log('');

const result = generateSmartMockCampaign(objective, tone, offer);
console.log('✅ Result:', JSON.stringify(result, null, 2));
