# \<share-menu\>

[![Build status](https://github.com/Dabolus/share-menu/workflows/Lint%2C%20test%20and%20build/badge.svg)](https://github.com/Dabolus/share-menu/actions?query=workflow%3A%22Lint%2C+test+and+build%22)
[![Code quality](https://app.codacy.com/project/badge/Grade/6d329cda2e744d94b4dfaa9d99848b1b)](https://app.codacy.com/gh/Dabolus/share-menu/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Code coverage](https://app.codacy.com/project/badge/Coverage/6d329cda2e744d94b4dfaa9d99848b1b)](https://app.codacy.com/gh/Dabolus/share-menu/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/share-menu)
[![Release](https://img.shields.io/github/release/Dabolus/share-menu/all.svg)](https://github.com/Dabolus/share-menu)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/share-menu.svg)](https://bundlephobia.com/result?p=share-menu)

_[Demo and API docs](https://www.webcomponents.org/element/share-menu)_

A complete and simple to use share menu that uses
[Web Share API](https://developers.google.com/web/updates/2016/10/navigator-share)
when possible, with a fallback to a nice share menu that tries to emulate the
experience of the native one.

## Features

- Incredibly simple to use. Just set one of the `title`, `text`, `url`, or
  `image` properties and call the `share()` method to make the magic happen;
- Highly customizable. It offers a great material design UI by default, but
  it is also designed to be as much customizable as possible through CSS custom
  properties and shadow parts. It also offers lots of built-in share targets
  and presets, with support for custom ones if needed;
- Compatible with any major browser. The Web Share API is still quite young,
  but the fallback dialog works on any browser supporting Custom Elements
  (directly or through a polyfill). Unlike the native share menu, the fallback
  will also work on desktop browsers and insecure contexts, so you will be able
  to offer a much more coherent experience to your users;
- Lightweight. The `share-menu` element itself weighs ~11.7 KB (~3.7 KB when
  compressed), while each built-in share target weighs on average ~700B (less
  than half the size when compressed);
- Thoroughly tested. Both the native and fallback behaviors are covered by tests,
  including each share target and preset. Minimum code coverage is set to 90% to
  ensure that each new feature maintains a high level of quality.

## Installation

```bash
npm i share-menu
# or
yarn add share-menu
# or
bun i share-menu
```

## Without npm/yarn/bun

If you just want to directly include the script without installing it as a dependency, use the `jsDelivr` ESM CDN (`esm.run`):

```html
<!-- Main component -->
<script type="module" src="https://esm.run/share-menu@5.1.0"></script>
<!-- Single share target -->
<script
  type="module"
  src="https://esm.run/share-menu@5.1.0/targets/email.js"
></script>
<!-- Share target preset -->
<script
  type="module"
  src="https://esm.run/share-menu@5.1.0/targets/presets/all.js"
></script>
```

## Try it now!

Try copy-pasting this code on your browser's console in any website:

```js
var a = document.createElement('script');
a.type = 'module';
a.textContent =
  'import"https://esm.run/share-menu@5.1.0";import"https://esm.run/share-menu@5.1.0/targets/presets/all.js";var b=document.createElement("share-menu"),c=document.createElement("share-target-preset-all");b.appendChild(c),document.body.appendChild(b),b.share();';
document.head.appendChild(a);
```

_**Note:** these scripts will not work if the website implements a strict CSP
(Content Security Policy). For example, these scripts won't work on GitHub._

## Usage

#### Basic usage

```html
<share-menu
  id="basicShareMenu"
  title="Ohai!"
  text="Just a test"
  url="https://www.example.com/"
  image="https://www.example.com/image.png"
>
  <share-target-preset-all></share-target-preset-all>
</share-menu>

<button onclick="basicShareMenu.share()">Share!</button>
```

#### With more configuration options and custom share targets

```html
<share-menu
  id="customShareMenu"
  title="Awesome!"
  text="More customized share menu"
  url="https://www.example.com/"
  image="https://www.example.com/image.png"
  dialog-title="Share now"
  copy-hint="Copy to clipboard"
  handle="always"
  no-backdrop
>
  <share-target-email></share-target-email>
  <share-target-facebook></share-target-facebook>
  <share-target-telegram></share-target-telegram>
</share-menu>

<button onclick="customShareMenu.share()">Share!</button>
```

## Defining the share targets (for the fallback dialog)

### Built-in targets

This component comes with a large number of built-in targets that can be used
to share content to the most popular social networks and messaging apps. These
targets can be found in the `targets` folder and can be imported as follows:

```js
import 'share-menu/targets/<target>.js';
```

Here you can see the list of the built-in targets, as well as the capabilities
and limitations of each of them:

| Target                | Title | Text | URL | Image | Notes                                                                                                                       |
| --------------------- | ----- | ---- | --- | ----- | --------------------------------------------------------------------------------------------------------------------------- |
| Clipboard             | ✅    | ✅   | ✅  | ✅    | Copying images is not supported on Firefox                                                                                  |
| Blogger               | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| Bluesky               | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| Diaspora              | ✅    | ❌   | ✅  | ❌    |                                                                                                                             |
| Douban                | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| Email                 | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| Evernote              | ✅    | ❌   | ✅  | ❌    |                                                                                                                             |
| Facebook              | ✅    | ✅   | ✅  | ❌    | URL only if not using [Facebook JS SDK](https://developers.facebook.com/docs/javascript) or not providing a Facebook App ID |
| Flipboard             | ✅    | ❌   | ✅  | ❌    |                                                                                                                             |
| Gmail                 | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| Google Translate      | ❌    | ❌   | ✅  | ❌    | Translates the page at the given URL                                                                                        |
| Hacker News           | ✅    | ❌   | ✅  | ❌    |                                                                                                                             |
| Instapaper            | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| KakaoTalk             | ❌    | ❌   | ✅  | ❌    |                                                                                                                             |
| LINE                  | ❌    | ❌   | ✅  | ❌    |                                                                                                                             |
| LinkedIn              | ❌    | ❌   | ✅  | ❌    |                                                                                                                             |
| LiveJournal           | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| Mastodon              | ✅    | ✅   | ✅  | ❌    | Uses [toot](https://toot.kytta.dev/) to ask for the instance on which to share the content                                  |
| Messenger             | ❌    | ❌   | ✅  | ❌    | Requires a Facebook App ID                                                                                                  |
| Mix                   | ❌    | ❌   | ✅  | ❌    |                                                                                                                             |
| Odnoklassniki (OK.ru) | ✅    | ✅   | ✅  | ✅    |                                                                                                                             |
| Pinterest             | ✅    | ✅   | ✅  | ✅    |                                                                                                                             |
| Pocket                | ❌    | ❌   | ✅  | ❌    |                                                                                                                             |
| Print                 | ❌    | ❌   | ✅  | ❌    | Prints the page at the given URL                                                                                            |
| QZone                 | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| Reddit                | ✅    | ✅   | ✅  | ❌    | Shares an URL if there is no text provided, otherwise a text with the URL appended at the end                               |
| Skype                 | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| SMS                   | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| Snapchat              | ❌    | ❌   | ✅  | ❌    |                                                                                                                             |
| Substack Notes        | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| Telegram              | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| Tumblr                | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| X (Twitter)           | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| VKontakte (VK)        | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| Weibo                 | ✅    | ✅   | ✅  | ✅    |                                                                                                                             |
| WhatsApp              | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |
| XING                  | ❌    | ❌   | ✅  | ❌    |                                                                                                                             |
| Yahoo Mail            | ✅    | ✅   | ✅  | ❌    |                                                                                                                             |

### Presets

Given the large number of built-in targets, it can be quite tedious to add them
all to the share menu. For this reason, this component offers a few presets
that can be used to add a collection of targets at once. Presets can be found
in the `targets/presets` folder and can be imported as follows:

```js
import 'share-menu/targets/presets/<preset>.js';
```

Here is the list of the available presets, together with the targets included
in each of them:

| Preset           | Targets included                                                                                                                  | Notes                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| All              | All the built-in targets                                                                                                          | Requires Facebook App ID for Messenger to be displayed |
| Top 15 Worldwide | Facebook, Messenger, WhatsApp, Weibo, Telegram, Snapchat, QZone, Pinterest, X (Twitter), Reddit, LinkedIn, Tumblr, Douban, VK, OK | Requires Facebook App ID for Messenger to be displayed |

### Custom share targets

Share targets in the fallback dialog are just simple HTML custom elements that
implement the `ShareTarget` interface. More specifically, they must expose:

- A `displayName` field that contains the name of the target;
- A `color` field that contains the hex color of the target **without the hash**;
- An `icon` field that contains the SVG path of the icon of the target;
  **Only the path must be provided** (i.e. what you have inside the the `d` attribute of your SVG), **not the whole SVG**.
  Icon must will be rendered inside a 256x256 viewBox, so make sure that the icon fits correctly inside that area;
- A `share` method that takes the `ShareMenu` instance as parameter and that performs
  the actual share action when the target button is clicked;
- Optionally, an `outline` field that contains the hex color of the outline of the target **without the hash**;
- Optionally, a `hint` field that contains an additional hint text for the target.

See [any of the built-in targets](./src/targets/) for a practical example on how to implement yours.

## Styling

The following custom properties and shadow parts are available for styling:

| Property                          | Description                                             | Default   |
| --------------------------------- | ------------------------------------------------------- | --------- |
| `--sm-backdrop-color`             | The color of the backdrop                               | `#000`    |
| `--sm-background-color`           | The background color                                    | `#ece6f0` |
| `--sm-clipboard-background-color` | The background color of the "copy to clipboard" section | `#e6e0e9` |
| `--sm-title-color`                | The color of the title                                  | `#1c1b1f` |
| `--sm-ripple-color`               | The color of the ripple effect                          | `#fff`    |
| `--sm-labels-color`               | The color of the social labels                          | `#1c1b1f` |
| `--sm-hint-color`                 | The color of the hint labels                            | `#49454e` |
| `--sm-handle-color`               | The color of the handle on top of the dialog            | `#79747e` |
| `--sm-divider-color`              | The color of the dividers                               | `#c4c7c5` |
| `--sm-preview-color`              | The color of the preview of what is being shared        | `#49454e` |

| Part            | Description                             |
| --------------- | --------------------------------------- |
| `dialog`        | The part assigned to the dialog         |
| `backdrop`      | The part assigned to the backdrop       |
| `title`         | The part assigned to the title          |
| `social-button` | The part assigned to each social button |
| `social-icon`   | The part assigned to each social icon   |
| `social-label`  | The part assigned to each social label  |

_Note: for obvious reasons, these custom properties and shadow parts are not available when using the native share menu._
