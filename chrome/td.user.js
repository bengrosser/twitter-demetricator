// // ==UserScript==
// @name        Twitter Demetricator
// @version     1.1.8
// @namespace   twitterdemetricator
// @description Hides all the metrics on Twitter
// @author      Ben Grosser
// @homepage    https://bengrosser.com/projects/twitter-demetricator/
// 
// @updateURL   https://bengrosser.com/share/td/twitter-demetricator.meta.js
// @downloadURL https://bengrosser.com/share/td/twitter-demetricator.user.js
// @icon        https://bengrosser.com/share/td/td-logo-128.png
//
// @match       *://twitter.com/*
// @match       *://tweetdeck.twitter.com/*
// @exclude     *://*.twitter.com/i/cards/*
// @exclude     *://analytics.twitter.com/*
// @exclude     *://platform.twitter.com/widgets/*
// @grant       none
// @run-at      document-start
// ==/UserScript==

////////////////////////////////////////////////////////////
//
// Twitter Demetricator (2018)
// web browser extension
//
// --by Ben Grosser
//
// https://bengrosser.com/projects/twitter-demetricator/
//
// Eternal thanks to my beta testers! -->
//  - Elinor Carmi
//  - Clive Thompson
//  - Nathan Jurgenson
//  - Luke Stark
//  - Maddie Wallace
//  - David Zweig
//  - Goran Bolin
//  - Kevin Hamilton
//  - Mark Marino
//  - Anna Masoner
//  - Frank Pasquale
//  - Jill Walker Rettberg
//
//  Language Support:
//  Twitter Demetricator has been written to support 
//  a variety of languages automatically. More work could
//  be done in this area, but at the moment it is 
//  fully supporting at least the following:
//  - English
//  - English (UK)
//  - German
//  - French
//  - Italian
//  - Portuguese
//  - Spanish
//  - Dutch
//  - Norwegian
//  - Hungarian
//  - Sweedish
//
//  Additionally, a number of other languages have
//  been tested and have substantial support (with 
//  a small error here or there):
//  - Slovenian
//  - Polish
//  - Danish
//  - Japanese
//
//  (the primary location for errors is the Trending Tweets
//  box on the user's home page. Number formats here vary 
//  wildly.)
//
//
////////////////////////////////////////////////////////////

(function() {

    // KNOWN BUGS
    //
    // views on iframe videos on tweetdeck ... can't get demetrication
    // to happen, though can hide whole '8 views' line
    // 
    // need to rework tweetdeck time demetrication to opacity rather than 
    // hiding ... b/c notifications column twitches on toggle with hide
    //
    // favorite/love icon shifts a few pixels from the added dot,
    // and the dot is a little closer to it than the other icons. 
    // this one is tricky...

    'use strict';

    var IS_CHROME_EXTENSION = true;     // Chrome options/data storage/toggle
    var KEY_CONTROL = false;            // keyboard toggle on ctrl+d
    var demetricated = true;            // launch in demetricated state
    var demetricating = false;            // launch in demetricated state
    var curURL = window.location.href;  
    var version = "1.1.8";

    // variables to hold language-specific text for the new tweets
    // bar and the new notifications bar. this way I can reconstruct
    // the appropriate text when demetricator is toggled
    var tweetBarTextDemetricated       
    var tweetBarTextTemplate;   
    var notificationBarTextDemetricated;
    var notificationBarTextTemplate;
    var resultsBarTextDemetricated;
    var resultsBarTextTemplate;

    var newTwitter = false;
    //var titleResetting = false;

    // a few metrics are easy, hidden via CSS. this style is mirrored in 
    // twitterdemetricator.css in order to inject *before* DOM renders on
    // first load, so need to maintain state in these vars plus that file
    var demetricatedStyle = '.ProfileCardStats-statValue, .ProfileTweet-actionCountForPresentation, .ProfileNav-value, a[data-tweet-stat-count] strong, .ep-MetricAnimation, .ep-MetricValue, .MomentCapsuleLikesFacepile-countNum, .stats li a strong { opacity:0 !important; } .count-wrap { display:hide !important; } div:not(.ProfileTweet-actionList)[aria-label="Tweet actions"] span, div[data-testid="like"] div span, div[data-testid="unlike"] div span, div[data-testid="reply"] div span, div[data-testid="retweet"] div span, div[data-testid="unretweet"] div span, div.r-z2knda.r-1wbh5a2 a > span:first-child, a.r-jwli3a[aria-haspopup] span div div, div.r-7o8qx1 div.r-axxi2z, div.css-1dbjc4n a.css-4rbku5 span.r-vw2c0b, span span.r-jwli3a { display:none; } '; 


    var inverseDemetricatedStyle = '.ProfileCardStats-statValue, .ProfileTweet-actionCountForPresentation, .ProfileNav-value, a[data-tweet-stat-count] strong, .ep-MetricAnimation, .ep-MetricValue, .MomentCapsuleLikesFacepile-countNum, .stats li a strong { opacity:1 !important; } .count-wrap { display:unset !important; } div:not(.ProfileTweet-actionList)[aria-label="Tweet actions"] span, div[data-testid="like"] div span, div[data-testid="unlike"] div span, div[data-testid="reply"] div span, div[data-testid="retweet"] div span, div[data-testid="unretweet"] div span, div.r-z2knda.r-1wbh5a2 a > span:first-child, a.r-jwli3a[aria-haspopup="false"] span div div, div.r-7o8qx1 div.r-axxi2z, div.css-1dbjc4n a.css-4rbku5 span.r-vw2c0b, span span.r-jwli3a { display:inline !important; } '; 

    var tweetDeckDemetricatedStyle = 'span.js-ticker-value, .prf-stats li a strong, .like-count, .retweet-count, .reply-count { opacity:0 !important; }';

    var inverseTweetDeckDemetricatedStyle = 'span.js-ticker-value, .prf-stats li a strong, .like-count, .retweet-count, .reply-count { opacity:1 !important; }';

    var tweetDeckVideosDemetricatedStyle = '#playerContainer .view-counts-display { opacity:0 !important; }'; 

    var inverseTweetDeckVideosDemetricatedStyle = '#playerContainer .view-counts-display { opacity:1 !important; }'; 


    function toggleDemetricator() {

        // turn OFF demetrication :(
        if(demetricated) {
            // remove injected styles and install inverse 
            // (because removing doesn't update as expected)
            // (though remove anyway to keep things tidy)
            
            $('style#demetricator').remove();
            addGlobalStyle(inverseDemetricatedStyle,"inverseDemetricator");

            if(curURL.contains("tweetdeck.twitter")) {
                $('style#tweetDeckDemetricator').remove();
                addGlobalStyle(inverseTweetDeckDemetricatedStyle,
                        "inverseTweetDeckDemetricator");
            }

            if(curURL.contains("i/videos")) {
                $('style#tweetDeckVideosDemetricator').remove();
                addGlobalStyle(inverseTweetDeckVideosDemetricatedStyle,
                        "inverseTweetDeckVideosDemetricator");
            }

            // tab title handled differently on new twitter
            if(newTwitter) {
                var newNotificationsCount = 0; 
                //var notificationNodes = $('nav[aria-label="Primary"] div[dir="auto"]');
                var notificationNodes = $('nav[aria-label="Primary"] div[aria-live="polite"]');

                for(let i = 0; i < notificationNodes.length; i++) {
                    newNotificationsCount += parseInt($(notificationNodes[i]).text()); 
                }

                if(newNotificationsCount != "0") {
                    var oldtitle = $('title').text();
                    //if(!titleResetting)
                        $('title').text("("+newNotificationsCount+") "+oldtitle);
                }

            }
            // new tweets bar and title --
            // if we're on the notifications page, handle 
            // new tweets bar and title differently
            if($('body.NotificationsPage').length > 0) {

                var newNotificationsCount = 
                  $('body.NotificationsPage button.new-tweets-bar').
                    attr('data-item-count');

                // new notifications bar
                if(newNotificationsCount != undefined &&
                   notificationBarTextTemplate != undefined) {

                    var reconstructedNotificationsBarText = 
                        notificationBarTextTemplate.
                        replace('XXX',newNotificationsCount);

                    $('body.NotificationsPage button.new-tweets-bar').
                        text(reconstructedNotificationsBarText);

                    if(newNotificationsCount != "0") {
                        var oldtitle = $('title').text();
                        $('title').
                            text("("+newNotificationsCount+") "+oldtitle);
                    }
                } 
            } 


            else if($('body.AdaptiveSearchPage').length > 0) {
                var newResultsCount = 
                  $('body.AdaptiveSearchPage button.new-tweets-bar').
                    attr('data-item-count');

                // new notifications bar
                if(newResultsCount != undefined &&
                   resultsBarTextTemplate != undefined) {

                    var reconstructedResultsBarText = 
                        resultsBarTextTemplate.
                        replace('XXX',newResultsCount);

                    $('body.AdaptiveSearchPage button.new-tweets-bar').
                        text(reconstructedResultsBarText);


                    if(newResultsCount != "0") {
                        var oldtitle = $('title').text();
                        $('title').
                            text("("+newResultsCount+") "+oldtitle);
                    }
                } 
            }
        
            // everything else handles tab title and 
            // new tweets bar differently
            else {
            
            // new tweets bar(s) and title bar
                var newTweetsCount = 
                    $('body:not(.NotificationsPage):not(.AdaptiveSearchPage) button.new-tweets-bar').
                      attr('data-item-count');

                if(newTweetsCount != undefined && 
                   tweetBarTextTemplate != undefined) {

                  // tab title
                  //
                  // Twitter stops updating metrics on see new tweets
                  // button once it hits 20+, so handle those cases
                  // differently 
                  //
                  // (see, Twitter, you can demetricate!! ... 
                  //  just start at 0, not 20 :))
                  //
                  //  need to check notificationsBar ... prob works same
                  if(parseInt(newTweetsCount) > 19) {
                      // don't need to alter it if it's 20
                      var oldtitle = $('title').text();
                      $('title').text("(*) "+oldtitle);
                  } 

                  // otherwise, between 1-19, hide/show the metrics
                  // as appropriate (in both tweets bar and title bar
                  else if(newTweetsCount != "0") {
                      var reconstructedTweetsBarText = 
                        tweetBarTextTemplate.replace('XXX',newTweetsCount);

                      $('body:not(.NotificationsPage):not(.AdaptiveSearchPage) button.new-tweets-bar').
                        text(reconstructedTweetsBarText);

                      var oldtitle = $('title').text();
                      $('title').text("("+newTweetsCount+") "+oldtitle);
                  }
                }

                if(newTwitter) {
                    var newNotificationsCount = 0; 
                    //var notificationNodes = $('nav[aria-label="Primary"] div[dir="auto"]');
                    var notificationNodes = $('nav[aria-label="Primary"] div[aria-live="polite"]');

                    for(let i = 0; i < notificationNodes.length; i++) {
                        newNotificationsCount += parseInt($(notificationNodes[i]).text()); 
                    }

                    if(newNotificationsCount != "0") {
                        var oldtitle = $('title').text();
                        // if oldtitle hasn't been restored yet
                        // messy, but will work until twitter fully transitions to new twitter
                        // then will rewrite clean
                        if(oldtitle.match(/\(/) == null) 
                            $('title').text("("+newNotificationsCount+") "+oldtitle);
                    }
                }
            }

            // navbar metrics (e.g. on Notifications or Messages
            $('.count-inner').css('color','#fff');
            //$('nav[aria-label="Primary"] div[dir="auto"]').css('color','#fff');
            $('nav[aria-label="Primary"] div[aria-live="polite"]').css('color','#fff');

            // catch everything else tagged for hide/show
            $('.notdemetricated').show();
            $('.demetricated').hide();

            // tooltips re-present (hidden) metrics, so re-enable
            $('.demetricate-tooltip').
                addClass('js-tooltip').
                removeClass('js-tooltip-demetricated');

            // record state
            demetricated = false;
        } 
        
        // show the metrics :(
        else {
            demetricating = true;
            // remove inverse injected style and (re)install demetricated style
            // (removing doesn't update as expected, but remove anyway
            // to keep things tidy)
            $('style#inverseDemetricator').remove();
            addGlobalStyle(demetricatedStyle,"demetricator");

            if(curURL.contains("tweetdeck.twitter")) {
                $('style#inverseTweetDeckDemetricator').remove();
                addGlobalStyle(tweetDeckDemetricatedStyle,
                        "tweetDeckDemetricator");
            }

            if(curURL.contains("i/videos")) {
                $('style#inverseTweetDeckVideosDemetricator').remove();
                addGlobalStyle(tweetDeckVideosDemetricatedStyle,
                        "tweetDeckVideosDemetricator");
            }

            demetricateNewTweetsBar(
                $('body:not(.NotificationsPage):not(.AdaptiveSearchPage) button.new-tweets-bar')
            );
            
            demetricateNewNotificationsBar(
                $('body.NotificationsPage button.new-tweets-bar')
            );

            demetricateNewResultsBar(
                $('body.AdaptiveSearchPage button.new-tweets-bar')
            );

            /*
            $('body.NotificationsPage button.new-tweets-bar').
                text("new notifications");
                */

            $('title').text(demetricateTitle());


            // navbar metrics
            // need to stay aware of color theme changes, as they
            // adjust to match a user's banner image, etc.
            var notificationBackgroundColor;

            if(newTwitter) {
                notificationBackgroundColor = 
                    //$('nav[aria-label="Primary"] div[dir="auto"]').css('background-color');
                    $('nav[aria-label="Primary"] div[aria-live="polite"]').css('background-color');
            } else {
                notificationBackgroundColor = $('.count-inner').css('background-color');
            }

            $('.count-inner').css('color',notificationBackgroundColor);
            //$('nav[aria-label="Primary"] div[dir="auto"]').css('color',notificationBackgroundColor);
            $('nav[aria-label="Primary"] div[aria-live="polite"]').css('color',notificationBackgroundColor);

            // catch everything else tagged for hide/show
            $('.notdemetricated').hide();
            $('.demetricated').fadeIn(); // fades in the dots

            // tooltips re-present (hidden) metrics, so just disable
            // them now that they show nothing (should demetricate
            // the tooltip instead---maybe for next version)
            $('.demetricate-tooltip').
                addClass('js-tooltip-demetricated').
                removeClass('js-tooltip');

            // record state
            demetricated = true;
            demetricating = false;
        }
    }

    function main() {

        if(IS_CHROME_EXTENSION) {
            addGlobalStyle(demetricatedStyle,"demetricator");
            // listen for messages from the extension control popup, 
            // adjust as directed
            chrome.runtime.onMessage.addListener(
              function(request, sender, sendResponse) {
                //console.log("got a trigger from chrome listener");
                if(request.on) { toggleDemetricator();  } // hide
                else { toggleDemetricator(); } // show
                sendResponse({farewell: "msg rcvd"});
            });

            // on first load, grab all saved data and respond
            chrome.storage.local.get("on", function(data) {
                if(chrome.runtime.lastError) {
                    chrome.storage.local.set({"on":true}, function() {
                    });
                } else {
                    if(data.on || data.on == undefined) {
                        if(!demetricated) toggleDemetricator();
                        demetricated = true;

                    } else {
                        if(demetricated) toggleDemetricator();
                        demetricated = false;
                    }
                }
            });
        }

        // inject styles manually for non-Chrome
        else {
            addGlobalStyle(demetricatedStyle,"demetricator");

            if(curURL.contains("tweetdeck.twitter")) {
                addGlobalStyle(tweetDeckDemetricatedStyle,
                        "tweetDeckDemetricator");
            }

            if(curURL.contains("i/videos")) {
                $('style#inverseTweetDeckVideosDemetricator').remove();
                addGlobalStyle(tweetDeckVideosDemetricatedStyle,
                        "tweetDeckVideosDemetricator");
            }
        }

        // no toggle dropdown on non-Chrome, so enable key control 
        // also enable if explicitly set 
        if(!IS_CHROME_EXTENSION || KEY_CONTROL) {
            Mousetrap.bind('ctrl+d', toggleDemetricator);
        }

        // console reporting
        console.log("Twitter Demetricator, ver. "+version+" -- by Ben Grosser");
        console.log("https://bengrosser.com/projects/twitter-demetricator/");
        console.log(" ... loaded for URL --> "+window.location);

        if($('#react-root').length > 0) {
            console.log(" ... NEW TWITTER DETECTED (will adjust accordingly)"); 
            newTwitter = true;
        }

        // if we don't want it on then undo the demetrication style
        if(!demetricated) 
            addGlobalStyle(inverseDemetricatedStyle,"demetricator");
       
        if(window.location.href.contains("i/videos") && demetricated) {
            $('.view-counts-display').css('opacity','0');
        }
        
        // nav bar notification circles
        // track changes to <style> to catch theme/color changes
        // needed for navbar demetrication
        ready('style',function(e) {
            if(!demetricated) return;
            var notificationBackgroundColor;
            if(newTwitter) {
                notificationBackgroundColor = 
                //$('nav[aria-label="Primary"] div[dir="auto"]').css('background-color');
                $('nav[aria-label="Primary"] div[aria-live="polite"]').css('background-color');
            } else {
                notificationBackgroundColor = $('.count-inner').css('background-color');
            }
            $('.count-inner').css('color',notificationBackgroundColor);
            //$('nav[aria-label="Primary"] div[dir="auto"]').css('color',notificationBackgroundColor);
            $('nav[aria-label="Primary"] div[aria-live="polite"]').css('color',notificationBackgroundColor);
        });

        // new tweets bar ("See 8 new Tweets" becomes "See new Tweets")
        ready('body:not(.NotificationsPage):not(.AdaptiveSearchPage) button.new-tweets-bar', 
          function(e) { 

              if(demetricated) demetricateNewTweetsBar(e);

              // remove 1.0
              // orig
              //if(demetricated) $(e).text("See new Tweets"); 
        });


        // new notifications bar 
        // ("See 8 new notifications" becomes "See new notifications")
        ready('body.NotificationsPage button.new-tweets-bar', 
          function(e) { 
            if(demetricated) demetricateNewNotificationsBar(e);
          }
        );

        ready('body.AdaptiveSearchPage button.new-tweets-bar', 
          function(e) { 
            if(demetricated) demetricateNewResultsBar(e);
          }
        );




        // CHECK 1.0
        // "Someone and 8 others retweeted this" ??
        ready('.ActivityItem-displayText', function(e) {
            if($(e).hasClass("demetricator_checked")) return;
            else $(e).addClass("demetricator_checked");
            
            var h = $(e).html();
            var parsed = h.match(/(.*)\s+(\d+(?:,\d+)*)\s+([\s\S]*)/);

            if(parsed) {
                var newhtml = parsed[1] + 
                    " <span class='notdemetricated' style='display:none;'>" +
                    parsed[2] + "</span> "+ parsed[3];
                $(e).html(newhtml);
                if(!demetricated) $(e).find('.notdemetricated').show();
            }
        });

        // CHECK 1.0
        // replace with demetricateMiddleMetric?
        ready('.tweet-context', function(e) {
            if($(e).hasClass("demetricator_checked")) return;
            else $(e).addClass("demetricator_checked");

            var txt = $(e).text().trim();
            var parsed = matchMiddleMetric(txt);

            if(parsed) {
                var newhtml = 
                    parsed[1] + 
                    " <span class='notdemetricated' style='display:none;'>"+
                    parsed[2] + "</span> "+ 
                    parsed[3];
                $(e).html(newhtml);
                if(!demetricated) $(e).find('.notdemetricated').show();
            }
        });

        // additional tweetdeck
        ready('.social-proof-for-tweet-title b', 
                function(e) { demetricateMiddleMetricPopup(e); });

        // new notifications page inline metrics (e.g. 
        //   Someone and 8 others followed you
        // )
        // Jul 25 2019
        ready(
            'div[aria-label="Timeline: Notifications"] article span span span',
            function(e) { demetricateMiddleMetricPopup(e); 
        });

        function demetricateMiddleMetricPopup(e) {
            var txt = $(e).text();
            var htm = $(e).html();

            if(txt != undefined && htm != undefined) {

                var parsed;

                if(newTwitter) {
                    parsed = $(e).html().match(/([\s\S]*)\s+(\d+(?:[,|\s|.]\d+)*)\s+([\s\S]*)/);
                } else {
                    parsed = $(e).html().replace(/&nbsp;/gi,' ').
                    match(/([\s\S]*)\s+(\d+(?:[,|\s|.]\d+)*)\s+([\s\S]*)/);
                    //match(/([\S]*)\s+(\d+(?:[,|\s|.]\d+)*)\s+([\s\S]*)/);
                }

                if(parsed) {
                    var newhtml = parsed[1] + 
                        " <span class='notdemetricated' style='display:none;'>"+
                        parsed[2] + " </span>"+ parsed[3];
                    $(e).html(newhtml);
                } 
                
                // else maybe it's a language that starts this sentence w/ num 
                // like german: 127.839 „Gefällt mir“-Angaben
                else {
                    parsed = 
                        $(e).html().match(/^(\d+(?:[,|\s|.]\d+)*\s?)\s+(.*)/);

                    //console.log("NEW: "+parsed);
                    if(parsed) {

                        var newhtml = 
                        "<span class='notdemetricated' style='display:none;'>"+
                        parsed[1] + "</span> "+ parsed[2];
                        $(e).html(newhtml);
                    }
                }
            }
        }

        // time metrics (relative age counts ONLY, not timestamps)
        ready(
          '.MomentCapsuleSubtitle-context, .ActivityItem-activityTimestamp', 
            function(e) { demetricateRelativeTime($(e), $(e)); }
        );

        ready('.js-relative-timestamp', function(e) {
              demetricateRelativeTime($(e), $(e).parent().parent());
        });

        // new twitter
        ready('time', 
            function(e) { demetricateRelativeTime($(e), $(e)); }
        );

        // tweetdeck timestamps
        if(curURL.contains("tweetdeck.twitter")) {
            ready('time.tweet-timestamp a, time.tweet-timestamp span', 
            function(e) { demetricateRelativeTime($(e), $(e)); });
        }

        // check timestamp content to ensure it's an age count
        // some are tagged as such by Twitter, but some are not
        function demetricateRelativeTime(timeTarget, hideTarget) {
            if(hideTarget.hasClass("demetricator_checked")) return;
            else hideTarget.addClass("demetricator_checked");

            // relative times on permalinks are present by hidden by default
            // so never reveal them
            if(hideTarget.parent().hasClass('permalink-header')) return;

            var txt = timeTarget.text();

            if(
                txt.contains("Jan") ||
                txt.contains("Feb") ||
                txt.contains("Mar") ||
                txt.contains("Apr") ||
                txt.contains("May") ||
                txt.contains("Jun") ||
                txt.contains("Jul") ||
                txt.contains("Aug") ||
                txt.contains("Sep") ||
                txt.contains("Oct") ||
                txt.contains("Nov") ||
                txt.contains("Dec") ||
                txt.contains("Earlier")
              ) {
                return;

            } else {
                hideTarget.addClass("notdemetricated");
                if(demetricated) { 
                    hideTarget.hide();
                    hideTarget.parent().parent().parent().find('div[aria-hidden="true"]').addClass("notdemetricated").hide();
                }
            }

        }

        // hover over user popup follower metrics
        ready('.profile-card', function(e) {
          $('.followers-you-follow-link').text("others");
        });

        // "Trends for you" box includes lots of metrics
        ready('.trend-item-stats',function(e) {
            cloneAndDemetricateLeadingNum(e, "Tweets");
        });

        // NEW TWITTER "Trends for you" box includes lots of metrics
        if(newTwitter) {
            //ready('div[aria-label="Timeline: Trending now"] div div div div div span span, div[aria-label="Timeline: Explore"] div div div div div span span',function(e) {
            ready('div[aria-label="Timeline: Trending now"] div div div div div span, div[aria-label="Timeline: Explore"] div div div div div span',function(e) {
                cloneAndDemetricateLeadingNum(e, "Tweets");
            });

            ready('div[aria-label="Timeline: Trends"] div div div div div span span',function(e) {
                cloneAndDemetricateLeadingNum(e, "Tweets");
            });

/*
// not showing up in time
            ready('a[data-testid="eventHero"] div:nth-child(1) div div div',function(e) {
            $(e).addClass("WASHERE");
                cloneAndDemetricateLeadingNum(e, "Tweets");
            });
            */
        }



        //ready('nav[aria-label="Primary"] div[dir="auto"]', function(e) {
        ready('nav[aria-label="Primary"] div[aria-live="polite"]', function(e) {
            var notificationBackgroundColor = $(e).css('background-color');
            $(e).css('color',notificationBackgroundColor);
        });

        // new profile page user tweet tally (e.g. ben grosser, 3152 Tweets)
        ready('h2[role="heading"][dir="auto"]',function(e) {
            var t = $(e).parent().find('div[dir="auto"]');
            cloneAndDemetricateLeadingNum(t, "Tweets");
        });

        // old twitter tweet metrics / dots for like/retweet/reply
        if(!newTwitter) {
            ready('.ProfileTweet-actionList, .MomentTweetActions', function(e) {
                var replyButton = $(e).find('.ProfileTweet-action--reply');
                var retweetButton = $(e).find('.ProfileTweet-action--retweet');
                var favoriteButton = $(e).find('.ProfileTweet-action--favorite');
                var buttons = [replyButton, retweetButton, favoriteButton];

                var dot;

                if(demetricated) dot = '<sup class="button_dot demetricated" style="top:-10px;font-size:120%;font-weight:bold;font-family:serif;opacity:0.5">.</sup>';
                else dot = '<sup class="button_dot demetricated" style="top:-10px;font-size:120%;font-weight:bold;font-family:serif;opacity:0.5;display:none;">.</sup>';

                // for every button, check and add dot if needed
                for(var i = 0; i < buttons.length; i++) {
                  if(buttons[i].
                    find('span.ProfileTweet-actionCount--isZero').length == 0) {
                      if(buttons[i].hasClass("dotted")) return;
                      else {
                        buttons[i].addClass("dotted");
                        $(dot).insertAfter(buttons[i].find('.IconContainer'));
                        //buttons[i].find('span.Icon').css('font-size','unset');
                      }
                   }
                 }
            });
        }

        // new twitter
        else {
            // tweet actions (comment, retweet, favorite)
            // continuously track because they may update while watching
            // replace any metrics found with a "dot" indicator so users
            // know they have *some* number of comments/retweets/favorites
           
            // defunct 2/25/19
            //ready('div:not(.ProfileTweet-actionList)[aria-label="Tweet actions"]', function(e) {
            
            // new 2/25/19
            ready('div[data-testid="tweet"]', function(e) {

                //$(e).css('border','2px solid green');
                if(!newTwitter) return;

                /*
                 * defunct 3/25 - can't recall why i had this
                 * but no longer helping/working
                let singleTweetTest = $(e).css('height');
                if(singleTweetTest.match(/4/) != null) return;
                */
                
                var replyButton = $(e).find('div[data-testid="reply"]');
                if(!replyButton.attr('aria-label')){
                    replyButton = $(e.nextElementSibling).find('div[data-testid="reply"]');
                }
                var retweetButton = $(e).find('div[data-testid="retweet"]');
                if(!retweetButton.attr('aria-label')){
                    retweetButton = $(e.nextElementSibling).find('div[data-testid="retweet"]');
                }
                var favoriteButton = $(e).find('div[data-testid="like"]');
                if(!favoriteButton.attr('aria-label')){
                    favoriteButton = $(e.nextElementSibling).find('div[data-testid="like"]');
                }
                var buttons = [replyButton, retweetButton, favoriteButton];

                var dot;

                
                //console.log($(e.nextElementSibling).find('div[data-testid="reply"]'));
                
                if(demetricated) dot = '<sup class="button_dot demetricated" style="font-size:120%;font-weight:bold;font-family:serif;opacity:0.5;margin:-24px 0 0 2px;">.</sup>';
                else dot = '<sup class="button_dot demetricated" style="font-size:120%;font-weight:bold;font-family:serif;opacity:0.5;margin:-24px 0 0 2px;display:none;">.</sup>';


                // for every button, check and add dot if needed
                for(var i = 0; i < buttons.length; i++) {
                   // if buttons aria-label starts with a digit, it has a count
                   //console.log(buttons[i])
                   let buttonLabel = buttons[i].attr('aria-label');
                   let buttonTest = buttons[i].attr('data-testid');
                   

                   // if buttonLabel starts w/ a num then there's a metric for this button
                   // OR if the button's data-testid is undefined, then it's *going* to get updated by React
                   if(buttonLabel != null && buttonLabel.match(/^\d/)!= 0 ) {
                      if($(buttons[i]).hasClass("dotted")) return; 
                      else {
                        $(buttons[i]).addClass("dotted");
                        $(dot).insertAfter($(buttons[i]).find('svg').parent());
                      }
                   }
                 }
            });

            ready('div[data-testid="unlike"], div[data-testid="unretweet"]', function(e) {
                let singleTweetTest = $(e).css('height');
                if(singleTweetTest.match(/4/) != null) return;

                var dot;

                // changing offset for colored dots based on Twitter change jul 2019
                if(demetricated) dot = '<sup class="button_dot demetricated" style="font-size:120%;font-weight:bold;font-family:serif;opacity:0.5;margin:-6px 0 0 2px;">.</sup>';
                else dot = '<sup class="button_dot demetricated" style="font-size:120%;font-weight:bold;font-family:serif;opacity:0.5;margin:-6px 0 0 2px;display:none;">.</sup>';

                let c = $(e).find('svg').css('color');

                if($(e).hasClass("dotted")) return; 
                else {
                    $(e).addClass("dotted");
                    let newdot = $(dot).insertAfter($(e));
                    newdot.css('color',c);
                }

            });
            
            
            // TODO: when someone likes/retweets an item that wasn't previously liked/retweeted
            //  ... and THEN, if they unlike/unretweet, AND if they were the only one who had 
            //  liked/retweeted it in the first place, then the dot is left in place until reload
            //  having trouble finding a workable solution (at least w/o running another observer)
            /*
            ready('div[data-testid="like"], div[data-testid="retweet"]', function(e) {
                console.log("got a new like or retweet node");
                if($(e).hasClass('dotted') && $(e).attr('aria-label').match(/\d/) == null) {
                    $(e).removeClass('dotted').find('.button_dot').remove();
                } 
            });
            */
        }

        // video "views" onload and after finished 
        // (two separate metrics to track)
        // --a bit tricky, and Twitter doing me no favors here
        //   (voted most likely to break first)
        ready('.PlayableMedia-reactWrapper div div:nth-child(2) span:nth-child(2) div div:nth-child(2) span span, .PlayableMedia-reactWrapper div div:nth-child(2) span div div div span:nth-child(2) span',
          function(e) {
            if($(e).hasClass("demetricator_checked")) return;
            else $(e).addClass("demetricator_checked");
            cloneAndDemetricateLeadingNum($(e), "views");
          }
        );

        // video views
        if(newTwitter) {
            ready('span[data-testid="viewCount"] span, div[data-testid="viewCount"] span', function(e) {
                if($(e).hasClass("demetricator_checked")) return;
                else $(e).addClass("demetricator_checked");
                cloneAndDemetricateLeadingNum($(e), "views");
            });
        }

        // search results
        if(newTwitter) {
            ready('form[role="search"] div[role="listbox"] div:nth-child(2) div[role="option"] div div:nth-child(2)', function(e) {
                if($(e).hasClass("demetricator_checked")) return;
                else $(e).addClass("demetricator_checked");
                cloneAndDemetricateLeadingNum($(e), "views");

            });
        }

        if(newTwitter) {
            ready('a[title]', function(e) {
                let ttxt = $(e).attr('title');
                if(ttxt.match(/^\d/)) {
                    if(!ttxt.contains("·")) {
                        //console.log("scrubbing: "+ttxt);
                        $(e).attr('title','');
                    }
                }
            });
        }

        // others you follow in hovercards and profile pages
        // I'm removing some originally embedded markup here
        // but it doesn't seem to matter
        if(newTwitter) {
            // defunct 3/25
            //ready('a[aria-label="Followers you know"] div span', function(e) {
            ready('a[aria-label="Followers you know"] span', function(e) {
                if($(e).hasClass("demetricator_checked")) return;
                else $(e).addClass("demetricator_checked");

                var txt = $(e).text().trim();
                var parsed = matchMiddleMetric(txt);

                if(parsed) {
                    var newhtml = 
                        parsed[1] + 
                        " <span class='notdemetricated' style='display:none;'>"+
                        parsed[2] + " </span>"+ 
                        parsed[3];
                    $(e).html(newhtml);
                    if(!demetricated) $(e).find('.notdemetricated').show();
                }
            });
        }

        // moments
        if(newTwitter) {
            // times such as '8 minutes ago' -- needs more work for inserted material
            ready('a div div div:nth-child(3) div.r-1sf4r6n.r-n6v787[dir="auto"]',function(e) {
                cloneAndDemetricateLeadingNum(e, "recently");
            });
        }

        // lists
        if(newTwitter) {
            ready('div[data-focusable="true"] div div div:nth-child(3) div span.r-7cikom.r-homxoj[dir="auto"], div[data-focusable="true"] div div div:nth-child(4) div span.r-7cikom.r-homxoj[dir="auto"]', function(e) {
                cloneAndDemetricateLeadingNum(e, "recently");
            });
        }



        // "20 Photos and videos" on a user's page
        ready('.PhotoRail-headingWithCount', function(e) {
            cloneAndDemetricateLeadingNum(e, "Photos and videos");
        });

        // "8 Followers you konw" on a user's page
        ready('.ProfileUserList-permalink', function(e) {
            cloneAndDemetricateLeadingNum(e, "Followers you know");
        });

        // "8 more replies" in a threaded conversation
        ready('.ThreadedConversation-moreRepliesLink', function(e) {
            cloneAndDemetricateLeadingNum(e, "more replies");
        });

        // "Your tweet activity" barchart header metric ...
        ready('.TweetImpressionsModule p strong', function(e) {
            cloneAndDemetricateLeadingNum(e, "impressions");
        });

        // and barchart tooltip metrics (for each day of last 7)
        ready('.TweetImpressionsModule-barchart-tooltipvalue', function(e) {
            cloneAndDemetricateLeadingNum(e, "impressions");
        });

        // Moment items such as "291 Likes"
        ready('.MomentCapsuleLikesCount', function(e) {
            cloneAndDemetricateLeadingNum(e, "Likes");
        });

        // List metrics "49 Members" (I think...)
        ready('.ProfileListItem-memberCount', function(e) {
            cloneAndDemetricateLeadingNum(e, "Members");
        });

        // Messages divider metrics ("1 unread message")
        ready('.DMDivider-text', function(e) {
            cloneAndDemetricateLeadingNum(e, "unread messages");
        });

        // tagged photo captions in feed: "person, person, person, and 7 others"
        ready('.media-tags-container .request-tagging-popup b', function(e) {
            cloneAndDemetricateLeadingNum(e, "others");
        });


        // ?? CONFIRM 1.0
        // notifications list?
        ready('button.ActivityItem-showHiddenSupplements span.show-text', 
            function(e) {
              cloneAndDemetricateLeadingNum(e, "other likes");
        });

        // ?? CONFIRM 1.0 
        // not sure where this is
        ready('.ProfileHeading-toggleLink[data-nav="follower_you_know_toggle"], .ProfileHeading-toggleItem[data-element-term="follower_you_know_toggle"]', 
            function(e) {
                cloneAndDemetricateLeadingNum(e, "followers you know");
        });

        // CONFIRM 1.0
        // "8 others" but not sure where??
        ready('.followers-you-follow-link', function(e) {
            cloneAndDemetricateLeadingNum(e, "others");
        });

        function cloneAndDemetricateLeadingNum(e, dTxt) {
            if($(e).hasClass("demetricated") || 
               $(e).hasClass("notdemetricated")) return;

            // can be lots of whitespace stuck in it
            var txt = ($(e).text()).trim();
            var cleantxt = txt.replace(/&nbsp;/gi,' ');
            //console.log("cleantxt: "+cleantxt);
            //var parsed = cleantxt.match(/^(\d+(?:[,|\s|.]\d+)*)\s+(.*)/);
            //var parsed = cleantxt.match(/^(\d+(?:[,|\s|.]\d+)*\s?[K|M|k|m|Mio\.|Tsd\.]?)\s+(.*)/);
            var parsed = 
               cleantxt.
               match(/^(\d+(?:[,|\s|.]\d+)*\s?([K|k|M|m|]?|Tsd.|Mio.|mil|E|tn))\s+(.*)/);
            //if(parsed) console.log(parsed);
            //
            
            //if(parsed) console.log("t: "+txt+", c: "+cleantxt+", p[1]: "+parsed[3]);
           

            // does sentence start with metric?
            //var check = txt.match(/^\d/);

            // if it does, clone, hide, insert demetricated version
            if(parsed) {
                var orig = $(e);
                var clone = orig.clone();
                clone.text(parsed[3]);
                clone.addClass("demetricated");
                orig.addClass("notdemetricated");
                if(demetricated) orig.hide();
                else clone.hide();
                clone.insertAfter(orig);
            }

            // alt language w/ num in middle?
            // CHECK 1.0 --- leave as is? works for now
            else {
                demetricateMiddleMetricPopup(e);
            }
        }

        // lots of sentences with leading metrics
        // clone and hide original (to preserve changing metrics)
        // and show clone without the metric
        // dTxt is the description text (essentially the non-metric 
        // part of sentence)
        function cloneAndDemetricateLeadingNum2(e, dTxt) {
            if($(e).hasClass("demetricated") || 
               $(e).hasClass("notdemetricated")) return;

            // can be lots of whitespace stuck in it
            var txt = ($(e).text()).trim();

            // does sentence start with metric?
            var check = txt.match(/^\d/);

            // if it does, clone, hide, insert demetricated version
            if(check) {
                var orig = $(e);
                var clone = orig.clone();
                clone.text(dTxt);
                clone.addClass("demetricated");
                orig.addClass("notdemetricated");
                if(demetricated) orig.hide();
                else clone.hide();
                clone.insertAfter(orig);
            }
        }

        // disable tooltips on Tweets, Following, Followers
        // on a user's own profile box because all they do
        // is re-present (now hidden) metrics. should demetricate
        // rather than disable (next version)
        ready('.ProfileNav-stat, .ProfileCardStats-statLink',function(e) {

            if($(e).hasClass("js-tooltip")) {
                $(e).removeClass('js-tooltip').
                    addClass('js-tooltip-demetricated').
                    addClass('demetricate-tooltip');
            }

            if($(e).attr("title")) {
                if($(e).attr("title").length > 0) {
                  var a = $(e).attr('title');
                  $(e).removeAttr('title');
                  $(e).attr('title-demetricated',a);
                }
            } 
        });

        // a few items need their own explicit mutationobservers
        // in order to capture changes not gathered by ready()

        // watch the <title> tag
        // remove metrics when it has them
        var titleResetting = false;
        var titleNode;
        var titleObserver = new MutationObserver(function(mutations) {
            
            if(!demetricated || titleResetting) return;

            titleResetting = true;

            var newtxt = demetricateTitle();

            titleObserver.disconnect();

            $.when($('title').text(newtxt)).then(
                function() {
                    //console.log("changed title to: "+newtxt);
                    //console.log("reobserving");
                    titleObserver.observe(titleNode, { childList: true });
                    titleResetting = false;
                }
            );
        });

        
        // new twitter needs additional steps ... thanks react -- NOT
        if(newTwitter) {
            function waitForTitleNode() {
                titleNode = document.querySelector("title");
                if(titleNode == null) {
                    window.setTimeout(waitForTitleNode,500);
                    return;
                } else if(titleNode.nodeType != 1) {
                    window.setTimeout(waitForTitleNode,500);
                    return;
                }
                $(titleNode).text(demetricateTitle());
                var config = {childList: true};
                titleObserver.observe(titleNode,config); 
            }

            waitForTitleNode();
        }

        // old twitter
        else {
            titleNode = document.querySelector('title');
            titleObserver.observe(titleNode, { childList: true })
        }



        // monitor a <link> tag in <head> to track page location changes
        // (couldn't find another way)
        var linkNode = document.querySelector('link[rel="canonical"]');
        var linkObserver = new MutationObserver(function(mutations) {
            curURL = window.location.href;
        });

        if(linkNode != undefined) 
            linkObserver.observe(linkNode, { attributes: true })


        // modal headers --- popups when someone clicks on "Likes"
        // or "Retweets" in order to get a list of them all. These
        // come with headers such as "Liked 82 Times"
        //
        // Modal headers have delayed metric loading, very hard to track. 
        // strategy is to watch for .modal-enabled class change on <body>, 
        // and *then* launch an observer for modal header
        var bodyNode = document.querySelector('body');
        var bodyObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                var t = $(mutation.target);
                if(t.hasClass("modal-enabled")) {
                    var mhn = 
                        document.querySelector("#activity-popup-dialog-header");
                    var mho = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                            var target = $(mutation.target);
                            var text = target.text();
                            // it finally has the metric!
                            //if(!text.contains("Loading")) { 
                            if(!text.contains("...")) { 
                              if(demetricated) 
                                demetricateMiddleMetricPopup(target); 
                              mho.disconnect(); // no longer needed/useful
                            }
                        });
                    });

                    if(mhn != undefined) mho.observe(mhn, { childList:true });
                };
            });
        });

        if(bodyNode != undefined) bodyObserver.observe(bodyNode, { 
                attributes: true, 
                attributeFilter: ['class'] 
        });


    } // main

    function demetricateNewTweetsBar(e) {
        var tweetBarText = $(e).text().trim();

        // look for a middle metric, extract demetricated text
        var parsed = matchMiddleMetric(tweetBarText);

        if(parsed) {
            tweetBarTextDemetricated = parsed[1] + " " + parsed[3];
            tweetBarTextTemplate = parsed[1] + " XXX " + parsed[3];
            if(demetricated || demetricating) 
                $(e).text(tweetBarTextDemetricated);
        } 

        // if not a middle, look for a leading metric
        else {
            var parsed = matchLeadingMetric(tweetBarText);

            if(parsed) {
                tweetBarTextDemetricated = parsed[3];
                tweetBarTextTemplate =  "XXX " + parsed[3];
                if(demetricated || demetricating) 
                    $(e).text(tweetBarTextDemetricated);
            }
        }
    }

    function demetricateNewNotificationsBar(e) {
        var notificationBarText = $(e).text();

        // look for a middle metric, extract demetricated text
        var parsed = matchMiddleMetric(notificationBarText);

        if(parsed) {
            notificationBarTextDemetricated = parsed[1] + " " + parsed[3];
            notificationBarTextTemplate = parsed[1] + " XXX " + parsed[3];
            if(demetricated || demetricating) 
                $(e).text(notificationBarTextDemetricated);
        } 

        // if not a middle, look for a leading metric
        else {
            var parsed = matchLeadingMetric(notificationBarText);

            if(parsed) {
                notificationBarTextDemetricated = parsed[3];
                notificationBarTextTemplate =  "XXX " + parsed[3];
                if(demetricated || demetricating) 
                    $(e).text(notificationBarTextDemetricated);
            }
        }
    }

    function demetricateNewResultsBar(e) {
        var resultsBarText = $(e).text().trim();

        // look for a middle metric, extract demetricated text
        var parsed = matchLeadingMetric(resultsBarText);

        if(parsed) {
            resultsBarTextDemetricated = parsed[2];
            resultsBarTextTemplate =  "XXX " + parsed[2];
            if(demetricated || demetricating) 
                $(e).text(resultsBarTextDemetricated);
        }
    }


    function matchMiddleMetric(t) {
        return t.match(/([\s\S]*)\s+(\d+(?:[,|\s|.]\d+)*)\s+([\s\S]*)/);
        //return t.match(/([\S]*)\s+(\d+(?:[,|\s|.]\d+)*)\s+([\s\S]*)/);
        //return t.match(/([\S]*)\s+(\d+(?:[,|\s|.]\d+)*)\s+([\S]*)/);
    }

    function matchLeadingMetric(t) {
        return t.match(/^(\d+(?:[,|\s|.]\d+)*\s?)\s+(.*)/);
    }

    function demetricateTitle() {

        // grab current title text
        var ttxt = $('title').text(); 

        // tokenize the title to see if it has a (*) at the front
        var parsed = ttxt.match(/^(\(.*?\))\s+(.*)/);

        // revised title text
        var newtxt = "";

        if(parsed) {
            newtxt = parsed[2];
        }
        else {
            newtxt = ttxt;
        }

        return newtxt;
    }

    // originally from https://gist.github.com/Geruhn/7644599
    function addGlobalStyle(css,idname) {
        //console.log("aGS, css: "+css+", id: "+idname);
        
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        //style.innerHTML = css;
        style.setAttribute("id",idname);
        head.appendChild(style);
    }


    // cleaner syntax than match()
    String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

// CHANGE 1.0
// remove into one file for 1.0
// jquery direct pasted below
// from https://code.jquery.com/jquery-3.2.1.min.js
//


// CHANGE 1.0?
// move into own file 1.0
//
// rynamorr ready.js
// https://github.com/ryanmorr/ready
// with very minor adjustment for vanilla js
/*
 * Common variables
 */
let observer;
const listeners = [];
const doc = window.document;
const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

/*
 * Checks a selector for new matching
 * elements and invokes the callback
 * if one is found
 *
 * @param {String} selector
 * @param {Function} fn
 * @api private
 */
function checkSelector(selector, fn) {
    const elements = doc.querySelectorAll(selector);
    for (let i = 0, len = elements.length; i < len; i++) {
        const element = elements[i];
        if (!element.ready) {
            element.ready = true;
            fn.call(element, element);
        }
    }
}

/*
 * Check all selectors for new elements
 * following a change in the DOM
 * * @api private
 */
function checkListeners() {
    listeners.forEach((listener) => checkSelector(listener.selector, listener.fn));
}

/*
 * Remove a listener
 *
 * @param {String} selector
 * @param {Function} fn
 * @api private
 */
function removeListener(selector, fn) {
    let i = listeners.length;
    while (i--) {
        const listener = listeners[i];
        if (listener.selector === selector && listener.fn === fn) {
            listeners.splice(i, 1);
            if (!listeners.length && observer) {
                observer.disconnect();
                observer = null;
            }
        }
    }
}

/*
 * Add a selector to watch for when a matching
 * element becomes available in the DOM
 *
 * @param {String} selector
 * @param {Function} fn
 * @return {Function}
 * @api public
 */
//export default function ready(selector, fn) {
function ready(selector, fn) {
    if (!observer) {
        observer = new MutationObserver(checkListeners);
        observer.observe(doc.documentElement, {
            childList: true,
            subtree: true
        });
    }
    listeners.push({selector, fn});
    checkSelector(selector, fn);
    return () => removeListener(selector, fn);
}


/* mousetrap v1.6.1 craig.is/killing/mice */
// from https://raw.githubusercontent.com/ccampbell/mousetrap/master/mousetrap.min.js
(function(r,v,f){function w(a,b,g){a.addEventListener?a.addEventListener(b,g,!1):a.attachEvent("on"+b,g)}function A(a){if("keypress"==a.type){var b=String.fromCharCode(a.which);a.shiftKey||(b=b.toLowerCase());return b}return p[a.which]?p[a.which]:t[a.which]?t[a.which]:String.fromCharCode(a.which).toLowerCase()}function F(a){var b=[];a.shiftKey&&b.push("shift");a.altKey&&b.push("alt");a.ctrlKey&&b.push("ctrl");a.metaKey&&b.push("meta");return b}function x(a){return"shift"==a||"ctrl"==a||"alt"==a||
"meta"==a}function B(a,b){var g,c,d,f=[];g=a;"+"===g?g=["+"]:(g=g.replace(/\+{2}/g,"+plus"),g=g.split("+"));for(d=0;d<g.length;++d)c=g[d],C[c]&&(c=C[c]),b&&"keypress"!=b&&D[c]&&(c=D[c],f.push("shift")),x(c)&&f.push(c);g=c;d=b;if(!d){if(!n){n={};for(var q in p)95<q&&112>q||p.hasOwnProperty(q)&&(n[p[q]]=q)}d=n[g]?"keydown":"keypress"}"keypress"==d&&f.length&&(d="keydown");return{key:c,modifiers:f,action:d}}function E(a,b){return null===a||a===v?!1:a===b?!0:E(a.parentNode,b)}function c(a){function b(a){a=
a||{};var b=!1,l;for(l in n)a[l]?b=!0:n[l]=0;b||(y=!1)}function g(a,b,u,e,c,g){var l,m,k=[],f=u.type;if(!h._callbacks[a])return[];"keyup"==f&&x(a)&&(b=[a]);for(l=0;l<h._callbacks[a].length;++l)if(m=h._callbacks[a][l],(e||!m.seq||n[m.seq]==m.level)&&f==m.action){var d;(d="keypress"==f&&!u.metaKey&&!u.ctrlKey)||(d=m.modifiers,d=b.sort().join(",")===d.sort().join(","));d&&(d=e&&m.seq==e&&m.level==g,(!e&&m.combo==c||d)&&h._callbacks[a].splice(l,1),k.push(m))}return k}function f(a,b,c,e){h.stopCallback(b,
b.target||b.srcElement,c,e)||!1!==a(b,c)||(b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation?b.stopPropagation():b.cancelBubble=!0)}function d(a){"number"!==typeof a.which&&(a.which=a.keyCode);var b=A(a);b&&("keyup"==a.type&&z===b?z=!1:h.handleKey(b,F(a),a))}function p(a,c,u,e){function l(c){return function(){y=c;++n[a];clearTimeout(r);r=setTimeout(b,1E3)}}function g(c){f(u,c,a);"keyup"!==e&&(z=A(c));setTimeout(b,10)}for(var d=n[a]=0;d<c.length;++d){var m=d+1===c.length?g:l(e||
B(c[d+1]).action);q(c[d],m,e,a,d)}}function q(a,b,c,e,d){h._directMap[a+":"+c]=b;a=a.replace(/\s+/g," ");var f=a.split(" ");1<f.length?p(a,f,b,c):(c=B(a,c),h._callbacks[c.key]=h._callbacks[c.key]||[],g(c.key,c.modifiers,{type:c.action},e,a,d),h._callbacks[c.key][e?"unshift":"push"]({callback:b,modifiers:c.modifiers,action:c.action,seq:e,level:d,combo:a}))}var h=this;a=a||v;if(!(h instanceof c))return new c(a);h.target=a;h._callbacks={};h._directMap={};var n={},r,z=!1,t=!1,y=!1;h._handleKey=function(a,
c,d){var e=g(a,c,d),k;c={};var h=0,l=!1;for(k=0;k<e.length;++k)e[k].seq&&(h=Math.max(h,e[k].level));for(k=0;k<e.length;++k)e[k].seq?e[k].level==h&&(l=!0,c[e[k].seq]=1,f(e[k].callback,d,e[k].combo,e[k].seq)):l||f(e[k].callback,d,e[k].combo);e="keypress"==d.type&&t;d.type!=y||x(a)||e||b(c);t=l&&"keydown"==d.type};h._bindMultiple=function(a,b,c){for(var d=0;d<a.length;++d)q(a[d],b,c)};w(a,"keypress",d);w(a,"keydown",d);w(a,"keyup",d)}if(r){var p={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",
18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},t={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},D={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},C={option:"alt",command:"meta","return":"enter",
escape:"esc",plus:"+",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},n;for(f=1;20>f;++f)p[111+f]="f"+f;for(f=0;9>=f;++f)p[f+96]=f.toString();c.prototype.bind=function(a,b,c){a=a instanceof Array?a:[a];this._bindMultiple.call(this,a,b,c);return this};c.prototype.unbind=function(a,b){return this.bind.call(this,a,function(){},b)};c.prototype.trigger=function(a,b){if(this._directMap[a+":"+b])this._directMap[a+":"+b]({},a);return this};c.prototype.reset=function(){this._callbacks={};
this._directMap={};return this};c.prototype.stopCallback=function(a,b){return-1<(" "+b.className+" ").indexOf(" mousetrap ")||E(b,this.target)?!1:"INPUT"==b.tagName||"SELECT"==b.tagName||"TEXTAREA"==b.tagName||b.isContentEditable};c.prototype.handleKey=function(){return this._handleKey.apply(this,arguments)};c.addKeycodes=function(a){for(var b in a)a.hasOwnProperty(b)&&(p[b]=a[b]);n=null};c.init=function(){var a=c(v),b;for(b in a)"_"!==b.charAt(0)&&(c[b]=function(b){return function(){return a[b].apply(a,
arguments)}}(b))};c.init();r.Mousetrap=c;"undefined"!==typeof module&&module.exports&&(module.exports=c);"function"===typeof define&&define.amd&&define(function(){return c})}})("undefined"!==typeof window?window:null,"undefined"!==typeof window?document:null);

// run main once loaded
$(document).ready(function() { main(); });

})(); // END



