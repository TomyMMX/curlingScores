$(document).ready(function() { 
  $('#generated').html("<div style=\"width: 10px; display: block; margin-left: auto; margin-right: auto; margin-bottom:5px;\"><img src=\"http://i.imgur.com/kV3lFh0.gif\"/></div>");
  generateTables();
});

var gameFiles = new Array();
function generateTables(){ 
   //generate HTML from gist  
   $.support.cors = true;
   $.ajax({
    headers : {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
    },
    url : 'https://api.github.com/gists/6330648',
    type : 'GET',
    success : function(response, textStatus, jqXhr) {
      var tableHtml = "";
      var games = {};
      var gameFiles = {};      

      for (var key in response.files) {
        if (response.files.hasOwnProperty(key)) {
          if(key=="rawTable"){
            tableHtml= response.files[key].content;
          }
          else{
            var gd = jQuery.parseJSON(response.files[key].content); 
            try{
              var b = games[gd["eventName"]].length;
            }catch(err){
              games[gd["eventName"]]=[];
              gameFiles[gd["eventName"]]=[];
            }                                   
            games[gd["eventName"]][games[gd["eventName"]].length]=response.files[key].content;                     
            gameFiles[gd["eventName"]][gameFiles[gd["eventName"]].length]=key;
          }
        }
      }  
      $('#generated').html(""); 
      /*all other files are considered as JSON object representing games*/      
      for (var event in games) {  
        $('#generated').html($('#generated').html()+"<h3>"+event+"</h3>");
        for (var x = 0; x < games[event].length; x++) {  
          var gamedata = {};  
          try{     
            gamedata = jQuery.parseJSON(games[event][x]);
          }
          catch(err){
            continue;
          }                 
          addGame(gamedata, tableHtml, gameFiles[event][x]);
        }
      }        
      $('[id ^=btnCs_]').each(function( index ) {  
        $(this).click(function(e){
          var fN = $(this).attr('id').replace('btnCs_', '');
          $('#javaPrint').html($('#javaPrint').html().replace(prevCode, fN));
          prevCode=fN;
          $('#myModal').modal();
        });
      });
      if($('#generated').is(':empty')){
        $('#generated').html("<p class=\"text-muted\">Nothing here yet. Please check back on the 6th of September 2013.</p>");
      }       
    },
    error : function(jqXHR, textStatus, errorThrown) {
      $('#generated').html(errorThrown); 
    },
    complete : function() {
        //console.log("Venue Patch Ran");
    }
  });
}
var prevCode = '[gameCode]';
function addGame(gamedata, tableHtml, fileName){  
  var tableOut = tableHtml;
  
  tableOut = tableOut.replace("[codeBtn]", "<a data-toggle=\"modal\" style=\"clear:both;\" id=\"btnCs_"+fileName+"\" class=\"btn btn-primary btn-sm score-code-btn\">Include code</a>");
  
  if(gamedata["liveComments"].length<3){
    tableOut=tableOut.replace("[lcClass]", "hidden");       
  }
  var reg = new RegExp('\\[([^\\[]*)\\]', 'g');   
  var result;
  while((result = reg.exec(tableHtml)) !== null) {
    tableOut=tableOut.replace("["+result[1]+"]", gamedata[result[1]]);   
  }  
  //add this game to output      
  $('#generated').html($('#generated').html()+tableOut);  
}

