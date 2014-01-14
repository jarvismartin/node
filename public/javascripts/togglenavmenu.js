// Toggle Nav Menu

$(function(){
  $("#hideNav").click(function(){
    $("#navContent").hide(200);
    // var audio = $("#gong")[0];
    // audio.pause();
    // audio.currentTime = 0;
  });
  
  $("#menu").click(function(){
    $("#navContent").show(200);
    // var audio = $("#gong")[0];
    // audio.play();
  });
  
  // $("#navContent").blur(function(){
  //   //$("#navContent").hide(200);
  //   alert('blur');
  // });
  
});