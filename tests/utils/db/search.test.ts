// tests/utils/db/search.test.ts
import { searchDb } from '../../../src/utils/db/search';
import { Asset } from '../../../src/models/asset';
import { SearchQueryTooShort } from '../../../src/utils/errors/serviceErrors';

// Mock the Asset model
jest.mock('../../../src/models/asset', () => ({
  Asset: {
    find: jest.fn().mockReturnThis(), // Allows chaining
    sort: jest.fn().mockResolvedValue([
      { name: "Bitcoin.", type: "crypto", symbol: "BTC", extraparam: "test" },
      { name: "Ethereum.", type: "crypto", symbol: "ETH", extraparam: "test" },
    ]),
  },
}));

jest.mock('../../../src/utils/logger');

describe('searchDb', () => {
  it('calls Asset.find with correct operations', async () => {
    const mockResult = [
      { name: "Bitcoin.", type: "crypto", symbol: "BTC" },
      { name: "Ethereum.", type: "crypto", symbol: "ETH" },
    ];

    const result = await searchDb('bit');

    expect(Asset.find).toHaveBeenCalledWith(
      { $text: { $search: 'bit' } },
      { score: { $meta: 'textScore' } }
    );
    expect(result).toEqual(mockResult);
  });

  it('throws query param too short', async () => {
    await expect(searchDb('te')).rejects.toThrow(SearchQueryTooShort);
  });
});
