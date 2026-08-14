import { describe, it, expect } from 'vitest';
import { getPaginationParams, formatPaginatedResponse } from '../../src/utils/pagination.js';

describe('Unit Tests: Pagination Utility', () => {
  it('should parse page and limit defaults correctly', () => {
    const params = getPaginationParams();
    expect(params.page).toBe(1);
    expect(params.limit).toBe(20);
    expect(params.skip).toBe(0);
  });

  it('should handle custom page and limit query parameters', () => {
    const params = getPaginationParams('3', '10');
    expect(params.page).toBe(3);
    expect(params.limit).toBe(10);
    expect(params.skip).toBe(20);
  });

  it('should enforce pagination bounds', () => {
    const params = getPaginationParams('-5', '500');
    expect(params.page).toBe(1);
    expect(params.limit).toBe(100);
  });

  it('should format paginated JSON response matching task requirements', () => {
    const sampleData = [{ id: 1 }, { id: 2 }];
    const formatted = formatPaginatedResponse(sampleData, 10, 2, 2);

    expect(formatted).toEqual({
      data: sampleData,
      total: 10,
      page: 2,
      limit: 2,
    });
  });
});
