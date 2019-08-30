import { SETTINGS_EVENT_NAME, COMMENTS_EVENT_NAME } from './util/events';

const unfoldIcon = require('./assets/icons/unfold_more.svg');

export class Renderer {
	public static init(): void {
		window.addEventListener(SETTINGS_EVENT_NAME, () => {
			console.log('Settings rendered');
		});

		window.addEventListener(COMMENTS_EVENT_NAME, () => {
			console.log('Comments rendered');
			this.renderComments();
		});
	}

	public static renderStyledSelect(select: JQuery<HTMLSelectElement>): void {
		const container = $(document.createElement('label'));
		container.addClass('select-container');

		select.before(container);
		container.append(select, unfoldIcon);
	}

	private static renderComments(): void {
		const footerTemplate = require('./templates/comment-foot.html');
		console.log(footerTemplate);
		$('.comment-foot').each((_i, element) => {
			$(element).append(footerTemplate);
		});
	}
}