import moment from 'moment-business-days';
import * as api from '../src/utils/api';

describe('API test', () => {
  test('geHolidays', () => {
    expect.assertions(1);
    return api.getHolidays(moment().subtract(1, 'y'), moment().add(1, 'y'))
      .then((h) => {
        expect(h).toEqual(expect.anything());
      });
  });
});

