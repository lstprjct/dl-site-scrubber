// ==UserScript==
// @name AntiAdware
// @name:fr AntiAdware
// @name:de AntiAdware
// @name:zh-TW AntiAdware
// @name:zh-CN AntiAdware
// @author noname120
// @namespace HandyUserscripts
// @icon https://i.imgur.com/tq7PJr0.png
// @description Remove forced download accelerators, managers, and adware on supported websites
// @description:fr Évitez les applications indésirables lors des téléchargements sur de nombreux sites avec AntiAdware !
// @description:de Mit AntiAdware vermeidest du auf zahlreichen Webseiten den versehentlichen Download von unerwünschten Programmen
// @description:zh-TW AntiAdware, 讓你避免在許多網站上意外下載到廣告軟體.
// @description:zh-CN AntiAdware, 让你避免在许多网站上意外下载到广告软体.
// @version 1.42.1
// @license Creative Commons BY-NC-SA

// jQuery dependency; an offline version of this is included in the script in case it goes down
// @require http://code.jquery.com/jquery-2.0.3.min.js

// @include http*://*180upload.com/*
// @include http*://*4upfiles.com/*
// @include http*://*get*.adobe.com/*flashplayer/*
// @include http*://*get*.adobe.com/*reader/*
// @include http*://*afterdawn.com/software/*
// @include http*://*akafile.com/akago.php
// @include http*://*chip.de/downloads/*
// @include http*://*clicknupload.com/*
// @include http*://*cloudyvideos.com/*
// @include http*://*coolrom.com/*/*
// @include http*://*clipconverter.cc/download/*
// @include http*://*dailyuploads.net/*
// @include http*://*datafilehost.com/d/*
// @include http*://*davvas.com/*
// @include http*://*d-h.st/*
// @include http*://*download.cnet.com/*
// @include http*://*telecharger.cnet.com/*
// @include http*://*descargar.cnet.com/*
// @include http*://*de.download.cnet.com/*
// @include http*://*filefactory.com/file/*
// @include http*://*filescdn.com/*
// @include http*://*filehippo.com/*download*
// @include http*://*freewarefiles.com/downloads_counter.php*
// @include http*://*google.*/earth/download/ge/agree.html
// @include http*://*hugefiles.net/*
// @include http*://*hulkload.com/*
// @include http*://*kingfiles.net/*
// @include http*://*letitbit.net/download/*
// @include http*://*loveroms.com/*
// @include http*://*up.media1fire.com/*
// @include http*://*mightyupload.com/*
// @include http*://*mp3fil.*/get/*
// @include http*://*mp3juices.to/*
// @include http*://*mp3olimp.net/*
// @include http*://*mp3olimpz.com/*
// @include http*://*opensubtitles.org/*/subtitles/*
// @include http*://*revclouds.com/*
// @include http*://*romhustler.net/download/*
// @include http*://*romhustler.net/rom/*
// @include http*://*secureupload.eu/*
// @include http*://*sendspace.com/file/*
// @include http*://*sharebeast.com/*
// @include http*://*shared.com/*
// @include http*://*softm8.com*
// @include http*://*.softonic.*
// @include http*://*sourceforge.net/*
// @include http*://*tusfiles.net/*
// @include http*://*unlimitzone.com/*
// @include http*://*uploading.com/*
// @include http*://*uploadocean.com/*
// @include http*://*uplod.ws/*
// @include http*://*uploads.to/*
// @include http*://*uptobox.com/*
// @include http*://*userscdn.com/*
// @include http*://*ziddu.com/downloadfile/*

// We don't use this method, however a side effect of it is that it restores the Greasemonkey sandbox, avoiding jQuery conflicts
// @grant GM_addStyle

// @grant unsafeWindow

// @homepageURL https://github.com/HandyUserscripts/AntiAdware#readme
// @supportURL https://github.com/HandyUserscripts/AntiAdware/issues


// @run-at document-start
// ==/UserScript==

void
function () {
    // If true, displays log in the console
    var o_debug = false

    // Rules informing what to do on each supported website
    var adwareRules = {
        a180upload: {
            host: ['180upload.com'],
            uncheck: ['#use_installer'],
            hide: ['#use_installer', 'label[for=use_installer]']
        },
        a4upfiles: {
            host: ['4upfiles.com'],
            uncheck: ['#use_downloader'],
            hide: ['label[for=use_downloader]']
        },
        Adobe: {
            host: ['get\\d?.adobe.com'],
            uncheck: ['#offerCheckbox','#offerCheckbox1','#offerCheckbox2','#offerCheckbox3','#offerCheckbox4'],
            hide: ['.ContentColumn.ContentColumn-2']
        },
        Afterdawn: {
            host: ['afterdawn.com'],
            exec: function() {
                // Download page directly accessed from another website
                if (document.location.href.contains('installer=1')) {
                    // Redirect to the page without the download manager
                    document.location.replace(document.location.href.replace('installer=1', 'installer=0'))
                }

                // Software page
                $('input[name=installer]').prop('value', '0')
                var downloadButton = $('#download-main-button')
                var adwareLink = downloadButton.prop('href')
                adwareLink = adwareLink.replace('installer=1', 'installer=0')
                downloadButton.prop('href', adwareLink)
            }
        },
        Akafile: {
            host: ['akafile.com'],
            // Find the real download link in the comments section and replace the fake one with this (if the fake is not a valid link)
            exec: function () {
                // If the link is already a valid one we don't replace it
                var testHost = new RegExp("aik.wolfup.net", 'i')
                if (testHost.test($("#download1").attr("href"))) return
                // Get comment section and enumerate each element having the right id, check if it's a proper download link
                var comments = $('#continue').comments().children('#download1').each(function () {
                    if (testHost.test($(this).attr("href"))) {
                        $("#download1").attr("href", $(this).attr("href"))
                        return
                    }
                });
            }
        },
        Chip: {
            host: ['chip.de'],
            hide: ['.download_button'],
            exec: function() {
                var dl = $('.ManualInstallLink').prop('href')
                var btn = $('.dl-btn-default .Download-Button')

                btn.prop('href', dl)
            }
        },
        Clicknupload: {
            host: ['clicknupload.com'],
            uncheck: ['#d_acc_checkbox'],
            hide: ['#w_download', '#d_acc']
        },
        ClipConverter: {
        	host: ['clipconverter.cc'],
        	uncheck: ['#dlcp'],
        	hide: ['div[style="width: 340px;margin-left: 25px;margin-top: 7px;"]']
        },
        CloudyVideos: {
            host: ['cloudyvideos.com'],
            uncheck: ['#use-manager'],
            hide: ['#download-box > label']
        },
        Coolrom: {
            host: ['coolrom.com'],
            hide: ['table[align="center"][width="300"]'],
            exec: function() {
                window.addEventListener("load", function () {
                  var downloadButton = $('img[src*="download_large.png"]').parent('a')
                  var downloadId = document.location.pathname.split('/')[3]

                  if (typeof downloadButton != 'undefined' && downloadId.match(/^\d+$/)) {
                      // Get rid of all events on the button
                      var newButton = downloadButton.clone()
                      newButton.prop('href', '/dlpop.php?id=' + downloadId)
                      downloadButton.replaceWith(newButton)
                  }
                });
            }
        },
        DailyUploads: {
            host: ['dailyuploads.net'],
            hide: ['label[style="font-size:x-small"]'],
            uncheck: ['#chkIsAdd']
        },
        Datafilehost: {
            host: ['datafilehost.com'],
            hide: ['form[name=cbf]'],
            exec: function() {
                var id = document.location.pathname.match(/^\/d\/(\w+)$/)[1]
                // DataFileHost doesn't allow to download using HTTPS
                var adwarelessLink = 'http:' + '//' + document.location.hostname + '/get.php?file=' + id

                var n = $('#dl > a').clone()

                // Replace the adware link
                n.prop('href', adwarelessLink)

                // Avoid redirection to adware
                $('#dl').replaceWith(n);
            }
        },
        Davvas: {
            host: ['davvas.com'],
            uncheck: ['#chlink'],
            hide: ['label[for=chlink]', '#chlink'],
            exec: function() {
                var btn = $('#btn_download')
                if (!exists(btn)) {
                    return
                }
                btn.removeAttr('onclick')
            }
        },
        DevHost: {
            host: ['d-h.st'],
            uncheck: ['#dm-check'],
            hide: ['#downloadmanager','a:has(>img[src*="/assets/img/download1.png"])', '#downloadfile2'],
        },
        Download: {
            host: ['download.cnet.com','telecharger.cnet.com','descargar.cnet.com'],
            hide: ['.dln-sub-message','#title-detail-download-now-button-dlm-notice-icon','.download-now.direct-download-button-dln'],
            exec: function() {
                // --> This is for program pages
                // Find the real download link
                var adwarelessLink = $('.download-now').attr('data-nodlm-url')
                // If we successfully found it
                if (typeof adwarelessLink != 'undefined') {
                    // We replace the adware-enabled link with the adwareless link
                    var btn = $("a.dln-a:has('.dln-cta')")
                    btn.prop('href', adwarelessLink)
                    btn.attr('data-href', adwarelessLink)
                }

                // --> This is for search lists
                // Check each download button from the list
                $('.download-now.listing-button-dln').each(
                    function(currIndex, currDOMElement) {
                        var currElement = $(currDOMElement)

                        // Get the direct download link
                        var currDirectDlLink = currElement.attr('data-nodlm-url')

                        // If we couldn't find the direct download link, we abandon
                        if (typeof currDirectDlLink == 'undefined') {return}

                        // Replace the download link with the direct, download manager-less link
                        currElement.children('.dln-a').prop('href', currDirectDlLink)

                        // Somehow this class prevents the download from launching properly (at least on Firefox)
                        currElement.removeClass('download-now')
                    })
            }
        },
        Filefactory: {
            host: ['filefactory.com'],
            uncheck: ['#download_manager > input:checkbox'],
            hide: ['#download_manager']
        },
        FilesCDN: {
            host: ['filescdn.com'],
            exec: function() {
                $('#btn_download').prop('onclick', null)
            }
        },
        Freewarefiles: {
            host: ['freewarefiles.com'],
            hide: ['span.smalllinks:contains("download manager")'],
            exec: function() {
                var directLink = $('a.dwnlocations').prop('href')
                if (typeof directLink == 'undefined') {return}

                $('td[width=330][align=left] > a').prop('href', directLink)
            }
        },
        GoogleEarth: {
        	host: ['google.'],
        	uncheck: ['#dl-agree-chrome','#dl-agree-chrome-default'],
        	hide: ['#dl-chrome-promo']
        },
        Hugefiles: {
            host: ['hugefiles.net'],
            uncheck: ['#dap','#use_downloader'],
            hide: ["span:contains('using download accelerator')", '#dap', '#use_downloader', 'img[src="http://hugefiles.net/button.png"]']
        },
        Hulkload: {
            host: ['hulkload.com'],
            uncheck: ['#spnsrdld', '#use-manager'],
            hide: [
            	"form:contains('download The FREE download accelerator')",'#spnsrdld','#download-tick',
            	'img[src^="http://hulkload.com/images/dld"]', // Fake download button
            	'div.alert[onclick="goto()"]', // Fake sponsored links
            	'div[style*="height: 90px; border: 3px solid rgb(205, 240, 246)"]' // Fake download banner (liversely)
            ]
        },
        Kingfiles: {
            host: ['kingfiles.net'],
            uncheck: ['#cmli_downloader'],
            hide: ['#test1'],
            // Avoids a popup when unchecking the checkbox
            exec: function() {
                $('#cmli_downloader').prop('onclick', null)
            }
        },
        Letitbit: {
            host: ['letitbit.net'],
            uncheck: ['#skymonk_checkbox'],
            hide: ['#skymonk_checkbox', 'label[for=skymonk_checkbox]']
        },
        LoveRoms: {
            host: ['loveroms.com'],
            uncheck: ['#downloadWithManager'],
            hide: ['.download-label']
        },
        UpMedia1fire: {
            host: ['up.media1fire.com'],
            uncheck: ['#use-manager'],
            hide: ['#download-box', '#sponsor2', 'div.contentor > center', '.alert2', 'img[src^="http://up.media1fire.com/nb/Rec_b"]']
        },
        Mightyupload: {
            host: ['mightyupload.com'],
            uncheck: ['#use_installer'],
            hide: ['#use_installer', 'label[for=use_installer]','#lnk_download ~ br']
        },
        Mp3fil: {
            host: ['mp3fil\.'],
            uncheck: ['#check > input:checkbox[name=check]'],
            hide: ['#check']
        },
        Mp3juices: {
            host: ['mp3juices.to'],
            uncheck: ['input:checkbox[name=dl_manager]'],
            hide: ['.dl_manager,.c[style="height:80px"]']
        },
        Mp3olimp: {
        	host: ['mp3olimp.net|mp3olimpz.com'],
        	uncheck: ['#download-manager-checkbox'],
        	hide: ['#download-manager']
        },
        Opensubtitles: {
            host: ['opensubtitles.org'],
            uncheck: ['#cbDownloader'],
            optuncheck: {
                // Never stop to try unchecking the checkbox
                constantcheck: true
            },
            hide: ['#cbDownloader','#lb-dwl'],
            opthide: {
                // Never stop to try hiding the object
                constantcheck: true
            }
        },
        Filehippo: {
            host: ['filehippo.com'],
            // Will do nothing on pages without a download manager
            hide: ['#program-header-download-link-dm-text', '#direct-download-link-container'],
            exec: function() {
                var adwObj = $('.program-header-download-link.download-manager-enabled')
                // Append ?direct at the end of the URL so that it doesn't provide the download manager
                var directUrl = adwObj.attr('href') + '?direct'

                adwObj.attr('href', directUrl)
            }
        },
        RevClouds: {
            host: ['revclouds.com'],
            uncheck: ['#tick-dwn'],
            hide: ['.tick-box']
        },
        Romhustler: {
            host: ['romhustler.net'],
            uncheck: ['#use_accelerator'],
            hide: ['.accelerator']
        },
        Secureupload: {
        	host: ['secureupload.eu'],
        	uncheck: ['form[name=dlmanager] > input:checkbox'],
        	optuncheck: {
                // Never stop to try unchecking the checkbox
                constantcheck: true
            },
        	hide: ['form[name=dlmanager]', 'img[src="https://www.secureupload.eu/gfx/dlbtn.png"]', 'img[src="https://www.secureupload.eu/gfx/freedl.png"]'],
        	opthide: {
                // Never stop to try hiding the object
                constantcheck: true
            }
        },
        Sendspace: {
            host: ['sendspace.com'],
            uncheck: ['#quickchk'],
            hide: ["form > div:contains('with sendspace accelerator')",'#quickchk']
        },
        Sharebeast: {
            host: ['sharebeast.com'],
            uncheck: ['#sharebeast_downloader'],
            hide: ['#sharebeast_downloader_container']
        },
        Shared: {
            host: ['shared.com'],
            uncheck: ['#use-manager'],
            hide: ['#webpick-option']
        },
        SoftM8: {
            host: ['.softm8.com'],
            hide: ['#dinfo2[style="clear:both;"]'], // Blah blah about Adware
            exec: function() {
                var butMatch = '.buttonDownload.dbtndl'
                var dlBut = $(butMatch)

                // Take the last part of the path of the URL
                var exeName = dlBut.prop('href').split('/').pop()

                // Found in the adware installation executable
                var noAdLnk = 'http://h.softm8.com/' + exeName

                // Can be multiple buttons
                dlBut.prop('href', noAdLnk)
                unsafeWindow.$(butMatch).off('click') // Prevents the download from launching properly
            }
        },
        Softonic: {
            host: ['.softonic.'],
            hide: ['h2:contains("Softonic Downloader") ~ ul','h2:contains("Softonic Downloader"), .box-download-footer'],
            exec: function() {
                var linkFollow = $('#download_alternative > p > a[rel=nofollow]')
                if (exists(linkFollow)) {
                    document.location.replace(linkFollow.prop('href'))
                    return
                }

                var managerButton = $('#download-button-sd, #download-button')
                var directButton = $('#download-button-alternative')
                if (!exists(managerButton) || !exists(directButton)) {return}

                var directLink = directButton.prop('href')

                // Avoid jQuery click redirection set on the download button
                setInterval(function() {unsafeWindow.$('#download-button-sd, #download-button').off('click')}, 100)

                managerButton.prop('href', directLink)
            }
        },
        Sourceforge: {
            host: ['sourceforge.net'],
            hide: ['.direct-dl', '.info-circle', '.btn-ddl-toggle'],
            exec: function() {
            	// Hotfix: if the user is on an adware-bundled download page
            	if (document.location.pathname.contains('/download') && !document.location.search.contains('nowrap')) {
            		// Add the argument as first argument (?) or secondary argument (&)
            		var prefix = document.location.search.contains('?')? '&' : '?';
            		document.location.search = document.location.search + prefix + 'nowrap';
            	}

            	try {
	            	// Seen in browsing files pages
	            	var toggleBtn = $('a.btn-ddl-toggle');
	            	// In case the text contains the pattern telling to the user that adware is enabled
	            	if (exists(toggleBtn) && toggleBtn.html().contains(toggleBtn.attr('data-content-nowrap'))) {
	            		// We disable it
	            		unsafeWindow.$('a.btn-ddl-toggle').click();
	            	}
	            } catch (e) {}

            	// --> This is for program pages
            	// Try to get the real link
            	var realLink = $('.direct-dl').prop('href')

            	// If we found the direct download link, then it means this download is bundled with a piece of adware
            	if (typeof realLink != 'undefined') {
	            	// Replace the download link with the real one
	            	$('#download_button > .sfdl').prop('href', realLink)

	            	// Now we're trying to change the "Installer Enabled" text with the name of the file
	            	var containsFileName = $('.sfdl').attr('oldtitle')
	            	var extractFileName = /\/(?!.*\/)([^ ]+)/

	            	var fileName = extractFileName.exec(containsFileName)

	            	$("small:contains('Installer Enabled')").html(fileName[1])
	            }

                // --> This is for the main page and searches
                // TODO: use a mutation observer for search pages (not needed for main page)
                setInterval(function() {
                    $(".sfdl.sfdl-lite").each(function() {
                        // Force downloading the adware-free program
                        var oldHref = $(this).prop('href')

                        // If we already appended our no-adware argument, leave
                        if (oldHref.substring(oldHref.length-7) == '&nowrap') {return}

                        // Otherwise append it
                        $(this).prop('href', $(this).prop('href') + '&nowrap')
                    })
                }, 50)
            }
        },
        Tusfiles: {
            host: ['tusfiles.net'],
            uncheck: ['input:checkbox[name=quick]'],
            hide: ['input:checkbox[name=quick] ~ label', 'input:checkbox[name=quick]','a[target=_blank][href*="http://sharesuper.info/"],img[src="https://z.tusfiles.net/i/dll.png"]']
        },
        Uploading: {
            host: ['uploading.com'],
            uncheck: ['#force_exe'],
            hide: ['.use_download_manager']
        },
        UploadOcean: {
            host: ['uploadocean.com'],
            uncheck: ['#tick-dwn'],
            hide: ['.tick-box']
        },
        Uplodws:{
            host: ['uplod.ws'],
            uncheck: ['#chkIsAdd'],
            hide: ['label:contains("offer")','img[src="http://goo.gl/CGHVVo"]']
        },
        Uploads: {
            host: ['uploads.to'],
            uncheck: ['#chkIsAdd'],
            hide: ['a:contains("MANAGER")','center:contains("Offer")'],
        },
        Uptobox: {
            host: ['uptobox.com'],
            hide: ['div.reseller > table[align=center]'],
            exec: function() {
                var button = $('div.reseller > table[align=center] div[align=center] > a')
                var adware = button.prop('href')

                // Retrieve the real download link and change the button with this link
                var download = adware.match(/&product_download_url=([^$&]+)$/)[1]
                button.prop('href', download)

                // Put the button in a visible location
                $('div.reseller > table[align=center]').before(button)
            }
        },
        Unlimitzone: {
            host: ['unlimitzone.com'],
            uncheck: ['#dlm'],
            hide: ['#dlm ~ b','#dlm']
        },
        UsersCDN: {
            host: ['userscdn.com'],
            uncheck: ['#chkIsAdd'],
            hide: ['label:contains("Download manager")']
        },
        Ziddu: {
            host: ['downloads.ziddu.com'],
            uncheck: ['#accelerator'],
            hide: ['td.text12:contains("ziddu accelerator")']
        }
    }

    // Generic functions

    // Avoids conflicts when the main page is also using jQuery or another library using '$'
    // this.$ = this.jQuery = jQuery.noConflict(true);
    // --> Instead I use @grant GM_addStyle which restores the sandbox and thus avoid us this trick

    // This jQuery plugin will gather the comments within
    // the current jQuery collection, returning all the
    // comments in a new jQuery collection.
    //
    // NOTE: Comments are wrapped in DIV tags.

    jQuery.fn.comments = function (blnDeep) {
        var blnDeep = (blnDeep || false);
        var jComments = $([]);

        // Loop over each node to search its children for
        // comment nodes and element nodes (if deep search).
        this.each(
            function (intI, objNode) {
                var objChildNode = objNode.firstChild;
                var strParentID = $(this).attr("id");

                // Keep looping over the top-level children
                // while we have a node to examine.
                while (objChildNode) {

                    // Check to see if this node is a comment.
                    if (objChildNode.nodeType === 8) {

                        // We found a comment node. Add it to
                        // the nodes collection wrapped in a
                        // DIV (as we may have HTML).
                        jComments = jComments.add(
                            "<div rel='" + strParentID + "'>" +
                            objChildNode.nodeValue +
                            "</div>"
                        );

                    } else if (
                        blnDeep &&
                        (objChildNode.nodeType === 1)
                    ) {

                        // Traverse this node deeply.
                        jComments = jComments.add(
                            $(objChildNode).comments(true)
                        );

                    }

                    // Move to the next sibling.
                    objChildNode = objChildNode.nextSibling;

                }

            }
        );

        // Return the jQuery comments collection.
        return (jComments);
    }

    // Tests if a string is part of another one.
    String.prototype.contains = function (testString) {
        return this.indexOf(testString) != -1
    }

    // Allows to remove a substring from a string even when present multiple times
    String.prototype.removeAll = function (testString) {
        var retString = this;
        while ((currIndex = retString.indexOf(testString)) != -1) {
            retString = retString.removeOnce(testString);
        }
        return retString
    }

    // Allows to remove a substring from a string one time.
    String.prototype.removeOnce = function (testString) {
        var currIndex = this.indexOf(testString)
        if (currIndex != -1) return this.substring(0, currIndex) + this.substring(currIndex + testString.length)
        return this
    }

    // Generic log function
    function log(string) {
        if (o_debug) console.log(string)
    }

    // Check if a JQobject is valid
    function exists(JQobject) {
        return (JQobject.length != 0)
    }

    // Check if an input checkbox is checked
    function isChecked(JQobject) {
        return JQobject.prop("checked")
    }

    // Uncheck an input checkbox
    function uncheck(JQobject) {
        if (!exists(JQobject)) return false
        if (isChecked(JQobject)) JQobject.click()
        // The object exists, we have unchecked it if it was checked
        return true
    }

    // Hide an element (doesn't delete it)
    function hide(JQobject) {
        if (!exists(JQobject)) return false
        JQobject.attr("style", "display : none !important")
        return true
    }

    // Force an element to show
    function show(JQobject) {
        if (!exists(JQobject)) return false

        // FIXME: avoid to blindly set the display to block (can be inline too)
        JQobject.attr("style", "display : block !important")
        return true
    }

    for (var i in adwareRules) {
        // Create a RegExp to test if we are on this domain
        var testHosts = new RegExp(adwareRules[i].host.join('|'), 'i')
        // If we are on one of the domains
        if (testHosts.test(document.domain)) {
            var currRule = adwareRules[i]
            break
        }
    }

    if (typeof currRule == "undefined") return

    var applyRules = function () {
        log('Trying to execute custom function: ' + currRule.exec)
        if (currRule.exec != undefined) currRule.exec();
        log("Iterating through unchecks")

        // If there is something to uncheck
        if (currRule.uncheck != undefined) {
            // Iterate each checkbox to uncheck it
            $.each(currRule.uncheck, function (key, currUncheck) {
                log("Trying to uncheck [" + key + ']' + currUncheck)
                // Constantly trying to uncheck the checkbox
                if (currRule.optuncheck != undefined && currRule.optuncheck.constantcheck == true) {
                    uncheck($(currUncheck))
                    var periodicHide = setInterval(function () {
                        // Uncheck it
                        uncheck($(currUncheck))
                    }, 100)
                    // Only unchecking it once
                } else {
                    // If the checkbox was successfully unchecked
                    if (uncheck($(currUncheck))) return
                    log("Couldn't uncheck the checkbox")
                    // Try to uncheck it later
                    var periodicUncheck = setInterval(function () {
                        // If the uncheck succeeded this time, we stop the unchecking
                        if (uncheck($(currUncheck))) clearInterval(periodicUncheck)
                        // Otherwise, we continue to check
                    }, 100)
                }
            })
        }

        // If there is something to hide
        if (currRule.hide != undefined) {
            // Iterate each hide to hide it
            $.each(currRule.hide, function (key, currHide) {
                log("Trying to hide " + currHide)
                // If we try to continue hiding it even if the hiding was already successful
                if (currRule.opthide != undefined && currRule.opthide.constantcheck == true) {
                    hide($(currHide))
                    var periodicHide = setInterval(function () {
                        // Hide it
                        hide($(currHide))
                    }, 100)
                    // Hide it once, then stop trying to hide it (usual case, it stays hidden)
                } else {
                    // If the object to hide was hidden
                    if (hide($(currHide))) return
                    // Try to hide it later
                    var periodicHide = setInterval(function () {
                        // If the hide succeeded this time, we stop to try hiding it
                        if (hide($(currHide))) clearInterval(periodicHide)
                        // Otherwise, we continue to try hiding it
                    }, 100)
                }
            })
        }

        // If there is something to show
        if (currRule.show != undefined) {
            // Iterate each show to show it
            $.each(currRule.show, function (key, currShow) {
                log("Trying to show " + currShow)

                // If the object to show was successfully shown
                if (show($(currShow))) return

                // Try to show it later
                var periodicShow = setInterval(function () {
                    show($(currShow))
                    // If the show succeeded this time, we stop to try showing it
                    if (show($(currShow))) clearInterval(periodicShow)
                    // Otherwise, we continue to try showing it
                }, 100)
            })
        }
    }

    // Google Chrome trick: sometimes the script is executed after that DOMContentLoaded was triggered, in this case we directly run our code
    if (document.readyState == "complete") {
        applyRules()
        log("Directly applying rules")
    } else {
        window.addEventListener('DOMContentLoaded', applyRules)
        log("Waiting for DOMContentLoaded to apply rules")
    }
}()