var tdURL = 'http://bengrosser.com/projects/twitter-demetricator/';
var bgURL = 'http://bengrosser.com/';
var fbdURL = 'http://bengrosser.com/projects/facebook-demetricator';

$(document).ready(function() {

    // for testing, clears out storage
    // chrome.storage.local.clear();

      // link clicks need explicit handling
      $('.tdlnk').click(function() { chrome.tabs.create({url: tbURL}); });
      $('.bglnk').click(function() { chrome.tabs.create({url: bgURL}); });
      $('.fbdlnk').click(function() { chrome.tabs.create({url: fbdURL}); });
    
      var onstate;
      let hidetimes;

      // restore any saved options
      restoreOptions();
      
      // set the options switch accordingly
      $('#myonoffswitch').change(function() {
          if(this.checked) onstate = true;
          else onstate = false;

          chrome.storage.local.set({"on":onstate}, function() {
            sendState();
          });
      });

      $('.timeoptcb').change(function() {
          if(this.checked) hidetimes = true;
          else hidetimes = false;

          chrome.storage.local.set({"hidetimes":hidetimes}, function() {
              sendState();
          });
      });

      // sends full state info to all loaded FB tabs on any change
      function sendState() {

        chrome.tabs.query({ url: "*://*.twitter.com/*" }, function(tabs) {

            for(let tab of tabs) {
                chrome.tabs.sendMessage(
                    tab.id,
                    { on: onstate, hidetimes: hidetimes }, 
                    function(r) {
                        if(chrome.runtime.lastError) {
                         //   console.log("opt: got a lasterror");
                        } 

                        /*
                        else {
                            console.log("opt: NO lasterror");
                        }
                        */

                        if(r != undefined && r!= null) {
                            console.log('opt got a msg: '+r.farewell);
                        }

                        return true;
                    }
                );
            }

        });
      }


    // restore saved options if they exist
    function restoreOptions() {
      chrome.storage.local.get("on", function(data) {
          if(chrome.runtime.lastError) {
              onstate = true;
          } else {
              $('#myonoffswitch').prop('checked',data.on);
              onstate = data.on;
          }
      });

      chrome.storage.local.get("hidetimes", function(data) {
          if(chrome.runtime.lastError) {
              hidetimes = true;
          } else {
              $('.timeoptcb').prop('checked',data.hidetimes);
              hidetimes = data.hidetimes;
          }
      });
      
    }
});
