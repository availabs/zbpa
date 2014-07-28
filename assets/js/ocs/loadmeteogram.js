function loadMeteoGram(stid){
	if(this.readyRunning) {
		return false;
	}
	this.readyRunning = true;
	init_search();
	
	OCS.Meteogram.init({});
	
	OCS.Graphs.init({"tooltip_container":"met_tooltip","graph_container":"meteogram_graph","duration_values":['6h', '12h', '1d', '2d', '3d', '4d', '5d', '1w'], "duration": "1d"});
	OCS.Graphs.init_tooltip();
	
	// set_site_select_button('meteogram');
	
	// $('.current_obs_map area').click(function() {
	// 	stid = $(this).attr('stid').toLowerCase();
		
	// 	set_meteogram_site();
	// 	if (map_select_opened)
	// 	{
	// 		$.fn.colorbox.close();
	// 	}
	// });

	// generateSprites(".nav", "current-", true, 300, "slide");
	
	// //check the legend checkbox if needed
	// if(get_show_legend() == 1) {
	// 	$('#legend_visibility').attr('checked', true);
	// } else {
	// 	$('#met_tooltip').css('display', 'none');
	// 	$('#legend_visibility').attr('checked', false);
	// }
	

	// $(".product_map").mouseleave(function(e) {
	// 	$('#met_tooltip').css('display', 'none');
	// });

	// $(".product_map").mouseenter(function(e) {
	// 	if($("[name=legend_visibility]").is(':checked')) {
	// 		$('#met_tooltip').css('display', 'inline');
	// 	} else {
	// 		$('#met_tooltip').css('display', 'none');
	// 	}
	// });
	
	// $("[name=legend_visibility]").change(function(e) {
	// 	if(e.target.checked) {
	// 		$('#met_tooltip').css('display', 'inline');
	// 		save_show_legend(1);
	// 	} else {
	// 		save_show_legend(0);
	// 		$('#met_tooltip').css('display', 'none');
	// 	}
	// });
}