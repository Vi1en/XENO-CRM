const axios = require('axios');

const API_BASE_URL = 'https://backend-production-05a7e.up.railway.app/api/v1';

async function testCampaignHistory() {
  try {
    console.log('🧪 Testing Campaign History endpoint...');
    
    // First, create test data
    console.log('📊 Creating test communication logs...');
    const testDataResponse = await axios.post(`${API_BASE_URL}/campaigns/test-data`);
    console.log('✅ Test data created:', testDataResponse.data);
    
    // Wait a moment for data to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test the history endpoint
    console.log('📈 Fetching campaign history...');
    const historyResponse = await axios.get(`${API_BASE_URL}/campaigns/history`);
    console.log('✅ Campaign history response:', JSON.stringify(historyResponse.data, null, 2));
    
    // Check if we have campaigns with stats
    if (historyResponse.data.success && historyResponse.data.data) {
      const campaigns = historyResponse.data.data;
      console.log(`📊 Found ${campaigns.length} campaigns with stats`);
      
      campaigns.forEach((campaign, index) => {
        console.log(`\n📧 Campaign ${index + 1}: ${campaign.name}`);
        console.log(`   Status: ${campaign.status}`);
        console.log(`   Total Recipients: ${campaign.stats?.totalRecipients || 0}`);
        console.log(`   Sent: ${campaign.stats?.sent || 0}`);
        console.log(`   Delivered: ${campaign.stats?.delivered || 0}`);
        console.log(`   Failed: ${campaign.stats?.failed || 0}`);
        console.log(`   Bounced: ${campaign.stats?.bounced || 0}`);
        console.log(`   Delivery Rate: ${campaign.stats?.deliveryRate || 0}%`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing campaign history:', error.response?.data || error.message);
  }
}

testCampaignHistory();
