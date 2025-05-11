// tests/jobs/syncCryptoAssetsJob.test.ts
import { syncCryptoAssets } from '../../src/jobs/syncCryptoAssetsJob';
import * as coingecko from '../../src/services/coingecko';
import * as db from '../../src/utils/syncAssets';

jest.mock('../../src/services/coingecko');
jest.mock('../../src/utils/syncAssets');

describe('syncCryptoAssets', () => {
  it('fetches and syncs assets', async () => {
    const mockAssets = [{ symbol: 'BTC' }];
    (coingecko.getAllAssetsInfo as jest.Mock).mockResolvedValue(mockAssets);
    const syncFn = db.syncAssetsWithDb as jest.Mock;

    await syncCryptoAssets();

    expect(coingecko.getAllAssetsInfo).toHaveBeenCalled();
    expect(syncFn).toHaveBeenCalledWith(mockAssets);
  });
});
