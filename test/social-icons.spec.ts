import { expect } from '@open-wc/testing';
import * as socialIcons from '../src/social-icons';

describe('social icons', () => {
  Object.entries(socialIcons).map(([key, value]: [string, string]) =>
    describe(`${key} icon`, () => {
      const openingTag = value.substring(0, value.indexOf('>'));

      it('weighs less than 1kb', () => {
        expect(value.length).to.be.below(1024);
      });

      it('has a view box of 256x256', () => {
        expect(openingTag).to.contain('viewBox="0 0 256 256"');
      });

      it('does not have fixed width and height', () => {
        expect(openingTag).not.to.contain('width');
        expect(openingTag).not.to.contain('height');
      });
    }),
  );
});
