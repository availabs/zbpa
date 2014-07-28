// global variables
var search_delay = '';
var map_select_opened = false;
var cookie_domain = null;


// functions
function init_search()
{
	$("#keywords").keyup(function(e){
		if (e.keyCode == 13)
		{
			process_search();
		}
		else
		{		
			if (search_delay) 
			{
				clearTimeout(search_delay);
			}
			search_delay = setTimeout("process_search()",750);
		}
		
	});
	$("#searchform").submit(function(){
		return false;
	});	
	$("html").click(function(){
		$("#search_recommendations").fadeOut(function(){
			$("#search_recommendations").html('<center><img src="/scripts/colorbox/images/loading.gif" style="padding: 20px"></center>');		
		}); 
	});
	
	$("#keywords").focus(function(e){
		val = $("#keywords").val();
		if (val == '  Search')
		{
			$("#keywords").val('');
			$("#keywords").css('color','black');
		}
	});
	$("#keywords").blur(function(e){
		val = $("#keywords").val();
		if (val == '')
		{
			$("#keywords").val('  Search');
			$("#keywords").css('color','#cccccc');
		}
	});
	
	
	
	
}

function process_search()
{
	if ($("#keywords").val().length < 1 || $("#keywords").val() == '  Search') 
	{ 
		$("#search_recommendations").fadeOut(function(){
			$("#search_recommendations").html('<center><img src="/scripts/colorbox/images/loading.gif" style="padding: 20px"></center>');		
		}); 
	}
	else
	{
		if ($("#keywords").val().length > 2) 
		{
			$("#search_recommendations").fadeIn();
			//vars = "keywords=" + $("#keywords").val();
			vars = $("#searchform").serialize();
			//vars = "ACT=4&XID=4f89c5370343763aaf2feae99ad93a3aef72e1b0&RP=search%2Fresults&NRP=&RES=&status=&search_in=&site_id=1&" + vars;
			
			$.post("/index.php/search/recommendations/", vars, function(data) {
				$("#search_recommendations").html(data);
				$(".recommend_item").click(function(){
					link = $(this).attr('link');
					document.location.href = link;
				});
				
/*
				$('#recommend_table tr.recommend_current').focus();				
				$(document.documentElement).keyup(function (event) {
					if (event.keyCode == 37) {
						$('#recommend_table tr.recommend_current').parent().prev().click();	
					} 
					else if (event.keyCode == 39) 
					{
						$('#recommend_table tr.recommend_current').parent().next().click();
					}
				});
*/
				
				
				
			});
		}
		
	}
}

function set_site_select_button(page)
{
	$('#site_button_home').live('click', function(e){
	  e.preventDefault();
		$.fn.colorbox({
			width: "740px",
			height: "440px",
			href:'/index.php/site/site_select/',
			opacity: 0.85,
			onComplete: function() {

				$("#zip").keyup(function(e){
					if (e.keyCode == 13)
					{
						find_sites(page);
					}
					else
					{		
						if (search_delay) 
						{
							clearTimeout(search_delay);
						}
						search_delay = setTimeout("find_sites('" + page + "')",750);
					}
					
				});
				$("#site_select_form").submit(function(){
					return false;
				});
				$("#zip").focus();
				find_sites(page);
				set_map_tooltips();
			},
			onOpen: function() {
				map_select_opened = true;
			},
			onClosed: function() {
				map_select_opened = false;
			}
		});
	});
	
/*
	$('.current_obs_map area').click(function() {
		stid = $(this).attr('stid').toLowerCase();
		$.get('/index.php/site/current_box/' + stid, function(data) {
			$('#current_conditions').html(data);
			set_site_select_button();
		});
		if (map_select_opened) $.fn.colorbox.close();
	});
*/
}



function set_current_box(refreshing)
{
  var refreshing = refreshing || false;
  if (refreshing) {
    stid = $.cookie('stid') || stid;
  }
	save_local_stid(stid);
	timestamp = new Date().getTime();
	$.get('/index.php/site/current_box/' + stid + '/' + timestamp, function(data) {
		$('#current_conditions').html(data);
		set_site_select_button();
	});	
}


function set_meteogram_site()
{
	save_local_stid(stid);
	document.location.href = '/index.php/weather/meteogram/' + stid;
}


function set_local_page()
{
	save_local_stid(stid);
	document.location.href = '/index.php/weather/local/' + stid;
}

function set_forecast_page()
{
	save_local_stid(stid);
	document.location.href = '/index.php/forecast/local_and_regional/' + stid;
}

function set_soil_moisture_page()
{
	save_local_stid(stid);
	document.location.href = '/index.php/weather/soil_moisture/' + stid;
}

function set_soil_temperature_page()
{
	save_local_stid(stid);
	document.location.href = '/index.php/weather/soil_temperature/' + stid;
}

function set_soil_moisture_duration(days)
{
	document.location.href = '/index.php/weather/soil_moisture/' + stid + "/" + days;
}

function set_soil_temperature_duration(days)
{
	document.location.href = '/index.php/weather/soil_temperature/' + stid + "/" + days;
}

function save_local_stid(stid)
{
	$.cookie("stid", stid, { domain: get_cookie_domain(), path: '/', expires: 30 });
}

function save_show_legend(state) {
	$.cookie("show_legend", state, { domain: get_cookie_domain(), path: '/', expires: 30 });
}

function get_show_legend() {
	return $.cookie('show_legend') === null ? true : $.cookie('show_legend');
}

function find_sites(page)
{  
	if ($("#zip").val().length < 1) 
	{ 
			$.post("/index.php/site/site_select_results/", function(data) {
				$("#site_results").html(data);
				$(".stid_link").live('click', function(){
					stid = $(this).attr('stid').toLowerCase();

					if (page == 'local')
					{
						set_local_page();
					}
					else if (page == 'soil_moisture')
					{
  					set_soil_moisture_page();
					}
					else if (page == 'forecast')
					{
					  set_forecast_page();
					}
					else if (page == 'meteogram')
					{
						set_meteogram_site();
					}
					else if (page == 'station_monthly_summaries')
					{
						$("[name=stid]").val(stid.toUpperCase());
					}
					else
					{
						set_current_box();	
					}
					$.fn.colorbox.close();
				});								
			});
	}
	else
	{
		if ($("#zip").val().length > 2) 
		{
			vars = $("#site_select_form").serialize();
			$.post("/index.php/site/site_select_results/", vars, function(data) {
				$("#site_results").html(data);
				$(".stid_link").live('click', function(){
					stid = $(this).attr('stid').toLowerCase();

					if (page == 'local')
					{
						set_local_page();
					}
					else if (page == 'soil_moisture')
					{
  					set_soil_moisture_page();
					}
					else if (page == 'forecast')
					{
					  set_forecast_page();
					}
					else if (page == 'meteogram')
					{
						set_meteogram_site(stid);
					}
					else if (page == 'station_monthly_summaries')
					{
						$("[name=stid]").val(stid.toUpperCase());
					}
					else
					{
						set_current_box();	
					}
									
					$.fn.colorbox.close();
				});								
			});
		}		
	}
}

function set_map_tooltips()
{
	$('.current_obs_map area').each(function()
	{
		$(this).qtip({
			content: $(this).attr('alt'), // Use the ALT attribute of the area map
			show: {
				solo: true
			},
			position: {
				my: 'bottom left',  // Position my bottom left...
				at: 'top right', // at the top right of...
				adjust: {
					x: -8
				}
			},
			style: {
				classes: 'qtip-blue'
			}
	});

/*
		$(this).qtip({
			content: $(this).attr('alt'), // Use the ALT attribute of the area map
			position: {
				corner: {
					target: 'top',
					tooltip: 'bottomLeft'
				},
				adjust: {
					x: 0,
					y: -5
				}
			},
			style: {
				name: 'blue', // Give it the preset dark style
				border: {
			   width: 0, 
			   radius: 4 
			  }, 
			  tip: true // Apply a tip at the default tooltip corner
			},
			hide: {
				when: 'mouseout',
				fixed: true
			}
		});
*/
		$(this).qtip("focus");
	});
}


function image_refresh(image,obj)
{
	timestamp = new Date().getTime();
	$("." + obj).attr("src",image + "?" + timestamp);
}

/**
 * Set the Cookie Domain to the current domain and all subdomains
 * We check to see if the http_host is a testing domain (starts with "x") 
 * and if not, then we determine how to set the other.
 * For a HTTP_HOST of x.y.z
 *   if z is "org" or "us", then the domain should be y.z
 *   if z is "gov" or "edu", then the domain should be x.y.z
 */
function get_cookie_domain()
{
  var domain = window.location.host;
  if (cookie_domain){
    return cookie_domain;
  } else {
    var url = domain;
    //if (url.substr(0, 1) != 'x'){
      var matches = url.match(/([a-zA-Z0-9\-]+\.)?([a-zA-Z0-9\-]+)\.(org|us|local|gov|edu)/i);
      if (matches[3] == 'org' || matches[3] == 'us' || matches[3] == 'local')
      {
        domain = matches[2] + '.' + matches[3];
      }
      else if (matches[3] == 'gov' || matches[3] == 'edu')
      {
        domain = matches[1] + matches[2] + '.' + matches[3];
      }
    //}
  }
  return domain;
}



/**
* hoverIntent r6 // 2011.02.26 // jQuery 1.5.1+
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
* 
* @param  f  onMouseOver function || An object with configuration options
* @param  g  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne brian(at)cherne(dot)net
*/
(function($){$.fn.hoverIntent=function(f,g){var cfg={sensitivity:7,interval:100,timeout:0};cfg=$.extend(cfg,g?{over:f,out:g}:f);var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if((Math.abs(pX-cX)+Math.abs(pY-cY))<cfg.sensitivity){$(ob).unbind("mousemove",track);ob.hoverIntent_s=1;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=0;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=jQuery.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type=="mouseenter"){pX=ev.pageX;pY=ev.pageY;$(ob).bind("mousemove",track);if(ob.hoverIntent_s!=1){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).unbind("mousemove",track);if(ob.hoverIntent_s==1){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.bind('mouseenter',handleHover).bind('mouseleave',handleHover)}})(jQuery);
