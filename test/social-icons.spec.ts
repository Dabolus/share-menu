// tslint:disable:no-string-literal
import '@skatejs/ssr/register';
import * as socialIcons from '../src/social-icons';

describe('Social Icons', () => {
  it('contains SVGs that are less than 5kb each', () => {
    Object.values(socialIcons).forEach((icon: string) =>
      expect(icon.length).toBeLessThanOrEqual(5120));
  });
});
