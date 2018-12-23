# \<share-menu\>
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/share-menu)
[![GitHub release](https://img.shields.io/github/release/Dabolus/share-menu/all.svg)](https://github.com/Dabolus/share-menu)

_[Demo and API docs](https://www.webcomponents.org/element/Dabolus/share-menu)_

A complete and simple to use share menu that uses 
[Web Share API](https://developers.google.com/web/updates/2016/10/navigator-share) 
when possible, with a fallback to a nice share menu that tries to emulate the 
experience of the native one.

## Features
- Incredibly simple to use. Just set the `title`, `text`, `url` and `via` 
  properties and call the `share()` method to make the magic happen.
- Highly customizable. It offers a great material design UI by default, but 
  it is also designed to be as much customizable as possible through CSS custom 
  properties and shadow parts.
- Compatible with any major browser. The Web Share API is still quite young, but 
  the fallback dialog works on any browser supporting Custom Elements (directly 
  or through a polyfill). Unlike the native share menu, the fallback will also 
  work on desktop browsers and insecure contexts, so you will be able to offer 
  a much more coherent experience to your users.

## Installation
```bash
npm i share-menu
# or
yarn add share-menu
```

## Without npm/yarn
If you don't use npm or yarn, an IIFE (Immediately Invoked Function Expression) 
version of the element is also provided. The IIFE version of the element can 
also be used if you're still on Bower  (e.g. if you're using Polymer < 3). To 
use it, just use the `unpkg` CDN:

```html
<script src="https://unpkg.com/share-menu@3.0.1/social-icons.iife.js"></script>
<script src="https://unpkg.com/share-menu@3.0.1/share-menu.iife.js"></script>
```

## Try it now!
Try copy-pasting this code on your browser's console in any website:
```js
var a=document.createElement("script");a.type="module";a.textContent="import'https://unpkg.com/share-menu/share-menu.min.js';var a=document.createElement('share-menu');document.body.appendChild(a),a.share()";document.head.appendChild(a);
```
...or the IIFE version
```js
var a=document.createElement("script");a.src="https://unpkg.com/share-menu/share-menu.iife.min.js";a.onload=()=>{var c=document.createElement("share-menu");document.body.appendChild(c);c.share()};var b=document.createElement("script");b.src="https://unpkg.com/share-menu/social-icons.iife.min.js";b.onload=()=>document.head.appendChild(a);document.head.appendChild(b);
```
_**Note:** these scripts will not work if the website implements a strict CSP 
(Content Security Policy). For example, these scripts won't work on GitHub._

## Usage
#### Basic usage
```html
<share-menu id="shareMenu" title="Ohai!" text="Just a test" url="https://www.example.com/"></share-menu>

<button onclick="shareMenu.share()">Share!</button>
```
#### All the properties set
```html
<share-menu
  title="Awesome!"
  text="More customized share menu"
  url="https://www.example.com/"
  via="Dabolus"
  dialog-title="Share now!"
  is-image="auto"
  no-backdrop>
</share-menu>
```

## Supported socials (in the fallback dialog)
Here you can see the list of the supported socials, as well as the limitations 
that each one gives:

 - Baidu - _URL and title only_
 - Blogger
 - Buffer - _URL and title only_
 - Copy to clipboard
 - Delicious - _URL and title only_
 - Digg - _URL and title only_
 - Douban - _URL and title only_
 - Email
 - Evernote - _URL only_
 - Facebook - _URL only if not using [Facebook JS SDK](https://developers.facebook.com/docs/javascript)_
 - FlipBoard - _URL and title only_
 - Google+ - _URL only_
 - Instapaper
 - Line - _URL only_
 - LinkedIn
 - LiveJournal
 - Myspace
 - Odnoklassniki (OK.ru) - _URL and title only_
 - Pinterest - _Will only be visible if the URL is an image. Look for the `isImage` parameter on the API docs for more info_
 - Pocket - _URL only_
 - Print - _Only prints the page at the given URL_
 - QZone - _URL only_
 - Reddit - _Shares an URL if there is no text provided, otherwise a text with the URL appended at the end will be shared._ 
 - RenRen - _Currently disabled because it does not seem to work_
 - Skype - _URL only_
 - SMS
 - StumbleUpon - _URL and title only_
 - Telegram
 - Translate - _Only translates the page at the given URL_
 - Tumblr
 - Twitter
 - Viber
 - VKontakte - _URL only_
 - Weibo
 - WhatsApp
 - WordPress
 - Xing - _URL only_
 - Yahoo

_The `via` parameter will only be used by Delicious, LinkedIn and Twitter._

## Icons
The icons used by the component are just simple SVGs, so you can use them anywhere in your app simply by importing 
`social-icons.js` located in this package.

## Styling
The following custom properties and shadow parts are available for styling:

| Property             | Description                                                       | Default              |
| -------------------- | ----------------------------------------------------------------- | -------------------- |
| `--backdrop-color`   | The color of the backdrop                                         | `#000`               |
| `--background-color` | The background color of the fallback dialog                       | `#fff`               |
| `--title-color`      | The color of the title of the fallback dialog                     | `rgba(0, 0, 0, .6)`  |
| `--ripple-color`     | The color of the ripple of the fallback dialog                    | `#000`               |
| `--labels-color`     | The color of the social labels of the fallback dialog             | `rgba(0, 0, 0, .87)` |
| `dialog`             | The part assigned to the fallback dialog                          | `-`                  |
| `backdrop`           | The part assigned to the backdrop of the fallback dialog          | `-`                  |
| `title`              | The part assigned to the title of the fallback dialog             | `-`                  |
| `social-button`      | The part assigned to each social button of the fallback dialog    | `-`                  |
| `social-icon`        | The part assigned to each social icon of the fallback dialog      | `-`                  |
| `social-label`       | The part assigned to each social label of the fallback dialog     | `-`                  |
