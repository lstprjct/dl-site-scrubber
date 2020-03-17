// Remove all scripts that are not from google
var y = $("script");
for (var s = 0; s < y.length; s++) {
	if (!y[s].src.includes("google")) {
		y[s].remove();
	}
}