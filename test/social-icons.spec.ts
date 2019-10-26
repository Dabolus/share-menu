import { expect } from '@open-wc/testing';
import * as socialIcons from '../src/social-icons';

describe('social icons', () => {
  Object.entries(socialIcons).map(([key, value]: [string, string]) =>
    describe(`${key} icon`, () => {
      it('weighs less than 1kb', () => {
        expect(value.length).to.be.below(1024);
      });
    }),
  );
});
