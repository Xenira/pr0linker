import { SETTINGS_EVENT_NAME, COMMENTS_EVENT_NAME } from './util/events';

export class Renderer {
	public static init(): void {
		window.addEventListener(SETTINGS_EVENT_NAME, () => {
			console.log('Settings rendered');
		});

		window.addEventListener(COMMENTS_EVENT_NAME, () => {
			console.log('Comments rendered');
		});
	}

}