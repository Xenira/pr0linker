import { sanitize } from 'dompurify';

import { USER_EVENT_NAME } from './util/events';
import { IPr0Model } from './util/pr0model';
import Settings from './settings';
import SelectComponent from './components/select.component';
import { IUserLinkData } from './comments';

import './styles/user.scss';
declare const p: IPr0Model;

const addUserOverlay: string = require('./templates/add-user-overlay.html');

export default class User {
	constructor(private settings: Settings) {
		window.addEventListener(USER_EVENT_NAME, () => this.addAddLink());
	}

	addAddLink(): void {
		const headline = $('h1.pane-head.user-head');
		$(headline).append(`<span id="add-user" class="action" data-user="${sanitize(p.currentView.data.user.name)}"><strong>@</strong> Zu Linkliste hinzufügen</span>`);
		$('#add-user').click((ev) => this.openAddDialog(ev));
	}

	openAddDialog(event: JQuery.ClickEvent<HTMLElement, null, HTMLElement, HTMLElement>): void {
		const username = (event.target.dataset as IUserLinkData).user;
		const listSelect = new SelectComponent();
		this.settings.populateLinkList(listSelect);

		$('body').append(addUserOverlay.replace('{{user}}', sanitize(username)));
		$('#add-user-select-container').append(listSelect.container);
		$('#overlay-target').click(() => $('#overlay.pr0linker').remove());
		$('#add-user').click(() => {
			this.addUserToList(Number(listSelect.selectElement.val()), username);
			$('#overlay.pr0linker').remove();
		});
	}

	addUserToList(index: number, username: string): void {
		this.settings.addUserToList(index, username);
	}
}