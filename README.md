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

- Incredibly simple to use. Just set the `title`, `text`, and `url`
  properties and call the `share()` method to make the magic happen.
- Highly customizable. It offers a great material design UI by default, but
  it is also designed to be as much customizable as possible through CSS custom
  properties and shadow parts.
- Compatible with any major browser. The Web Share API is still quite young, but
  the fallback dialog works on any browser supporting Custom Elements (directly
  or through a polyfill). Unlike the native share menu, the fallback will also
  work on desktop browsers and insecure contexts, so you will be able to offer
  a much more coherent experience to your users.
- Lightweight. If correctly minified (read the note about the bundle size below),
  the `share-menu` element itself weighs 13.18 KB (4.34 KB gzipped, 3.76 KB brotli),
  while the icons weigh 12.24 KB (5.66 KB gzipped, 4.9 KB brotli), for a total of
  10 KB gzipped size and 8.66 KB brotli size.

#### Note about the bundle size

The share menu repetitively uses some private helpers to avoid code duplication.
As a standard, these helpers always start with an underscore (\_), so you can easily
drop the bundle size by telling your JS compiler to mangle all properties that start
with an underscore (to be safe, I would suggest to only apply this rule to the share
menu, but you might also get a smaller bundle size by applying this rule to any package,
since a property starting with an underscore is generally considered private).
For example, if you use Terser you might configure it in this way:

```js
{
  mangle: {
    properties: {
      regex: /^_/,
    },
  },
}
```

By simply applying this rule, the minified package goes from 14.92 KB
(4.5 KB gzipped, 3.93 KB brotli) to 13.18 KB (4.34 KB gzipped, 3.76 KB brotli).
Note that the provided minified version already applies these optimizations, so you can
directly import it if you want to same some bytes without having to change your compiler
configuration.

## Installation

```bash
npm i share-menu
# or
yarn add share-menu
```

## Without npm/yarn

If you just want to directly include the script without installing it as a dependency, use the `unpkg` CDN:

```html
<script type="module" src="https://unpkg.com/share-menu@5.0.0-rc.2"></script>
```

## Try it now!

Try copy-pasting this code on your browser's console in any website:

```js
var a = document.createElement('script');
a.type = 'module';
a.textContent =
  "import'https://unpkg.com/share-menu@5.0.0-rc.2';var a=document.createElement('share-menu');document.body.appendChild(a),a.share()";
document.head.appendChild(a);
```

_**Note:** these scripts will not work if the website implements a strict CSP
(Content Security Policy). For example, these scripts won't work on GitHub._

## Usage

#### Basic usage

```html
<share-menu
  id="shareMenu"
  title="Ohai!"
  text="Just a test"
  url="https://www.example.com/"
></share-menu>

<button onclick="shareMenu.share()">Share!</button>
```

#### All the properties set

```html
<share-menu
  title="Awesome!"
  text="More customized share menu"
  url="https://www.example.com/"
  dialog-title="Share now!"
  no-backdrop
>
</share-menu>
```

## Supported targets (in the fallback dialog)

Here you can see the list of the supported targets, as well as the limitations
that each one gives:

- Copy to clipboard
- Blogger
- Diaspora - _URL and title only_
- Douban
- Email
- Evernote - _URL and title only_
- Facebook - _URL only if not using [Facebook JS SDK](https://developers.facebook.com/docs/javascript) or not providing a Facebook App ID_
- FlipBoard - _URL and title only_
- Gmail
- Google Translate - _Only translates the page at the given URL_
- Hacker News - _URL and title only_
- Instapaper
- LINE - _URL only_
- LinkedIn - _URL only_
- LiveJournal
- Odnoklassniki (OK.ru)
- Pinterest
- Pocket - _URL only_
- Print - _Only prints the page at the given URL_
- QZone
- Reddit - _Shares an URL if there is no text provided, otherwise a text with the URL appended at the end_
- Skype
- SMS
- Telegram
- Tumblr
- Twitter
- Messenger - _URL only, requires a Facebook App ID_
- VKontakte (VK)
- Weibo
- WhatsApp
- XING - _URL only_
- Yahoo Mail
- Substack Notes

## Custom share targets

Share targets in the fallback dialog are just simple HTML custom elements that
implement the `ShareTarget` interface. More specifically, they must expose:

- A `displayName` field that contains the name of the target;
- A `color` field that contains the hex color of the target **without the hash**;
- An `icon` field that contains the SVG path of the icon of the target;
  **Only the path must be provided** (i.e. what you have inside the the `d` attribute of your SVG), **not the whole SVG**.
  Icon must will be rendered inside a 256x256 viewBox, so make sure that the icon fits correctly inside that area;
- A `share` method that takes the `ShareMenu` instance as parameter and that performs
  the actual share action when the target button is clicked;
- Optionally, a `hint` field that contains a hint for the target.

See [any of the built-in targets](./src/targets/) for a practical example on how to implement yours.

## Styling

The following custom properties and shadow parts are available for styling:

| Property             | Description                                      | Default              |
| -------------------- | ------------------------------------------------ | -------------------- |
| `--backdrop-color`   | The color of the backdrop                        | `#000`               |
| `--background-color` | The background color                             | `#fff`               |
| `--title-color`      | The color of the title                           | `rgba(0, 0, 0, .6)`  |
| `--ripple-color`     | The color of the ripple effect                   | `#000`               |
| `--labels-color`     | The color of the social labels                   | `rgba(0, 0, 0, .87)` |
| `--hint-color`       | The color of the hint labels                     | `rgba(0, 0, 0, .6)`  |
| `--handle-color`     | The color of the handle on top of the dialog     | `rgba(0, 0, 0, .6)`  |
| `--divider-color`    | The color of the dividers                        | `rgba(0, 0, 0, .12)` |
| `--preview-color`    | The color of the preview of what is being shared | `rgba(0, 0, 0, .6)`  |
| `dialog`             | The part assigned to the dialog                  | -                    |
| `backdrop`           | The part assigned to the backdrop                | -                    |
| `title`              | The part assigned to the title                   | -                    |
| `social-button`      | The part assigned to each social button          | -                    |
| `social-icon`        | The part assigned to each social icon            | -                    |
| `social-label`       | The part assigned to each social label           | -                    |

_Note: for obvious reasons, these custom properties and shadow parts are not available when using the native share menu._
