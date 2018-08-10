## Twitter Demetricator

[Twitter Demetricator](http://bengrosser.com/projects/twitter-demetricator/) is a web browser extension that hides all the metrics on Twitter.

![Twitter Screenshot](https://cdn.rawgit.com/bengrosser/twitter-demetricator/master/td-toggle.gif)

### Description
The Twitter interface is filled with numbers. These numbers, or metrics, measure and present our social value and activity online, enumerating followers, likes, retweets, and more. But what are the effects of these numbers on who we follow, what we post, or how we feel when we use the site? Inviting us to consider these questions through our own experience, Twitter Demetricator is a web browser extension that hides the metrics. Follower, like, and notification counts disappear. “29.2K Tweets” under a trending hashtag becomes, simply, “Tweets”. Through changes like these, Demetricator lets us try out Twitter without the numbers, to see what happens when we can no longer judge ourselves and others in metric terms. With this work, I aim to disrupt our obsession with social media metrics, to reveal how they guide our behavior, and to ask who most benefits from a system that quantifies our public interactions online.

### Supported Browsers

Twitter Demetricator is released as a Chrome extension and a Firefox Add-on, and as a userscript for use with Tampermonkey in any browser (including Safari, Edge, and Opera). Other browsers may be supported if they support userscripts in some way, but have not been tested.

### Options

Both browser implementations include an option to toggle the metric hiding. In Chrome, click on the extension's icon adjacent to the location bar to manipulate the toggle. In the rest, use Ctrl-D to toggle the hiding.

### Files

* chrome/\* source for the Chrome extension
* firefox/\* source for the Firefox addon 
* twitter-demetricator.user.js for the raw userscript
* twitter-demetricator.meta.js is used on my server for update notifications

### Related Projects

* [Facebook Demetricator](http://github.com/bengrosser/facebook-demetricator)
