import { IPr0Model } from './pr0model';

declare const p: IPr0Model;
export const COMMENTS_EVENT_NAME = 'pr0linker.commentsLoaded';
export const SETTINGS_EVENT_NAME = 'pr0linker.settingsLoaded';
export const USER_EVENT_NAME = 'pr0linker.userLoaded';

export default class Events {
	public static register(): void {
		const originalCommentsRenderer = p.View.Stream.Comments.prototype.render;
		p.View.Stream.Comments.prototype.render = function (): void {
			originalCommentsRenderer.call(this);
			window.dispatchEvent(new Event(COMMENTS_EVENT_NAME));
		};

		const originalSettingsRenderer = p.View.Settings.prototype.render;
		p.View.Settings.prototype.render = function (): void {
			originalSettingsRenderer.call(this);
			window.dispatchEvent(new Event(SETTINGS_EVENT_NAME));
		};

		const originalUserRenderer = p.View.User.prototype.render;
		p.View.User.prototype.render = function (): void {
			originalUserRenderer.call(this);
			window.dispatchEvent(new Event(USER_EVENT_NAME));
		};

		if (p.getLocation().startsWith('settings/')) {
			window.dispatchEvent(new Event(SETTINGS_EVENT_NAME));
		} else if (/user\/\w+$/g.test(p.getLocation())) {
			window.dispatchEvent(new Event(USER_EVENT_NAME));
		}
	}
}
