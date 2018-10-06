$(document).ready(function(){
  $(document).mousemove(function(e){
     TweenLite.to($('body'), 
        .5, 
        { css: 
            {
                backgroundPosition: ""+ parseInt(event.pageX/8) + "px "+parseInt(event.pageY/'12')+"px, "+parseInt(event.pageX/'15')+"px "+parseInt(event.pageY/'15')+"px, "+parseInt(event.pageX/'30')+"px "+parseInt(event.pageY/'30')+"px"
            }
        });
  });
});

$(document).ready(function() { 
	$('#olvidado').click(function(e) { 
		e.preventDefault(); 
		$('div#form-olvidado').toggle('500'); 
	}); 
	$('#acceso').click(function(e) { 
		e.preventDefault(); 
		$('div#form-olvidado').toggle('500'); 
	}); 
});