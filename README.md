# \<share-menu\>
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/Dabolus/share-menu)
[![GitHub release](https://img.shields.io/github/release/Dabolus/share-menu/all.svg)](https://github.com/Dabolus/share-menu)

_[Demo and API docs](https://www.webcomponents.org/element/Dabolus/share-menu)_

A complete and simple to use share menu for Polymer 2 that uses [Web Share API](https://developers.google.com/web/updates/2016/10/navigator-share) when possible, with a fallback to a nice share menu that tries to emulate the experience of the native one.

_Note that in addition to the support to the Web Share API, your browser needs to be within a [secure context](https://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features) to be able to use it. This components tries to automatically detect it, but it is not 100% reliable, so make sure you take the appropriate measures._

## Features
- Incredibly simple to use. Just set the `title`, `text` and `url` properties and call the `share()` method to make the magic happen.
- Heavily customizable. It is designed to be customized as much as possible by using CSS custom properties and mixins. Check the **Styling** section to see what you can do.
- Compatible with almost any browser. The Web Share API is still quite young, but the fallback menu should work on any of the major browsers, since it mostly uses `window.open` calls.

## Installation
```
bower install --save Dabolus/share-menu
```

## Usage
#### Basic usage
```html
<share-menu id="shareMenu" title="Ohai!" text="Just a test" url="https://www.example.com/"></share-menu>

<button onclick="shareMenu.share()">Share!</button>
```
#### Every property set
```html
<share-menu
  title="Awesome!"
  text="More customized share menu"
  url="https://www.example.com/"
  dialog-title="Share now!"
  copy-success-text="Text copied to clipboard!"
  copy-failed-text="Oh no! Couldn't copy the text automatically :("
  facebook-app-id="<your Facebook App ID to use the Facebook UI share>">
</share-menu>
```

As you can see in this last example, this component allows you to insert your own Facebook App ID to use the Facebook UI share.
It is **heavily recommended** to use it if possible, since it offers a much better user experience.
You can get one [here](https://developers.facebook.com/apps/).

## Supported socials (in the fallback dialog)
Here you can see the list of the supported socials, as well as the limitations that each one gives:

 - Email
 - Evernote - _URL only_
 - Facebook - _URL only if not using a Facebook App with the `facebook-app-id` parameter_
 - Google+ - _URL only_
 - LinkedIn - _URL and title only_
 - Pinterest - _Only works well if the URL is an image (for obvious reasons). The title is used as the image description._
 - Reddit - _Shares an URL if there is no text provided, otherwise a text with the URL appended at the end will be shared._ 
 - Skype - _URL only_
 - SMS
 - Telegram
 - Tumblr
 - Twitter
 - Viber
 - VKontakte - _URL only_
 - WhatsApp

## Icons
The icons used by the component are a special iconset, so you can also use them everywhere in your app by importing `social-icons.html` located in this package.

## Styling

The following custom properties and mixins are available for styling:

| Custom property                   | Description                                                                          | Default   |
| --------------------------------- | ------------------------------------------------------------------------------------ | --------- |
| `--dialog-background-color`       | The background color of the dialogs                                                  | `white`   |
| `--dialog-text-color`             | The text color of the dialogs                                                        | `black`   |
| `--toast-background-color`        | The background color of the "copied to clipboard" toast                              | `#323232` |
| `--toast-text-color`              | The text color of the "copied to clipboard" toast                                    | `#f1f1f1` |
| `--clipboard-fallback-url-color`  | The text color of the fallback url color (when automatic copying to clipboard fails) | `#ff6d00` |
| `--share-dialog`                  | Mixin applied to the share dialog                                                    | `{}`      |
| `--copy-dialog`                   | Mixin applied to the "copy to clipboard" fallback dialog                             | `{}`      |
| `--dialog-title`                  | Mixin applied to the share dialog title                                              | `{}`      |
| `--social-icon`                   | Mixin applied to the social icons                                                    | `{}`      |
| `--social-text`                   | Mixin applied to the text under the social icons (the social name)                   | `{}`      |
| `--clipboard-fallback-url-header` | Mixin applied to the header of the "copy to clipboard" fallback dialog               | `{}`      |
| `--clipboard-fallback-url`        | Mixin applied to the url of the "copy to clipboard" fallback dialog                  | `{}`      |
