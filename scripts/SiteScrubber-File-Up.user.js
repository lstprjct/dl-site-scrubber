// ==UserScript==
// @name         SiteScrubber - File-Up
// @namespace    SiteScrubber
// @version      0.2
// @description  Scrub site of ugliness and ease the process of downloading from File-Up.org
// @author       PrimePlaya24
// @icon         https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/icons/file-up_favicon.png
// @homepageURL  https://github.com/PrimePlaya24/dl-site-scrubber
// @supportURL   https://github.com/PrimePlaya24/dl-site-scrubber/issues
// @updateURL    https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-file-up.meta.js
// @downloadURL  https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-File-Up.user.js
// @match        https://www.file-up.org/*
// @require      https://code.jquery.com/jquery-1.9.1.min.js
// @run-at       document-start
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    window.tick = 4;
    window.submit_form = function submit_form() {
        // clearTimeout(timeout);
        // var remaining = 3;
        var timeout = setTimeout(ticky, 1000);
		function ticky() {
			var remaining = window.tick - 1;
            window.tick = remaining;
			if(remaining <= 0)
			{
				$("form[name='F1']")[0].submit();
			}
			else
			{
				$("#downloadbtn").text("Submitting in: " + remaining.toString());
				setTimeout(ticky, 1000);
			}
		}
    }

    // styling
    $(document).ready(function() {
        $("body > section > div > div").css("background-color", "#323232");
        $("body > section").css("background-color", "#212121");
        $("body").css("background-color", "#121212");
        $("html").css("background-color", "#121212");
        $("body").css("color", "white");
    });

    $(document).ready(function() {
        // Clicks the "FREE" method instantly
        if ($("input[name='method_free']")[0]) {
            $("input[name='method_free']")[0].click();
        }
    });


    $(document).ready(function() {
        if ($("#downloadbtn")[0]) {

            for (var i = 0; i < $("div").length; i++) {
                if ($("div")[i].style.cssText == "margin: 10px 0px;") {
                    $($("div")[i]).text("You have to wait for the timer to complete otherwise the server will reject your early request, sadly.")
                $($("div")[i]).addClass("alert alert-warning");
                }
            }

            $("#downloadbtn").css("font-size", "35px");

            // $("div.alert.alert-danger").remove(); // Need to show what the user did wrong (i.e. Skipped countdown)
            $("body > section > div > div.page-wrap > div.text-center").remove();
            $("body > section > div > div.page-wrap > div.row").remove();
            $("body > section > div > div.page-wrap > div.leftcol").remove();
            $("body > section > div > div.page-wrap > form > div:nth-child(8)").remove();
            $("body > section > div > div.row").remove();
            $("body > section > div > h1").remove();

            $("body > section > div > div > form > div > div > div.captcha-wrap").append($("<div class=\"alert alert-warning\">TO PREVENT MALICIOUS REDIRECT, <b>HOVER</b> OVER THE BUTTON FOR 2 SECONDS TO SUBMIT CLEANLY</div>"));

            $("#downloadbtn").text("HOVER to SUBMIT Safely");

            $("#downloadbtn").mouseenter(function () {
                $(this).data('timeout', setTimeout(function () {
                    submit_form();
                }, 2000));
            }).mouseleave(function () {
                clearTimeout($(this).data('timeout'));
            });
        } else {
            $("#download-btn").css("font-size", "35px").text("HOVER (2 secs) to DOWNLOAD");
            $("#download-btn")[0].click();
            $("#download-btn").mouseenter(function () {
                $(this).data('timeout', setTimeout(function () {
                    $("#download-btn")[0].click();;
                }, 2000));
            }).mouseleave(function () {
                clearTimeout($(this).data('timeout'));
            });
            $("div.blocktxt").remove();
            $("center").remove();
            $("body > section > div > div > div:nth-child(5)").remove();
            // $("div.page-wrap > div.text-center").remove();
            $("body > section > div > div > div:nth-child(4)").remove();
        }

    });

	setInterval(clean, 250);
    function clean() {
		/*

		Clean function that can be used on any part of the download process

		*/

        // Remove crap not needed
        $("header").remove();
        $(".breaking-news").remove();
        $("footer").remove();
        $("#fb-root").remove();
        $(".page-buffer").remove();
        $("noscript").remove();
        $(".abtlikebox").remove();
        $("ins").remove();
        $(".scrollToTop").remove();
        $("style").remove();
        $("#adblockinfo").remove();
        $("#google_esf").remove();
        $("#bannerad").remove();
        $(".adsbox").remove();
        $("div.blocktxt").remove();


        $('#countdown').each(function(i, e){
            var downloadbtn = $(e).parent().find('.downloadbtn');
            $(downloadbtn).attr('disabled', false);
            $(e).css('visibility', 'visible');
            $('.downloadbtn').attr('disabled', false);
            //$(e).find(".seconds").text("0");
        });

        var iframes = $("iframe");
        for (var k = 0; k < iframes.length; k++) {
            if (!iframes[k].src.includes("google")) {
                iframes[k].remove();
            }
        }

        // Remove all scripts that are not from google
        var scripts = $("script");
        for (var s = 0; s < scripts.length; s++) {
            if (!scripts[s].src.includes("google")) {
                scripts[s].remove();
            }
        }

        // Set functions to "undefined" so that they cannot run and cause ads and crap
        window.WOW = undefined
        window.eve = undefined
        window.mina = undefined
        window.Snap = undefined
        window.google_js_reporting_queue = undefined
        window.google_srt = undefined
        window.google_ad_modifications = undefined
        window.google_logging_queue = undefined
        window.ggeac = undefined
        window.google_measure_js_timing = undefined
        window.googleToken = undefined
        window.googleIMState = undefined
        window.processGoogleToken = undefined
        window.google_reactive_ads_global_state = undefined
        window.adsbygoogle = undefined
        window._gfp_a_ = undefined
        window.google_sa_queue = undefined
        window.google_sl_win = undefined
        window.google_process_slots = undefined
        window.google_spfd = undefined
        window.google_sv_map = undefined
        window.google_t12n_vars = undefined
        window._0xbc13 = undefined
        window.zfgformats = undefined
        window.setImmediate = undefined
        window.clearImmediate = undefined
        window._snxze = undefined
        window._gwqjpy = undefined
        window._atrk_opts = undefined
        window._gaq = undefined
        window.zfgproxyhttp = undefined
        window.FB = undefined
        window.Goog_AdSense_getAdAdapterInstance = undefined
        window.Goog_AdSense_OsdAdapter = undefined
        window.google_sa_impl = undefined
        window.google_jobrunner = undefined
        window.google_persistent_state_async = undefined
        window.__google_ad_urls = undefined
        window.google_global_correlator = undefined
        window.__google_ad_urls_id = undefined
        window.google_prev_clients = undefined
        window.gaGlobal = undefined
        window.ampInaboxIframes = undefined
        window.ampInaboxPendingMessages = undefined
        window.google_iframe_oncopy = undefined
        window.google_osd_loaded = undefined
        window.google_onload_fired = undefined
        window._gat = undefined
        window.atrk = undefined
        window._atrk_fired = undefined
        window.Goog_Osd_UnloadAdBlock = undefined
        window.Goog_Osd_UpdateElementToMeasure = undefined
        window.google_osd_amcb = undefined
        window._jged2npg2ir = undefined
        window._n0iqoa4himl = undefined
        window.onClickTrigger = undefined
        window.zfgloadedpopup = undefined
        window.GoogleGcLKhOms = undefined
        window.google_image_requests = undefined
        window.ppuWasShownFor2572202 = undefined
    }


})();