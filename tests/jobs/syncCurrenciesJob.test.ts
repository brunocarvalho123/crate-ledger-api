// tests/jobs/syncCurrenciesAssetsJob.test.ts
import { syncCurrencies, startSyncCurrenciesJob } from '../../src/jobs/syncCurrenciesJob';
import { getAllCurrencies, getAvailableCurrencies } from '../../src/services/frankfurter';
import logger from '../../src/utils/logger';
import { syncAssetsWithDb } from '../../src/utils/syncAssets';

// Mock the external dependencies
jest.mock('../../src/services/frankfurter');
jest.mock('../../src/utils/syncAssets');
jest.mock('../../src/utils/logger');

describe('syncCurrencies', () => {
  it('should sync currencies successfully', async () => {
    const mockAvailableCurrencies = { USD: 'United States Dollar', EUR: 'Euro' };
    const mockCurrencies = { USD: 'United States Dollar', EUR: 'Euro', GBP: 'British Pound' };

    (getAllCurrencies as jest.Mock).mockResolvedValue(mockCurrencies);
    (syncAssetsWithDb as jest.Mock).mockResolvedValue(undefined);

    await syncCurrencies(mockAvailableCurrencies);

    expect(getAllCurrencies).toHaveBeenCalledWith(mockAvailableCurrencies);
    expect(syncAssetsWithDb).toHaveBeenCalledWith(mockCurrencies);
  });

  it('should handle errors during sync', async () => {
    const mockAvailableCurrencies = { USD: 'United States Dollar', EUR: 'Euro' };
    const error = new Error('Failed to fetch currencies');

    (getAllCurrencies as jest.Mock).mockRejectedValue(error);

    await syncCurrencies(mockAvailableCurrencies);

    expect(logger.error).toHaveBeenCalledWith('❌ Error during Currency sync:', error);
  });
});

describe('startSyncCurrenciesJob', () => {
   beforeEach(() => {
    // Mock setInterval
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
  });

  afterEach(() => {
    // Restore setInterval to its original implementation
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should start the sync job and set up interval', async () => {
    const mockAvailableCurrencies = { USD: 'United States Dollar', EUR: 'Euro' };

    (getAvailableCurrencies as jest.Mock).mockResolvedValue(mockAvailableCurrencies);

    await startSyncCurrenciesJob();

    expect(getAvailableCurrencies).toHaveBeenCalled();
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 24 * 60 * 60 * 1000);
  });
});