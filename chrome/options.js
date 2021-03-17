var tdURL = 'https://bengrosser.com/projects/twitter-demetricator/';
var bgURL = 'https://bengrosser.com/';
var fbdURL = 'https://bengrosser.com/projects/facebook-demetricator';

$(document).ready(function() {

    // for testing, clears out storage
    // chrome.storage.local.clear();

      // link clicks need explicit handling
      $('.tdlnk').click(function() { chrome.tabs.create({url: tbURL}); });
      $('.bglnk').click(function() { chrome.tabs.create({url: bgURL}); });
      $('.fbdlnk').click(function() { chrome.tabs.create({url: fbdURL}); });
    
      var onstate;
      let hidetimes;
      let hidedots;

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

      $('.dotoptcb').change(function() {
          if(this.checked) hidedots = true;
          else hidedots = false;

          chrome.storage.local.set({"hidedots":hidedots}, function() {
              sendState();
          });
      });

      // sends full state info to all loaded FB tabs on any change
      function sendState() {

        chrome.tabs.query({ url: "*://*.twitter.com/*" }, function(tabs) {

            for(let tab of tabs) {
                chrome.tabs.sendMessage(
                    tab.id,
                    { on: onstate, hidetimes: hidetimes, hidedots: hidedots }, 
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
                            //console.log('opt got a msg: '+r.farewell);
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

      chrome.storage.local.get("hidedots", function(data) {
          if(chrome.runtime.lastError) {
              hidedots = false;
          } else {
              $('.dotoptcb').prop('checked',data.hidedots);
              hidedots = data.hidedots;
          }
      });
      
    }
});
