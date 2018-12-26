// tslint:disable:no-string-literal
import '@skatejs/ssr/register';
import * as socialIcons from '../src/social-icons';

describe('Social Icons', () => {
  Object.entries(socialIcons).map(([key, value]: [string, string]) =>
    describe(`${key} icon`, () => {
      it('weighs less than 3kb', () => {
        expect(value.length).toBeLessThanOrEqual(3072);
      });

      it('has a view box of 256x256', () => {
        expect(value).toContain('viewBox="0 0 256 256"');
      });

      it('does not have fixed width and height', () => {
        const openingTag = value.substring(0, value.indexOf('>'));
        expect(openingTag).not.toContain('width');
        expect(openingTag).not.toContain('height');
      });
    }));
});
