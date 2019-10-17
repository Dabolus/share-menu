import '@skatejs/ssr/register';
import * as socialIcons from '../src/social-icons';

describe('Social Icons', () => {
  Object.entries(socialIcons).map(([key, value]: [string, string]) =>
    describe(`${key} icon`, () => {
      const openingTag = value.substring(0, value.indexOf('>'));

      it('weighs less than 1kb', () => {
        expect(value.length).toBeLessThan(1024);
      });

      it('has a view box of 256x256', () => {
        expect(openingTag).toContain('viewBox="0 0 256 256"');
      });

      it('does not have fixed width and height', () => {
        expect(openingTag).not.toContain('width');
        expect(openingTag).not.toContain('height');
      });
    }),
  );
});
