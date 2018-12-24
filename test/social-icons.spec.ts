// tslint:disable:no-string-literal
import '@skatejs/ssr/register';
import * as socialIcons from '../src/social-icons';

describe('Social Icons', () => {
  Object.entries(socialIcons).map(([key, value]: [string, string]) =>
    describe(`${key} icon`, () => {
      it('should weigh less than 5kb', () => {
        expect(value.length).toBeLessThanOrEqual(5120);
      });
    }));
});
