// ==UserScript==
// @name         SiteScrubber - userupload.net
// @namespace    SiteScrubber
// @version      1.0-20210506
// @description  Scrub site of ugliness and ease the process of downloading from multiple sites!
// @author       PrimePlaya24
// @match        https://userupload.net/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

const o_debug = false;

/**
 * log info to console
 * @param {string} str
 */
const log = (str) => {
  console.log(`[LOG] AIO-script: ${str}`);
};

/**
 * log info to console if in DEBUG mode (o_debug == true)
 * @param {string} str
 */
const log_debug = (str) => {
  if (o_debug) console.log(`[DEBUG] AIO-script: ${str}`);
};

// helper functions
const el = (query, context = document) => context.querySelector(query),
  elementExists = (query) => Boolean(el(query)),
  ifElementExists = (query, fn = () => undefined) =>
    elementExists(query) && fn(),
  elStyle = (query) => (prop, value) => (el(query).style[prop] = value),
  changeStyle = (query) => (prop, value) => () => elStyle(query)(prop, value);

/**
 * Add custom CSS to page by appending a new <style> tag
 * to the head of the document
 * @param {string} cssStr valid css string
 */
const GM_addStyle = (cssStr) => {
  // make new <style> element
  let newNode = document.createElement("style");
  // set the inner text to the user input
  newNode.textContent = cssStr;
  // select where to place our <style> element
  let targ =
    document.querySelector("head") || document.body || document.documentElement;
  // append our <style> element to the page
  targ.appendChild(newNode);
};

/**
 * async wait until element is found given a string selector
 * @param {string} elementSelector
 * @returns Promise{HTMLElement}
 */
const waitUntilElementSelector_async = async (elementSelector) => {
  log(`Waiting for selector: ${elementSelector}`);
  while (!document.querySelector(elementSelector)) {
    // if not found, wait and check again in 500 milliseconds
    await new Promise((r) => setTimeout(r, 500));
  }
  log(`Found Element by Selector: ${elementSelector}`);
  return new Promise((resolve) => {
    // resolve/return the found element
    resolve(document.querySelector(elementSelector));
  });
};

/**
 * wait until element is found given a string selector
 * @param {string} elementSelector
 * @returns Promise{HTMLElement}
 */
const waitUntilElementSelector = async (elementSelector) => {
  log(`Waiting for selector: ${elementSelector}`);
  while (!document.querySelector(elementSelector)) {
    // if not found, wait and check again in 500 milliseconds
    await new Promise((r) => setTimeout(r, 500));
  }
  log(`Found Element by Selector: ${elementSelector}`);
};

/**
 * Restore console to page to allow for logging
 * used when a page removes console for some reason
 */
const restoreConsole = () => {
  log("Restoring window.console");
  // create new iframe element
  const i = document.createElement("iframe");
  // hide it from sight
  i.style.display = "none";
  // add to the document
  document.body.appendChild(i);
  // replace the window.console with the newly made console object
  window.console = i.contentWindow.console;
};

/**
 * Removes all elements found by given selectors within array
 * @param {Array} elements array of element selector strings
 */
const removeElements = (elements) => {
  log_debug("Running removeElements");
  if (typeof elements == "string" || elements instanceof String) {
    // add it to an array so we can use Array functions
    elements = [elements];
  }
  [...elements].forEach((e) => {
    if (typeof e == "string" || e instanceof String) {
      // remove found elements
      document.querySelectorAll(e).forEach((ele) => ele.remove());
    } else if (e instanceof HTMLElement) {
      // remove HTMLElement
      e.remove();
    }
  });
};

/**
 * Removes all elements found by given selectors within array
 * if the regex matches within the elements text body
 * @param {Array} elements
 * @param {RegExp} regex
 */
const removeElementsByRegex = (elements, regex) => {
  log_debug("Running removeElementsByRegex");
  if (typeof elements == "string" || elements instanceof String) {
    // add it to an array so we can use Array functions
    elements = [elements];
  }
  [...elements].forEach((e) => {
    if (typeof e == "string" || e instanceof String) {
      if (regex instanceof RegExp) {
        document.querySelectorAll(e).forEach((ele) => {
          if (regex.test(ele.innerText)) {
            // remove found elements if RegEx matches
            ele.remove();
          }
        });
      }
    } else if (e instanceof HTMLElement) {
      if (regex.test(e.innerText)) {
        // remove HTMLElement if RegEx matches
        e.remove();
      }
    }
  });
};

/**
 * Used to monitor Google reCAPTCHA and if the user completes
 * the tasks, then we submit the form automatically, if the wait
 * time has been exceeded as well
 * @param {HTMLElement} form <form> html tag
 * @param {int} timer seconds to wait before submitting
 * @returns undefined
 */
const googleRecaptchaListener = (form, timer = 0) => {
  if (form instanceof HTMLElement) {
    log("Form selected!");
  } else if (typeof form == "string" || form instanceof String) {
    // try to find form based on selector
    form = document.querySelector(form) || null;
  }
  if (!form || !window.grecaptcha) {
    log("No Google Captcha found...");
    return;
  }
  // save current date
  const then = new Date();
  // interval to check every 500 milliseconds if ReCAPTCHA
  // has been completed, then the form gets submitted
  const checker = setInterval(() => {
    if (
      window.grecaptcha.getResponse() &&
      Math.floor((new Date() - then) / 1000) > timer
    ) {
      // stop interval from continuing
      clearInterval(checker);
      form.submit();
    }
  }, 500);
};

/**
 * Removes all scripts that do not contain Google
 * related links
 */
const removeScripts = () => {
  log("Removing unwanted scripts from page");
  let i = 0;
  document.querySelectorAll("script").forEach((tag) => {
    if (!/google|gstatic/gi.test(tag.src)) {
      tag.remove();
      i++;
    }
  });
  log(`Removed ${i} scripts`);
};

/**
 * Removes all iFrames that do not contain Google
 * related urls
 */
const removeiFrames = () => {
  log("Removing unwanted scripts from page");
  let i = 0;
  document.querySelectorAll("iframe").forEach((tag) => {
    if (!/google/gi.test(tag.src)) {
      tag.remove();
    }
  });
  log(`Removed ${i} iFrames`);
};

/**
 * Removes all "disabled" attributes from every element
 * on the page
 */
const removeDisabledAttr = () => {
  log("Enabling all buttons");
  document.querySelectorAll("*").forEach((e) => {
    e.removeAttribute("disabled");
  });
};

/**
 * Iterate through element selector strings in array and hide each
 * element based on the given displayFlag method given
 * @param {Array} elements   array of element selector strings to search
 * @param {int} displayFlag  0 - display: none, 1 - visibility: hidden
 */
const hideElements = (elements, displayFlag = 0) => {
  // 0 - displayFlag --- display: none
  // 1 - displayFlag --- visibility: hidden
  log_debug("Running hideElements");
  if (typeof elements == "string" || elements instanceof String) {
    elements = [elements];
  }
  [...elements].forEach((e) => {
    if (typeof e == "string" || e instanceof String) {
      if (displayFlag) {
        // 1 - displayFlag --- visibility: hidden
        document
          .querySelectorAll(e)
          .forEach((ele) => (ele.style.visibility = "hidden"));
      } else {
        // 0 - displayFlag --- display: none
        document
          .querySelectorAll(e)
          .forEach((ele) => (ele.style.display = "none"));
      }
    } else if (e instanceof HTMLElement) {
      if (displayFlag) {
        // 1 - displayFlag --- visibility: hidden
        e.style.visibility = "hidden";
      } else {
        // 0 - displayFlag --- display: none
        e.style.display = "none";
      }
    }
  });
};

/**
 * async Sleep function to pause operations
 * @param {int} ms # of milliseconds to sleep for
 * @returns Promise{resolved}
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Function to check page and see if current page is
 * part of the download sequence
 * @param {Array} arrayOfSelectors
 * @param {Array} arrayOfRegexTests
 * @returns Boolean
 */
const checkIfDownloadPage = (arrayOfSelectors = [], arrayOfRegexTests = []) => {
  if (
    arrayOfSelectors.some((selector) =>
      Boolean(document.querySelector(selector))
    ) ||
    arrayOfRegexTests.some((regex) => regex.test(document.body.innerText))
  ) {
    log("Assuming this is a download page!");
    return true;
  }
  log("Skipping this page. Not a downloading page.");
  return false;
};

/**
 * Add ability to "click" buttons by hovering over them
 * for 2 seconds to prevent and bypass ads/popups
 * @param {Array} elements
 * @param {Boolean} requireGoogleReCAPTCHA Require CAPTCHA to click
 */
const addHoverAbility = (elements, requireGoogleReCAPTCHA = false) => {
  function addEvent(element) {
    if (requireGoogleReCAPTCHA) {
      element.addEventListener(
        "mouseenter",
        () => {
          element.dataset.timeout = setTimeout(function () {
            if (window.grecaptcha.getResponse()) element.click();
          }, 2000);
        },
        false
      );
    } else {
      element.addEventListener(
        "mouseenter",
        () => {
          element.dataset.timeout = setTimeout(function () {
            element.click();
          }, 2000);
        },
        false
      );
    }
    log_debug("Added 'mouseenter' event to ", element);
    element.addEventListener(
      "mouseleave",
      () => {
        clearTimeout(element.dataset.timeout);
      },
      false
    );
    log_debug("Added 'mouseleave' event to ", element);
  }
  if (typeof elements == "string" || elements instanceof String) {
    elements = [elements];
  }
  [...elements].forEach((e) => {
    if (typeof e == "string" || e instanceof String) {
      document.querySelectorAll(e).forEach((ele) => addEvent(ele));
    } else if (e instanceof HTMLElement) {
      addEvent(ele);
    }
  });
};

const addInfoBanner = (elementToAddTo) => {
  if (elementToAddTo instanceof HTMLElement) {
    // Already an HTMLElement
  } else if (
    typeof elementToAddTo == "string" ||
    elementToAddTo instanceof String
  ) {
    elementToAddTo = document.querySelector(elementToAddTo) || null;
  }
  if (!elementToAddTo) {
    return false;
  }

  newNode = `<div class="ss-alert ss-alert-warning ss-mt-5 ss-text-center">TO PREVENT MALICIOUS REDIRECT, <b>HOVER</b> OVER THE BUTTON FOR 2 SECONDS TO SUBMIT CLEANLY</div>`;
  elementToAddTo.insertAdjacentHTML("beforeend", newNode);

  GM_addStyle(`.ss-alert-warning {color: #8a6d3b;background-color: #fcf8e3;border-color: #faebcc;}
  .ss-alert {padding: 15px;margin-bottom: 20px;border: 1px solid transparent;border-radius: 4px;}
  .ss-col-md-12 {width:100%}
  .ss-mt-5 {margin-top:5em;}
  .ss-text-center {text-align: center;}`);
};

const clean_site = () => {
    log("STARTING CLEANER!");
    if (
      !checkIfDownloadPage(
        ["button#downloadbtn"],
        [/Create Download Link/gi, /available for your IP next 24 hours/gi]
      )
    ) {
      return;
    }

    // removeScripts();
    removeiFrames();
    removeDisabledAttr();

    // styling
    GM_addStyle(`
    html {background: #121212 !important}
    body {background: #121212 !important;color: #dfdfdf !important}
    .subpage-content, .card, .label-group, .icon {background: #121212 !important}
    `);

    // add listener
    googleRecaptchaListener(document.F1);

    // Remove crap
    removeElements([
      "#st_gdpr_iframe",
      "nav",
      "footer",
      ".aboutFile",
      ".adsbygoogle",
      "form div.report",
    ]);

    addHoverAbility("button#downloadbtn", true);
    addHoverAbility("form a.btn.btn-primary.btn-block", false);

    ifElementExists("form[name='F1']", () => {
      addInfoBanner(document.querySelector("form[name='F1']")?.parentElement);
    });

    waitUntilElementSelector_async("form a.btn.btn-primary.btn-block").then(
      (res) => {
        log("DDL Link was found on this page.");
        // Open DDL for download
        window.open(res?.href, "_self");
        log("Opening DDL link for file.");
        // res.click();
      }
    );
  };

if (document.readyState === "complete" || document.readyState === "interactive") {
    clean_site();
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      clean_site();
    });
  }