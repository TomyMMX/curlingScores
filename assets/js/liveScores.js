$(document).ready(function() { 
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
      var games = new Array();
      
      var i = 0;
      
      for (var key in response.files) {
        if (response.files.hasOwnProperty(key)) {
          if(key=="rawTable"){
            tableHtml= response.files[key].content;
          }
          else{
            games[i]=response.files[key].content;
            gameFiles[i]=key;
            i++;
          }
        }
      }       
      /*all other files are considered as JSON object representing games*/      
      for (var x = 0; x < games.length; x++) {   
        var gamedata = {};  
        try{     
          gamedata = jQuery.parseJSON(games[x]);
        }
        catch(err){
          continue;
        }
               
        var tableOut="<a data-toggle=\"modal\" href=\"#myModal\" id=\"btnCs_"+gameFiles[x]+"\" class=\"btn btn-primary btn-sm codeBtn\">Include code</a>"
        tableOut += tableHtml;
        if(gamedata["liveComments"].length<3){
          tableOut=tableOut.replace("[lcClass]", "hidden");       
        }
        var reg = new RegExp('\\[([^\\[]*)\\]', 'g');   
        var result;
        while((result = reg.exec(tableOut)) !== null) {
          tableOut=tableOut.replace("["+result[1]+"]", gamedata[result[1]]);   
        }
        
        //add this game to output      
        $('#generated').html($('#generated').html()+tableOut);
        $('#btnCs_'+gameFiles[x]).click(function(e){
          var ptp = $('#javaPrint').html();
          $('#javaPrint').html(ptp.replace("[gameCode]", $(this).attr('id').replace('btnCs_', '')));
        });
      }
      
      if($('#generated').is(':empty')){
        $('#generated').html("<p class=\"text-muted\">Nothing here yet. Please check back on the 6th of September 2013.</p>");
      }       
    },
    error : function(jqXHR, textStatus, errorThrown) {
      //alert("Error getting live games. "+errorThrown);
    },
    complete : function() {
        //console.log("Venue Patch Ran");
    }
  });
}
