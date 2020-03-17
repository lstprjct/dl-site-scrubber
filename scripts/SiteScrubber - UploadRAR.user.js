// ==UserScript==
// @name         SiteScrubber - UploadRAR
// @namespace    SiteScrubber
// @version      0.1
// @description  Scrub site of ugliness and ease the process of downloading
// @author       PrimePlaya24
// @icon         https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/icons/uploadrar_favicon.png
// @match        https://uploadrar.com/*
// @require      https://code.jquery.com/jquery-1.9.1.min.js
// @grant        none
// ==/UserScript==

// Modified script from uploadrar.com that runs the countdown timer
// changed to immediately finish and activate the download button.

var timeout; // jQ mobile kludge to prevent double-calling
$(document).ready(function()
{
	$('#countdown').each(function(i, e)
	{
		if(timeout) return;
		var downloadbtn = $(e).parent().find('.downloadbtn');
		$(downloadbtn).attr('disabled', false);
		timeout = setTimeout(tick, 1000);

		function tick()
		{
			console.log('Tick6969');
			var remaining = parseInt($(e).find(".seconds").text()) - parseInt($(e).find(".seconds").text());
			$(e).css('display', 'none');
			$('.downloadbtn').attr('disabled', false);

		}
	});
    // Clicks the download button to continue to the next page
    $("#downloadbtn").click()

    // Clicks the direct link button if it is present on the page
    if ($("#direct_link")) {
        setTimeout(function(){}, 3000);
        document.getElementById("direct_link").children[0].click();
    }
});