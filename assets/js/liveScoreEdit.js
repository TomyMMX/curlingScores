$(document).ready(function() {
  loadPastGames(); 
  $("[id ^=tbS]").focus(function() { 
        $(this).select(); 
  });
  $('[id ^=tbS]').each(function( index ) {  
    $(this).addClass("text-center");
    $(this).keydown(function(event) {
      // Allow: backspace, delete, and enter
      if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 13 || 
         // Allow: Ctrl+A
         (event.keyCode == 65 && event.ctrlKey === true)) {
         // let it happen, don't do anything
         return;
      }
      else {
        // Ensure that it is a number and stop the keypress
        if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
        event.preventDefault(); 
        }   
      }
    });    
  });  
  /*Change Events*/
  $(".hammer").click(function() {
    $(".hammer").each(function(index) {  
      if($(this).children().hasClass("hidden"))
        $(this).children().removeClass("hidden");
      else
        $(this).children().addClass("hidden");
    });      
    generateTableJson();
  });
  $('input[id^=tbS], #opponent, #tbLocation, #tbDateTime, #tbEvent, #liveComments').change(function() { 
    var currentId = $(this).attr('id');
    var cidLen = currentId.length-1;
    var otherId = currentId.replaceAt(cidLen, 
                                      currentId.charAt(cidLen) == '1' ? '2' :'1');       
    $("#"+otherId).val("");      
    generateTableJson();
  });
    
  $('.alert .close').click(function(e) {
    $(this).parent().hide();
  });
  
  $("#btnAddGame").click(function(e){
    generateNewGame();
  });
  
  $("#btnBack").click(function(e){
    $("#scoreTable").slideDown('slow');
    $("#liveEditor").fadeOut('slow');
  });
    
  String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
  }
  sumScore();  
});

function sumScore(){
  /*SUM team scores*/
  for(var tn=1;tn<=2;tn++){
    var sum=0;
    $('[id ^=tbS][id $='+tn+']').each(function( index ) {
       var pi = parseInt($(this).val());
       if(!isNaN(pi))
        sum+=+pi;
    });      
    $("#final"+tn).html("<strong>"+sum+"</strong>");
  }
}

function showEditor(){
  $("#scoreTable").slideUp('slow');
  $("#liveEditor").fadeIn('slow');
}

function generateNewGame(){
  if($("#tbNewEvent").val()!="" && $("#tbNewLocation").val()!="" && $("#tbNewDateTime").val()!=""){
      
    clearEditTable();
    var newName = randomString(8, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    $("#tbFile").val(newName);
    $("#tbEvent").val($("#tbNewEvent").val());
    $("#tbLocation").val($("#tbNewLocation").val());
    $("#tbDateTime").val($("#tbNewDateTime").val());
    $("#tbNewDateTime").val("");
    $("#tbNewLocation").val("");
    $("#tbNewEvent").val("");

    var newRow = "<tr><td id=\"lbEv_"+newName+"\">"+$("#tbEvent").val()+"</td><td id=\"lbLc_"+newName+"\">"+$("#tbLocation").val()+"</td><td id=\"lbTm_"+newName+"\">"+$("#tbDateTime").val()+"</td><td id=\"lbOpp_"+newname+"\"></td><td><button id=\"btnE_"+newName+"\" type=\"button\" class=\"btn btn-primary btn-xs\">Edit</button></td></tr>";   
    $("#pastTable").html($("#pastTable").html()+newRow);

    $('#btnE_'+newName).click(function(e){
      editExistingGame(newName);
    });

    gameFiles[gameFiles.length] = newName;  
    
    showEditor();
  }
  else{
    showError("<strong>Error!</strong> Enter all data first.");
  }
}

function editExistingGame(gameName){
  clearEditTable();    
  var thisGame = games[gameFiles.indexOf(gameName)];

  for(var i=1;i<=2;i++){
    for(var j=1;j<=10;j++){
      var t = thisGame["tbS"+j+i];
      $("#tbS"+j+i).val(t);
    }
  }     
  $("#tbFile").val(gameName);
  $("#tbSe1").val(thisGame["tbSe1"]);   
  $("#tbSe2").val(thisGame["tbSe2"]);      
  $("#opponent").val(thisGame["opponent"]);
  $("#teamName").val(thisGame["teamName"]);
  $("#tbLocation").val(thisGame["location"]);
  $("#tbDateTime").val(thisGame["dateTime"]);
  $("#tbEvent").val(thisGame["eventName"]);
 
  $(".hammer").each(function(index) {  
    if(thisGame["H"+(index+1)]=='hidden'){
      $(this).children().addClass("hidden");
    }else{
      $(this).children().removeClass("hidden");
    }
  });
      
  var regex = new RegExp("<br>", "g");
  $("#liveComments").val(thisGame["liveComments"].replace(regex, "\n"));  
  
  sumScore();
  showEditor();
}

function clearEditTable()
{
   $("#liveEditor input").val(""); 
   sumScore();
}

function showError(errorText)
{
  $("#errorText").html(errorText);
  $(".alert-error").fadeIn("slow");  
  setTimeout(function() {$(".alert-error").fadeOut('slow');}, 3000);     
}

/*Generate JSON object for current table state*/   
function generateTableJson(){    
  sumScore();
  var data = {};
  data["location"]=$("#tbLocation").val();
  data["dateTime"]=$("#tbDateTime").val();
  data["eventName"]=$("#tbEvent").val();
  data["final1"]=$("#final1").text();
  data["final2"]=$("#final2").text();
  data["opponent"]=$("#opponent").val();
  data["teamName"]=$("#teamName").val();
  data["liveComments"]=$("#liveComments").val();
  
  var regex = new RegExp("\n", "g");
  data["liveComments"] = data["liveComments"].replace(regex, "<br>");
  regex = new RegExp('"', "g");
  data["liveComments"] = data["liveComments"].replace(regex, "'");
  
  $(".hammer").each(function(index) {  
    if(!$(this).children().hasClass("hidden")){
      data["H"+(index+1)]="";
    }
    else{
       data["H"+(index+1)]="hidden";
    }
  });
  $('[id ^=tbS]').each(function( index ) {
     data[$(this).attr('id')]= $(this).val();
  }); 
    
  games[gameFiles.indexOf($("#tbFile").val())] = data;      
  var curFile = $("#tbFile").val();
  var gistEditData = {};
  gistEditData.files={};
  gistEditData.files[curFile]={};
  gistEditData.files[curFile].content=JSON.stringify(data);   
  
  var accessToken = readCookie("liveScoreAccessToken");
    if(accessToken==null){
    var entered=prompt("Please enter the access token.","");
    if (entered!=null){
      accessToken=entered;
      createCookie("liveScoreAccessToken", accessToken, 14);
    }
    else{
      return;
    }
  }
  $.ajax({
    headers : {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
    },
    url : 'https://api.github.com/gists/6330648?access_token='+accessToken,
    type : 'PATCH',
    data : JSON.stringify(gistEditData),
    success : function(response, textStatus, jqXhr) {
        $(".alert-success").fadeIn("slow");  
        setTimeout(function() {$(".alert-success").fadeOut('slow');}, 3000); 
    },
    error : function(jqXHR, textStatus, errorThrown) {
        showError("<strong>Error!</strong> Could not save change. Reason: "+errorThrown);
        if(errorThrown=="Unauthorized"||errorThrown=="Forbidden"){
          eraseCookie("liveScoreAccessToken");
        }
    },
    complete : function() {
        //console.log("Venue Patch Ran");
    }
  });
  
  $("#lbEv_"+curFile).text(data["eventName"]);
  $("#lbLc_"+curFile).text(data["location"]);
  $("#lbTm_"+curFile).text(data["dateTime"]);
  $("#lbOpp_"+curFile).text(data["opponent"]);
  
}

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

var games = [];
var gameFiles = [];
/*get existing games and fill table*/
function loadPastGames(){
  $('#pastTable').html("<tr><td colspan=3><div style=\"display: block; margin-left: auto; margin-right: auto; margin-bottom: 3px; width:0px;\"><img src=\"http://i.imgur.com/kV3lFh0.gif\"></div><td><tr>");
  //generate HTML from gist     
  $.get('https://api.github.com/gists/6330648', function(data) {
    games = [];
    gameFiles = [];
    var i = 0;
    for (var key in data.files) {
      if (data.files.hasOwnProperty(key)) {
        if(key!="rawTable"){ 
          try{ 
            games[i]=jQuery.parseJSON(data.files[key].content);
            gameFiles[i]=key;
            i++;        
          }
          catch(err){
            continue;
          }
        }
      }
    }      
    /*load table rows from JSON objects representing games*/  
    var pastHtml="";    
    for (var x = 0; x < games.length; x++) {             
      var gamedata = games[x];
       
      var newRow = "<tr><td id=\"lbEv_"+gameFiles[x]+"\">[event]</td><td id=\"lbLc_"+gameFiles[x]+"\">[location]</td><td id=\"lbTm_"+gameFiles[x]+"\">[time]</td><td id=\"lbOpp_"+gameFiles[x]+"\">[opponent]</td><td><button id=\"btnE_[file]\" type=\"button\" class=\"btn btn-primary btn-xs\">Edit</button></td></tr>";   
      newRow = newRow.replace("[event]", gamedata["eventName"]);
      newRow = newRow.replace("[location]", gamedata["location"]);
      newRow = newRow.replace("[time]", gamedata["dateTime"]);
      newRow = newRow.replace("[opponent]", gamedata["opponent"]);
      newRow = newRow.replace("[file]", gameFiles[x]);
      pastHtml+=newRow;
    }
    $("#pastTable").html(pastHtml);
    
    $('button[id^=btnE]').click(function(e){
      editExistingGame($(this).attr('id').substring(5));
    });
  });
}

/*Cookie manipulation*/
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}
