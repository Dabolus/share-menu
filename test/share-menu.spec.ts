import { html, fixture, expect } from '@open-wc/testing';
import { fake } from 'sinon';
import '../src/share-menu';
import { ShareMenu } from '../src/share-menu';

// We need to do this because navigator.share does not currently exist in TypeScript typings
interface ShareOptions {
  url?: string;
  text?: string;
  title?: string;
}

interface NavigatorWithShare extends Navigator {
  share: (options: ShareOptions) => Promise<void>;
}

describe('share menu', async () => {
  const shareMenu: ShareMenu = await fixture(html`
    <share-menu></share-menu>
  `);

  describe('native share via Web Share API', async () => {
    const fakeShare = fake(async () => {});
    (window.navigator as NavigatorWithShare).share = fakeShare;

    it('uses the Web Share API if available', async () => {
      await expect(() => shareMenu.share()).not.to.throw();
      expect(fakeShare.calledOnce).to.equal(true);
    });

    it("emits a 'share' event with 'native' as origin", async () => {
      const listener = fake(({ detail: { origin } }: CustomEvent) => {
        expect(origin).to.equal('native');
      });
      shareMenu.addEventListener('share', listener);
      await shareMenu.share();
      shareMenu.removeEventListener('share', listener);
      expect(listener.calledOnce).to.equal(true);
    });
  });

  describe('share via fallback dialog', () => {
    it('defaults to all supported socials unless specified', () => {
      expect(shareMenu.socials).to.deep.equal(
        Object.keys(shareMenu['_supportedSocials']),
      );
    });
  });
});
