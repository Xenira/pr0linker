import Settings from './settings';
import { COMMENTS_EVENT_NAME } from './util/events';

import './styles/comments.scss';
import SelectComponent from './components/select.component';

const overlay: string = require('./templates/add-user-overlay.html');

interface IUserLinkData extends DOMStringMap {
	user: string;
}

export default class Comments {
	constructor(private settings: Settings) {
		window.addEventListener(COMMENTS_EVENT_NAME, () => this.render());
	}

	render(): void {
		const footerTemplate: string = require('./templates/comment-foot.html');
		$('.comment-foot').each((_i, element) => {
			const userLink = footerTemplate.replace('{{user}}', element.querySelector('a.user').textContent);
			$(element).append(userLink);
		});

		$('.comment-foot .add-to-linklist').click((ev) => this.openAddDialog(ev));
	}

	openAddDialog(event: JQuery.ClickEvent<HTMLElement, null, HTMLElement, HTMLElement>): void {
		const username = (event.target.dataset as IUserLinkData).user;
		const listSelect = new SelectComponent();
		this.settings.populateLinkList(listSelect);

		$('body').append(overlay.replace('{{user}}', username));
		$('#add-user-select-container').append(listSelect.container);
		$('#overlay-target').click(() => $('#overlay').remove());
		$('#add-user').click(() => this.addUserToList(Number(listSelect.selectElement.val()), username));
	}

	addUserToList(index: number, username: string): void {
		this.settings.addUserToList(index, username);
	}
}