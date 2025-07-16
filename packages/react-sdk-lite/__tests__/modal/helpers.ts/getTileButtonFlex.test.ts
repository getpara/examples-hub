import { describe, expect, it } from 'vitest';
import { getTileButtonFlex } from '../../../src/modal/utils/getTileButtonFlex';

describe('getTileButtonFlex', () => {
  it('getTileButtonFlex', () => {
    expect(getTileButtonFlex(1, 1)).toBe('1 1 auto');
    expect(getTileButtonFlex(2, 2)).toBe('0 0 calc(33.333333% - 5.336px)');
    expect(getTileButtonFlex(1, 3)).toBe('0 0 calc(33.333333% - 5.336px)');
    expect(getTileButtonFlex(2, 4)).toBe('0 0 calc(50% - 4px)');
    expect(getTileButtonFlex(4, 4)).toBe('0 0 calc(33.333333% - 5.336px)');
    expect(getTileButtonFlex(1, 5)).toBe('0 0 calc(50% - 4px)');
    expect(getTileButtonFlex(3, 5)).toBe('0 0 calc(33.333333% - 5.336px)');
  });
});
