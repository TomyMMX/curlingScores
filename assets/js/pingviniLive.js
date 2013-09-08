(function() {

  var onDomReadyIdentifier = 'onDomReady';
  var isBound = false;
  var readyList = [];

  if (window[onDomReadyIdentifier] && typeof window[onDomReadyIdentifier] == 'function') {
    return;
  }

  var whenReady = function() {
    // Make sure body exists, at least, in case IE gets a little overzealous.
    // This is taked directly from jQuery's implementation.
    if (!document.body) {
      return setTimeout(whenReady, 13);
    }

    for (var i=0; i<readyList.length; i++) {
      readyList[i]();
    }
    readyList = [];
  };

  var bindReady = function() {
    // Mozilla, Opera and webkit nightlies currently support this event
    if (document.addEventListener) {
      var DOMContentLoaded = function() {
        document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
        whenReady();
      };
      
      document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
      window.addEventListener("load", whenReady, false); // fallback
      
      // If IE event model is used
    } else if (document.attachEvent) {
      
      var onreadystatechange = function() {
        if (document.readyState === "complete") {
          document.detachEvent("onreadystatechange", onreadystatechange);
          whenReady();
        }
      };
      
      document.attachEvent("onreadystatechange", onreadystatechange);
      window.attachEvent("onload", whenReady); // fallback

      // If IE and not a frame, continually check to see if the document is ready
      var toplevel = false;

      try {
        toplevel = window.frameElement == null;
      } catch(e) {}

      // The DOM ready check for Internet Explorer
      if (document.documentElement.doScroll && toplevel) {
        var doScrollCheck = function() {

          // stop searching if we have no functions to call 
          // (or, in other words, if they have already been called)
          if (readyList.length == 0) {
            return;
          }

          try {
            // If IE is used, use the trick by Diego Perini
            // http://javascript.nwbox.com/IEContentLoaded/
            document.documentElement.doScroll("left");
          } catch(e) {
            setTimeout(doScrollCheck, 1);
            return;
          }

          // and execute any waiting functions
          whenReady();
        }  
        doScrollCheck();
      }
    } 
  };

  window[onDomReadyIdentifier] = function(callback) {
    // Push the given callback onto the list of functions to execute when ready.
    // If the dom has alredy loaded, call 'whenReady' right away.
    // Otherwise bind the ready-event if it hasn't been done already
    readyList.push(callback);
    if (document.readyState == "complete") {   
      whenReady();
    } else if (!isBound) {
      bindReady();
      isBound = true;
    }
  };
})();
function getGameBoard(){ 
  $('#liveScore').html("<div style=\"width: 100px; display: block; margin-left: auto; margin-right: auto; margin-bottom:5px;\"><img src=\"http://i.imgur.com/kV3lFh0.gif\" style=\"width:48px; height:48px;\"/></div>");
  $.ajax({
    headers : {'Accept':'application/json', 
               'Content-Type':'application/json'},
    url : 'https://api.github.com/gists/6330648',
    type : 'GET',
    success : function(response, textStatus, jqXhr) {
      var tableOut= response.files.rawTable.content;
      $('[id^=liveScore_]').each(function(index){
        var gameCode=$(this).attr('id').replace('liveScore_', '');  
        var gamedata = {};
        try{
            gamedata = jQuery.parseJSON(response.files[gameCode].content);
        }catch(err){
            alert("Game "+gameCode+" does not exist!");
            return;
        }      
        /*replace placeholders with data*/            
        if(gamedata.liveComments.length<3){
          tableOut=tableOut.replace("[lcClass]", "hidden");       
        }
        tableOut = tableOut.replace("[codeBtn]", "");
        var reg = new RegExp('\\[([^\\[]*)\\]', 'g');   
        var result;
        while((result = reg.exec(response.files.rawTable.content)) !== null) {
            tableOut=tableOut.replace("["+result[1]+"]", gamedata[result[1]]);
        }
        //add this game to output      
        $(this).html(tableOut);
        try{$('.boardBuffer').remove();}catch(err){}
      });
    },
    error : function(jqXHR, textStatus, errorThrown) {
       //$('#liveScore').html(errorThrown);
    },
    complete : function() {}
  });
  setTimeout(function(){
    getGameBoard();
  }, 300000); 
}

onDomReady(function() { 
    getGameBoard();
});
