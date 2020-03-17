// ==UserScript==
// @name         SiteScrubber - File-Up
// @namespace    SiteScrubber
// @version      0.1
// @description  Scrub site of ugliness and ease the process of downloading
// @author       PrimePlaya24
// @icon         https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/icons/file-up_favicon.png
// @homepageURL  https://github.com/PrimePlaya24/dl-site-scrubber
// @supportURL   https://github.com/PrimePlaya24/dl-site-scrubber/issues
// @updateURL    https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-file-up.meta.js
// @downloadURL  https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-File-Up.user.js
// @match        https://www.file-up.org/*
// @require      https://code.jquery.com/jquery-1.9.1.min.js
// @run-at       document-body
// @grant        none
// ==/UserScript==


(function() {
    'use strict';
    // Modified site's function to auto show the download button immediately
    $(document).ready(function() {
        $('#countdown').each(function(i, e) {
            var downloadbtn = $(e).parent().find('.downloadbtn');
            $(downloadbtn).attr('disabled', false);
            $(e).css('visibility', 'visible');
            $('.downloadbtn').attr('disabled', false);
        });
    });

    //$("script").remove();

    // deloplen.com

    var scripts = $("script");
    for (var l = 0; l < scripts.length; l++) {
        if (scripts[l].src.includes("deloplen")) {
            scripts[l].remove();
        }
    }
    // Remove crap not needed
    $("header").remove();
    $(".breaking-news").remove();
    $("footer").remove();
    $("#fb-root").remove();
    $(".page-buffer").remove();
    //$(".row").remove();

    // setTimeout(function() {$("iframe").remove();}, 1750);

    $(".abtlikebox").remove();
    $("ins").remove();
    $(".scrollToTop").remove();
    $("style").remove();
    $("#adblockinfo").remove();
    /*
    setTimeout(function() {$("#adblockinfo").remove();}, 3000);
    $(".adsbox").remove();
    $("h1").remove();
    $("body").append($("form")[0]);
    $("body").children("div").remove();
    $("body").children("section").remove();
    $("body > div").remove();
    setTimeout(function() {$("form").children("div")[1].remove();}, 5000);

    var timeout; // jQ mobile kludge to prevent double-calling*/

    $(document).ready(function() {
        $('.downloadbtn').attr('disabled', false);
        $("#downloadbtn").removeAttr("disabled");
    });


    $("#downloadbtn").removeAttr("disabled");

    // Auto function to keep checking for and removing iFrames from popping up
    setInterval(clean, 1000);
    function clean() {
        $("#downloadbtn").removeAttr("disabled");
        var t = $("iframe");
        for (var k = 0; k < t.length; k++) {
            if (!t[k].src.includes("google")) {
                t[k].remove();
            }
        }

        // Remove all scripts that are not from google
        var y = $("script");
        for (var s = 0; s < y.length; s++) {
            if (!y[s].src.includes("google")) {
                y[s].remove();
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