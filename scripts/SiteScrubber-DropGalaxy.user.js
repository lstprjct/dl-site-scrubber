// ==UserScript==
// @name         SiteScrubber - DropGalaxy
// @namespace    SiteScrubber
// @version      0.1
// @description  Scrub site of ugliness and ease the process of downloading
// @author       PrimePlaya24
// @icon         https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/icons/DropGalaxy_favicon.png
// @homepageURL  https://github.com/PrimePlaya24/dl-site-scrubber
// @supportURL   https://github.com/PrimePlaya24/dl-site-scrubber/issues
// @updateURL    https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-DropGalaxy.meta.js
// @downloadURL  https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-DropGalaxy.user.js
// @match        https://dropgalaxy.com/*
// @require      https://code.jquery.com/jquery-1.9.1.min.js
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function clean_scripts() {
        var scripts = $("script");
        for (var l = 0; l < scripts.length; l++) {
            if (!scripts[l].src.includes("google") && !scripts[l].src.includes("gstatic")) { // && scripts[l].src != "") {
                scripts[l].remove();
            }
        }
    }
    clean_scripts();

    // Modified script to immediately show the download button
    // Original: https://dropgalaxy.com/js/countdown.js

    var timeout; // jQ mobile kludge to prevent double-calling

    $(document).ready(function() {
        $('#countdown').each(function(i, e) {
            if(timeout) return;
            var downloadbtn = $(e).parent().find('.downloadbtn');
            $(downloadbtn).attr('disabled', false);
            $(e).fadeOut();
            $('.downloadbtn').attr('disabled', false);
        });
    });

    // End of modified script


    $('#downloadbtn').click(function() {
		this.form.submit();
	});

    // Clean up
    $("nav").remove();
    $("body > div:last-child").remove();
    $("#gdpr-cookie-notice").remove();
    $("#warning").remove();
    $(".downloadPage > .col-md-12").remove();
    $(".row > .col-md-8").remove();
    $(".adsbygoogle").remove();
    $(".adsbox").remove();
    $("form > div.mt-5.text-center").remove()
    $("body > div > div.row").addClass("justify-content-center");
    $("body > div > div.row > div.col-md-4.mt-5").removeClass("col-md-4").addClass("col-md-8");
    $("#adblock_check").remove();
    $("#adblock_detected").remove();
    $("footer").remove();

    // If on the direct download page
    var clicked = false;
    function dl_page_cleaner() {
        setTimeout(function() {}, 500);
        // $("body > div.container.pt-5.page.downloadPage > div > div.col-md-4.mt-5.text-center > a")
        if ($("a")[0].text == "Click here to download") {
            $("body > div.container.pt-5.page.downloadPage > div > div.col-md-12.py-3").remove();
            if (!clicked) {
                $("a")[0].click()
                clicked = true;
            }
            return true;
        } else {
            return false;
        }
    }

    while (!clicked) {
        dl_page_cleaner();
    }

    //const cleanable = setTimeout(clean2, 500);
    //setInterval(dl_page_cleaner, 500);
})();