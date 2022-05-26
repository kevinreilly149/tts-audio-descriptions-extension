window.onload = function addADSupport() {

	//grab all of the videos on the page
	let videos = document.getElementsByTagName('video');

	for (let videoIndex = 0; videoIndex < videos.length; videoIndex++) {
		let video = videos[videoIndex];

		//get the text tracks
		let tracks = video.textTracks;

		//initialize an empty array for the description tracks
		let descriptionTracks = [];

		//add only the description tracks to the description tracks array
		for (let i = 0; i < tracks.length; i++) {
			if (tracks[i].kind === 'descriptions') {
				descriptionTracks.push(tracks[i]);
			}
		}

		//check if there are any description tracks
		if (descriptionTracks.length > 0) {

			//initialize web speech
			const synth = window.speechSynthesis;

			//get and update the speech rate
			let speechRate = 1;
			chrome.storage.sync.get(['ad_rate'], function(result) {
				speechRate = result.ad_rate;
			});
			chrome.storage.onChanged.addListener((changes, namespace) => {
				if (changes.ad_rate) {
					speechRate = changes.ad_rate.newValue;
				}
				
			})

			//get and update the speech pitch
			let speechPitch = 1;
			chrome.storage.sync.get(['ad_pitch'], function(result) {
				speechPitch = result.ad_pitch;
			});
			chrome.storage.onChanged.addListener((changes, namespace) => {
				if (changes.ad_pitch) {
					speechPitch = changes.ad_pitch.newValue;
				}
			})

			//create the descriptions toolbar
			let descriptionsToolbar = document.createElement('div');

			//create the Audio Descriptions selector
			//create the Audio Descriptions selector label
			let descriptionsSelectorWrapper = document.createElement('label');
			let descriptionsSelector = document.createElement('select');

			//create Audio Descriptions Off option
			let descriptionsOffOption = document.createElement('option');
			descriptionsOffOption.value = 'off';
			descriptionsOffOption.append('Off');

			//add the off option to the select
			descriptionsSelector.append(descriptionsOffOption);

			//create the Audio Description lanuage options
			for (let i = 0; i < descriptionTracks.length; i++) {
				let descriptionOption = document.createElement('option');
				descriptionOption.value = descriptionTracks[i].language;
				descriptionOption.append(descriptionTracks[i].label);

				//add the lanuage option to the select
				descriptionsSelector.append(descriptionOption);
			}
			descriptionsSelectorWrapper.append('Audio Descriptions: ', descriptionsSelector);

			descriptionsSelector.addEventListener('change', (e) => {

				//check if Descriptions are turned on
				if (e.target.value === 'off') {	

					//stop all speech
					synth.cancel();

					//turn off description tracks
					descriptionTracks.map((track) => {
						track.mode = 'disabled';
					});
				} else {
					const voices = synth.getVoices();

					//set voice as first option
					let defaultVoice = voices[0];

					for (let i = 0; i < voices.length; i++) {
						if (voices[i].default) {
							//set voice as default option
							defaultVoice = voices[i];
						}
					}

					//find the selected track
					let descriptionTrack;

					descriptionTracks.map((track) => {

						//check for the selected track
						if (e.target.value === track.language) {
							descriptionTrack = track;
							
							//turn on the description track
							descriptionTrack.mode = 'showing';
						} else {
							//turn off the other tracks
							track.mode = 'disabled';
						}
					});

					//listen for cue changes
					descriptionTrack.oncuechange = () => {

						//check for an active cue
						if (descriptionTrack.activeCues.length > 0) {

							//make the cue text an utterance
							let utterThis = new SpeechSynthesisUtterance(descriptionTrack.activeCues[0].text);

							utterThis.voice = defaultVoice;
							utterThis.rate = speechRate;
							utterThis.pitch = speechPitch;

							//pause the video
							video.pause();

							//speak the cue text
							synth.speak(utterThis);

							//when done speaking, play the video
							utterThis.onend = () => video.play();
						}
					}
				}
			});

			//add the selector to the toolbar
			descriptionsToolbar.append(descriptionsSelectorWrapper);

			//add the toolbar below the video
			video.after(descriptionsToolbar);
		}
	}
}