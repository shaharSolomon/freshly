import { addDays, toDateKey } from '@/domain/dates';

import { linesToDrafts } from './receipt';

describe('linesToDrafts', () => {
  const day = new Date(2026, 9, 22);

  it('uses the shelf life the model suggested and falls back to the category', () => {
    const drafts = linesToDrafts(
      [
        { name: ' חזה עוף ', quantity: 1, price: 32.9, category: 'meat', shelf_life_days: 2, perishable: true },
        { name: 'קוטג׳', quantity: 2.4, price: null, category: 'nonsense', shelf_life_days: null, perishable: true },
        { name: '  ', quantity: 1, price: 1, category: 'other', shelf_life_days: null, perishable: false },
      ],
      day,
    );
    expect(drafts).toEqual([
      { name: 'חזה עוף', category: 'meat', quantity: 1, price: 32.9, expiresOn: toDateKey(addDays(day, 2)), expirySource: 'estimated' },
      { name: 'קוטג׳', category: 'dairy', quantity: 2, price: undefined, expiresOn: toDateKey(addDays(day, 7)), expirySource: 'estimated' },
    ]);
  });
});
