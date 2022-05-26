chrome.storage.sync.get(['ad_rate'], function(result) {
	document.getElementById('ad_rate').value = result.ad_rate;
});

document.getElementById('ad_rate').addEventListener('change', (e) => {
	chrome.storage.sync.set({ad_rate: e.target.value}, () => {
		console.log('ad_rate set to: '+ e.target.value);
	});
});

chrome.storage.sync.get(['ad_pitch'], function(result) {
	document.getElementById('ad_pitch').value = result.ad_pitch;
});

document.getElementById('ad_pitch').addEventListener('change', (e) => {
	chrome.storage.sync.set({ad_pitch: e.target.value}, () => {
		console.log('ad_pitch set to: '+ e.target.value);
	});
});