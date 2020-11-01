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

      // restore any saved options
      restoreOptions();
      
      // set the options switch accordingly
      $('#myonoffswitch').change(function() {
          if(this.checked) onstate = true;
          else onstate = false;

          chrome.storage.local.set({"on":onstate}, function() {
            var msg;
            if(onstate) msg = "ON";
            else msg = "OFF";

            sendState();
          });
      });

      // sends full state info to all loaded FB tabs on any change
      function sendState() {

        chrome.tabs.query({ url: "*://*.twitter.com/*" }, function(tabs) {
                for(var i = 0; i < tabs.length; i++) {
                    chrome.tabs.sendMessage(
                        tabs[i].id, 
                        { on: onstate }, 
                        function(r) {
                            if(r != undefined) {
                              //console.log('sent message to a tab '+ 'and got msg back: '+r.farewell);
                            } else {
                              //console.log("callback r undefined");
                            }
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
    }
});
