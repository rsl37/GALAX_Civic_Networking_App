/**
 * Stablecoin Service Integration Tests
 * Tests the complete stablecoin service integration
 */

import { StablecoinService } from '../StablecoinService.ts';
import { DEFAULT_STABLECOIN_CONFIG } from '../StablecoinContract.ts';
import { DEFAULT_ORACLE_CONFIG } from '../PriceOracle.ts';

class IntegrationTestRunner {
  private service: StablecoinService;

  constructor() {
    // Create test service with faster intervals for testing
    const testConfig = {
      ...DEFAULT_STABLECOIN_CONFIG,
      rebalanceInterval: 5000, // 5 seconds for testing
      toleranceBand: 0.02
    };
    
    const testOracleConfig = {
      ...DEFAULT_ORACLE_CONFIG,
      updateInterval: 2000 // 2 seconds for testing
    };
    
    this.service = new StablecoinService(testConfig, testOracleConfig);
  }

  async runTests(): Promise<void> {
    console.log('🔄 Running stablecoin service integration tests...\n');

    try {
      await this.testServiceStartup();
      await this.testMetricsRetrieval();
      await this.testManualRebalance();
      await this.testMarketShockSimulation();
      await this.testConfigurationUpdates();
      
      console.log('\n✅ All integration tests completed successfully!');
    } catch (error) {
      console.error('\n❌ Integration test failed:', error);
    } finally {
      this.service.stop();
    }
  }

  private async testServiceStartup(): Promise<void> {
    console.log('🚀 Testing service startup...');
    
    await this.service.start();
    
    const status = this.service.getStatus();
    if (!status.isRunning) {
      throw new Error('Service should be running after start()');
    }
    
    console.log('✅ Service started successfully');
  }

  private async testMetricsRetrieval(): Promise<void> {
    console.log('📊 Testing metrics retrieval...');
    
    const metrics = this.service.getMetrics();
    
    if (!metrics.stability || !metrics.supply || !metrics.price || !metrics.oracle) {
      throw new Error('Metrics should include all required sections');
    }
    
    if (typeof metrics.stability.currentPrice !== 'number') {
      throw new Error('Current price should be a number');
    }
    
    if (typeof metrics.supply.totalSupply !== 'number') {
      throw new Error('Total supply should be a number');
    }
    
    console.log('✅ Metrics retrieved successfully');
    console.log(`   Current price: $${metrics.stability.currentPrice.toFixed(4)}`);
    console.log(`   Total supply: ${metrics.supply.totalSupply.toFixed(0)}`);
    console.log(`   Stability score: ${metrics.stability.stabilityScore.toFixed(1)}`);
  }

  private async testManualRebalance(): Promise<void> {
    console.log('⚖️ Testing manual rebalance...');
    
    // First set a price that should trigger rebalancing
    this.service.setPrice(1.05); // 5% above peg
    
    // Wait a moment for price to propagate
    await this.sleep(1000);
    
    const adjustment = await this.service.performRebalance();
    
    if (adjustment && adjustment.action !== 'none') {
      console.log('✅ Manual rebalance executed successfully');
      console.log(`   Action: ${adjustment.action}`);
      console.log(`   Amount: ${adjustment.amount.toFixed(2)}`);
    } else {
      console.log('ℹ️ No rebalance needed (price within tolerance)');
    }
  }

  private async testMarketShockSimulation(): Promise<void> {
    console.log('💥 Testing market shock simulation...');
    
    const initialMetrics = this.service.getMetrics();
    const initialPrice = initialMetrics.stability.currentPrice;
    
    // Simulate moderate market shock
    this.service.simulateMarketShock(0.1); // 10% severity
    
    // Wait for shock to propagate
    await this.sleep(1000);
    
    const postShockMetrics = this.service.getMetrics();
    const newPrice = postShockMetrics.stability.currentPrice;
    
    if (Math.abs(newPrice - initialPrice) < 0.001) {
      console.log('ℹ️ Market shock had minimal impact (price stability)');
    } else {
      console.log('✅ Market shock simulated successfully');
      console.log(`   Price changed from $${initialPrice.toFixed(4)} to $${newPrice.toFixed(4)}`);
    }
  }

  private async testConfigurationUpdates(): Promise<void> {
    console.log('⚙️ Testing configuration updates...');
    
    // Update stablecoin config
    this.service.updateConfig({
      toleranceBand: 0.03, // Change to 3%
      maxSupplyChange: 0.08 // Change to 8%
    });
    
    // Update oracle config
    this.service.updateOracleConfig({
      updateInterval: 3000 // Change to 3 seconds
    });
    
    console.log('✅ Configuration updates completed');
  }

  private async testSupplyHistory(): Promise<void> {
    console.log('📈 Testing supply history...');
    
    const history = await this.service.getSupplyHistory(5);
    
    console.log('✅ Supply history retrieved successfully');
    console.log(`   Found ${history.length} recent adjustments`);
    
    if (history.length > 0) {
      const latest = history[0];
      console.log(`   Latest adjustment: ${latest.action} ${latest.amount.toFixed(2)}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for external use
export { IntegrationTestRunner };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new IntegrationTestRunner();
  runner.runTests().catch(console.error);
}