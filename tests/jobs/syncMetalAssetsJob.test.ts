// tests/jobs/syncMetalAssetsJob.test.ts
import { syncMetalAssets } from '../../src/jobs/syncMetalAssetsJob';
import * as metalsapi from '../../src/services/metalprices';
import * as db from '../../src/utils/db/syncAssets';

jest.mock('../../src/services/metalprices');
jest.mock('../../src/utils/db/syncAssets');

describe('syncMetalAssets', () => {
  it('fetches and syncs assets', async () => {
    const mockAssets = [{ symbol: "XAU" }];
    (metalsapi.getAllMetals as jest.Mock).mockResolvedValue(mockAssets);
    const syncFn = db.syncAssetsWithDb as jest.Mock;

    await syncMetalAssets();

    expect(metalsapi.getAllMetals).toHaveBeenCalled();
    expect(syncFn).toHaveBeenCalledWith(mockAssets);
  });
});
