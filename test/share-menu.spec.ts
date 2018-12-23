// tslint:disable:no-string-literal
import '@skatejs/ssr/register';
import { ShareMenu } from '../src/share-menu';

// We need to do this because navigator.share and navigator.clipboard do not currently exist in TypeScript typings
interface IShareOptions {
  url?: string;
  text?: string;
  title?: string;
}

interface IClipboard {
  read: () => Promise<DataTransfer>;
  readText: () => Promise<string>;
  write: (dataTransfer: DataTransfer) => Promise<void>;
  writeText: (newClipText: string) => Promise<void>;
}

interface INavigatorWithShare extends Navigator {
  share: (options: IShareOptions) => Promise<void>;
  clipboard: IClipboard;
}

declare var navigator: INavigatorWithShare;

describe('Share Menu', () => {
  const shareMenu = new ShareMenu();

  describe('Native share via Web Share API', () => {
    // undom does not provide navigator.share by default, so we have to mock it in this way
    beforeAll(() => navigator.share = () => Promise.resolve());
    afterAll(() => delete navigator.share);

    it('uses the Web Share API if available', async () => {
      await expect(shareMenu.share()).resolves.not.toThrow();
    });

    it(`emits a 'share' event with 'native' as origin`, async () => {
      const listener = jest.fn();
      shareMenu.addEventListener('share', listener);
      await shareMenu.share();
      shareMenu.removeEventListener('share', listener);
      expect(listener).toBeCalledTimes(1);
    });
  });

  describe('Share via fallback dialog', () => {
    it('defaults to all supported socials unless specified', () => {
      expect(shareMenu.socials).toEqual(Object.keys(shareMenu['_supportedSocials']));
    });
  });
});
