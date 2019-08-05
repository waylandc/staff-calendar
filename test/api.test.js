import moment from 'moment-business-days';
import * as api from '../src/utils/api';

describe('API test', () => {
  test('geHolidays', () => {
    expect.assertions(1);
    return api.getHolidays(moment().startOf('year'), moment().endOf('year'))
      .then((h) => {
        expect(h).toEqual(expect.anything());
      });
  });
});

