/**
 * Stablecoin Contract Tests
 * Unit tests for the algorithmic stablecoin smart contract logic
 */

import { StablecoinContract, StablecoinConfig, DEFAULT_STABLECOIN_CONFIG } from '../StablecoinContract.ts';

// Simple test framework
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

class TestRunner {
  private results: TestResult[] = [];

  test(name: string, fn: () => void | Promise<void>) {
    return new Promise<void>(async (resolve) => {
      try {
        await fn();
        this.results.push({ name, passed: true });
        console.log(`✅ ${name}`);
      } catch (error) {
        this.results.push({ 
          name, 
          passed: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
        console.log(`❌ ${name}: ${error}`);
      }
      resolve();
    });
  }

  async runAll(): Promise<void> {
    console.log('Running stablecoin contract tests...\n');
    
    await this.testBasicFunctionality();
    await this.testSupplyAdjustments();
    await this.testPriceStability();
    await this.testReserveManagement();
    await this.testEdgeCases();
    
    this.printSummary();
  }

  private async testBasicFunctionality() {
    console.log('📋 Testing basic functionality...');

    await this.test('Contract initialization', () => {
      const contract = new StablecoinContract(DEFAULT_STABLECOIN_CONFIG, 10000, 2000);
      const supplyInfo = contract.getSupplyInfo();
      
      if (supplyInfo.totalSupply !== 10000) {
        throw new Error(`Expected supply 10000, got ${supplyInfo.totalSupply}`);
      }
      if (supplyInfo.reservePool !== 2000) {
        throw new Error(`Expected reserve 2000, got ${supplyInfo.reservePool}`);
      }
      if (supplyInfo.reserveRatio !== 0.2) {
        throw new Error(`Expected reserve ratio 0.2, got ${supplyInfo.reserveRatio}`);
      }
    });

    await this.test('Price data handling', () => {
      const contract = new StablecoinContract(DEFAULT_STABLECOIN_CONFIG);
      
      contract.addPriceData({
        price: 1.05,
        timestamp: Date.now(),
        volume: 1000,
        confidence: 0.9
      });
      
      const currentPrice = contract.getCurrentPrice();
      if (currentPrice !== 1.05) {
        throw new Error(`Expected price 1.05, got ${currentPrice}`);
      }
    });

    await this.test('Average price calculation', () => {
      const contract = new StablecoinContract(DEFAULT_STABLECOIN_CONFIG);
      const now = Date.now();
      
      // Add several price points
      contract.addPriceData({ price: 1.0, timestamp: now - 300000, volume: 100, confidence: 1.0 });
      contract.addPriceData({ price: 1.1, timestamp: now - 200000, volume: 100, confidence: 1.0 });
      contract.addPriceData({ price: 0.9, timestamp: now - 100000, volume: 100, confidence: 1.0 });
      contract.addPriceData({ price: 1.05, timestamp: now, volume: 100, confidence: 1.0 });
      
      const avgPrice = contract.getAveragePrice(400000);
      const expected = (1.0 + 1.1 + 0.9 + 1.05) / 4;
      
      if (Math.abs(avgPrice - expected) > 0.01) {
        throw new Error(`Expected average price ${expected}, got ${avgPrice}`);
      }
    });
  }

  private async testSupplyAdjustments() {
    console.log('📊 Testing supply adjustments...');

    await this.test('Expansion when price above peg', () => {
      const config: StablecoinConfig = {
        ...DEFAULT_STABLECOIN_CONFIG,
        toleranceBand: 0.01 // 1% tolerance
      };
      
      const contract = new StablecoinContract(config, 10000, 2000);
      
      // Add price data above peg
      contract.addPriceData({
        price: 1.05, // 5% above peg
        timestamp: Date.now(),
        volume: 1000,
        confidence: 1.0
      });
      
      const adjustment = contract.calculateSupplyAdjustment();
      
      if (adjustment.action !== 'expand') {
        throw new Error(`Expected expand action, got ${adjustment.action}`);
      }
      if (adjustment.amount <= 0) {
        throw new Error(`Expected positive expansion amount, got ${adjustment.amount}`);
      }
    });

    await this.test('Contraction when price below peg', () => {
      const config: StablecoinConfig = {
        ...DEFAULT_STABLECOIN_CONFIG,
        toleranceBand: 0.01 // 1% tolerance
      };
      
      const contract = new StablecoinContract(config, 10000, 2000);
      
      // Add price data below peg
      contract.addPriceData({
        price: 0.95, // 5% below peg
        timestamp: Date.now(),
        volume: 1000,
        confidence: 1.0
      });
      
      const adjustment = contract.calculateSupplyAdjustment();
      
      if (adjustment.action !== 'contract') {
        throw new Error(`Expected contract action, got ${adjustment.action}`);
      }
      if (adjustment.amount <= 0) {
        throw new Error(`Expected positive contraction amount, got ${adjustment.amount}`);
      }
    });

    await this.test('No action when price within tolerance', () => {
      const config: StablecoinConfig = {
        ...DEFAULT_STABLECOIN_CONFIG,
        toleranceBand: 0.05 // 5% tolerance
      };
      
      const contract = new StablecoinContract(config, 10000, 2000);
      
      // Add price data within tolerance
      contract.addPriceData({
        price: 1.02, // 2% above peg, within 5% tolerance
        timestamp: Date.now(),
        volume: 1000,
        confidence: 1.0
      });
      
      const adjustment = contract.calculateSupplyAdjustment();
      
      if (adjustment.action !== 'none') {
        throw new Error(`Expected no action, got ${adjustment.action}`);
      }
    });

    await this.test('Supply adjustment execution', () => {
      const config: StablecoinConfig = {
        ...DEFAULT_STABLECOIN_CONFIG,
        rebalanceInterval: 0 // Allow immediate rebalancing for testing
      };
      
      const contract = new StablecoinContract(config, 10000, 2000);
      const initialSupply = contract.getSupplyInfo().totalSupply;
      
      // Add price data to trigger expansion
      contract.addPriceData({
        price: 1.1,
        timestamp: Date.now(),
        volume: 1000,
        confidence: 1.0
      });
      
      const adjustment = contract.rebalance();
      
      if (!adjustment || adjustment.action === 'none') {
        throw new Error('Expected rebalance to execute');
      }
      
      const newSupply = contract.getSupplyInfo().totalSupply;
      
      if (adjustment.action === 'expand' && newSupply <= initialSupply) {
        throw new Error('Expected supply to increase after expansion');
      }
    });
  }

  private async testPriceStability() {
    console.log('💹 Testing price stability metrics...');

    await this.test('Stability metrics calculation', () => {
      const contract = new StablecoinContract(DEFAULT_STABLECOIN_CONFIG);
      
      // Add stable price data
      const baseTime = Date.now();
      for (let i = 0; i < 10; i++) {
        contract.addPriceData({
          price: 1.0 + (Math.random() - 0.5) * 0.01, // Small random variation around $1
          timestamp: baseTime + i * 60000,
          volume: 1000,
          confidence: 1.0
        });
      }
      
      const metrics = contract.getStabilityMetrics();
      
      if (metrics.targetPrice !== 1.0) {
        throw new Error(`Expected target price 1.0, got ${metrics.targetPrice}`);
      }
      if (metrics.deviation > 0.1) {
        throw new Error(`Expected low deviation, got ${metrics.deviation}`);
      }
      if (metrics.stabilityScore < 50) {
        throw new Error(`Expected decent stability score, got ${metrics.stabilityScore}`);
      }
    });

    await this.test('High volatility detection', () => {
      const contract = new StablecoinContract(DEFAULT_STABLECOIN_CONFIG);
      
      // Add volatile price data
      const baseTime = Date.now();
      const volatilePrices = [1.0, 1.2, 0.8, 1.15, 0.85, 1.1, 0.9, 1.05, 0.95, 1.0];
      
      volatilePrices.forEach((price, i) => {
        contract.addPriceData({
          price,
          timestamp: baseTime + i * 60000,
          volume: 1000,
          confidence: 1.0
        });
      });
      
      const metrics = contract.getStabilityMetrics();
      
      if (metrics.volatility < 0.1) {
        throw new Error(`Expected high volatility, got ${metrics.volatility}`);
      }
      if (metrics.stabilityScore > 80) {
        throw new Error(`Expected low stability score for volatile prices, got ${metrics.stabilityScore}`);
      }
    });
  }

  private async testReserveManagement() {
    console.log('🏦 Testing reserve management...');

    await this.test('Adding reserves', () => {
      const contract = new StablecoinContract(DEFAULT_STABLECOIN_CONFIG, 10000, 2000);
      const initialReserves = contract.getSupplyInfo().reservePool;
      
      contract.addReserves(500);
      
      const newReserves = contract.getSupplyInfo().reservePool;
      if (newReserves !== initialReserves + 500) {
        throw new Error(`Expected reserves to increase by 500, got ${newReserves - initialReserves}`);
      }
    });

    await this.test('Removing reserves with sufficient backing', () => {
      const contract = new StablecoinContract(DEFAULT_STABLECOIN_CONFIG, 10000, 5000); // 50% reserve ratio
      
      const success = contract.removeReserves(1000);
      
      if (!success) {
        throw new Error('Expected reserve removal to succeed with sufficient backing');
      }
      
      const newReserves = contract.getSupplyInfo().reservePool;
      if (newReserves !== 4000) {
        throw new Error(`Expected 4000 reserves after removal, got ${newReserves}`);
      }
    });

    await this.test('Preventing reserve removal that violates ratio', () => {
      const config: StablecoinConfig = {
        ...DEFAULT_STABLECOIN_CONFIG,
        reserveRatio: 0.3 // 30% minimum reserve ratio
      };
      
      const contract = new StablecoinContract(config, 10000, 3000); // Exactly at minimum
      
      const success = contract.removeReserves(100); // Would drop below minimum
      
      if (success) {
        throw new Error('Expected reserve removal to fail when it would violate reserve ratio');
      }
    });

    await this.test('Reserve ratio constraint on contractions', () => {
      const config: StablecoinConfig = {
        ...DEFAULT_STABLECOIN_CONFIG,
        reserveRatio: 0.25, // 25% minimum
        toleranceBand: 0.01
      };
      
      const contract = new StablecoinContract(config, 10000, 2500); // Exactly at minimum
      
      // Add price data to trigger contraction
      contract.addPriceData({
        price: 0.9,
        timestamp: Date.now(),
        volume: 1000,
        confidence: 1.0
      });
      
      const adjustment = contract.calculateSupplyAdjustment();
      
      // Should limit contraction to maintain reserve ratio
      const wouldViolateRatio = (2500 / adjustment.newSupply) < 0.25;
      if (wouldViolateRatio) {
        throw new Error('Contraction calculation should respect reserve ratio constraints');
      }
    });
  }

  private async testEdgeCases() {
    console.log('🔍 Testing edge cases...');

    await this.test('Zero supply handling', () => {
      const contract = new StablecoinContract(DEFAULT_STABLECOIN_CONFIG, 0, 0);
      const supplyInfo = contract.getSupplyInfo();
      
      if (supplyInfo.reserveRatio !== 0) {
        throw new Error(`Expected 0 reserve ratio with zero supply, got ${supplyInfo.reserveRatio}`);
      }
      
      const adjustment = contract.calculateSupplyAdjustment();
      // Should handle gracefully without errors
    });

    await this.test('Maximum supply change limit', () => {
      const config: StablecoinConfig = {
        ...DEFAULT_STABLECOIN_CONFIG,
        maxSupplyChange: 0.05, // 5% max change
        toleranceBand: 0.01
      };
      
      const contract = new StablecoinContract(config, 10000, 2000);
      
      // Add extreme price data
      contract.addPriceData({
        price: 2.0, // 100% above peg
        timestamp: Date.now(),
        volume: 1000,
        confidence: 1.0
      });
      
      const adjustment = contract.calculateSupplyAdjustment();
      
      if (adjustment.action === 'expand') {
        const maxExpansion = 10000 * 0.05;
        if (adjustment.amount > maxExpansion + 1) { // Small tolerance for rounding
          throw new Error(`Supply change ${adjustment.amount} exceeds maximum ${maxExpansion}`);
        }
      }
    });

    await this.test('Mint and burn operations', () => {
      const contract = new StablecoinContract(DEFAULT_STABLECOIN_CONFIG, 10000, 2000);
      
      // Test minting
      contract.mint(1000);
      let supplyInfo = contract.getSupplyInfo();
      if (supplyInfo.totalSupply !== 11000) {
        throw new Error(`Expected supply 11000 after mint, got ${supplyInfo.totalSupply}`);
      }
      
      // Test burning
      const burnSuccess = contract.burn(2000);
      if (!burnSuccess) {
        throw new Error('Expected burn to succeed');
      }
      
      supplyInfo = contract.getSupplyInfo();
      if (supplyInfo.totalSupply !== 9000) {
        throw new Error(`Expected supply 9000 after burn, got ${supplyInfo.totalSupply}`);
      }
      
      // Test burning more than supply
      const excessiveBurn = contract.burn(15000);
      if (excessiveBurn) {
        throw new Error('Expected excessive burn to fail');
      }
    });

    await this.test('Configuration updates', () => {
      const contract = new StablecoinContract(DEFAULT_STABLECOIN_CONFIG);
      
      const newConfig = {
        targetPrice: 2.0,
        toleranceBand: 0.1
      };
      
      contract.updateConfig(newConfig);
      
      const updatedConfig = contract.getConfig();
      if (updatedConfig.targetPrice !== 2.0) {
        throw new Error(`Expected updated target price 2.0, got ${updatedConfig.targetPrice}`);
      }
      if (updatedConfig.toleranceBand !== 0.1) {
        throw new Error(`Expected updated tolerance 0.1, got ${updatedConfig.toleranceBand}`);
      }
    });
  }

  private printSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const failed = this.results.filter(r => !r.passed);
    
    console.log(`\n📊 Test Summary: ${passed}/${total} tests passed`);
    
    if (failed.length > 0) {
      console.log('\n❌ Failed tests:');
      failed.forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
    }
    
    console.log(passed === total ? '\n🎉 All tests passed!' : '\n⚠️ Some tests failed');
  }
}

// Export test runner for external use
export { TestRunner };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  runner.runAll().catch(console.error);
}