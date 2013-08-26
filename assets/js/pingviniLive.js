$.ajax({
  headers : {'Accept':'application/json', 
             'Content-Type':'application/json'},
  url : 'https://api.github.com/gists/6330648',
  type : 'GET',
  success : function(response, textStatus, jqXhr) {
    var tableOut= response.files["rawTable"].content;
    var gamedata = {};
    try{
      gamedata = 
        jQuery.parseJSON(response.files[gameCode].content);
    }catch(err){
      alert("Game "+gameCode+" does not exist!");
      return;
    }      
    /*replace placeholders with data*/            
    if(gamedata["liveComments"].length<3){
        tableOut=tableOut.replace("[lcClass]", "hidden");       
    }
    var reg = new RegExp('\\[([^\\[]*)\\]', 'g');   
    var result;
    while((result = reg.exec(response.files["rawTable"].content)) 
           !== null) {
      tableOut=
        tableOut.replace("["+result[1]+"]", gamedata[result[1]]);
    }
    //add this game to output      
    $('#liveScore').html(tableOut);
  },
  error : function(jqXHR, textStatus, errorThrown) {},
  complete : function() {}
});
