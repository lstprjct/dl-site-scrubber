// Removes all iFrames that are not used by Google
var t = $("iframe");
for (var k = 0; k < t.length; k++) {
	if (!t[k].src.includes("google")) {
		t[k].remove();
	}
}