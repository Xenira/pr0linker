import Settings from './settings';
import { COMMENTS_EVENT_NAME } from './util/events';

import './styles/comments.scss';
import SelectComponent from './components/select.component';

const overlay = require('./templates/add-user-overlay.html');

export default class Comments {
	constructor(private settings: Settings) {
		window.addEventListener(COMMENTS_EVENT_NAME, () => this.render());
	}

	render(): void {
		const footerTemplate = require('./templates/comment-foot.html');
		$('.comment-foot').each((_i, element) => {
			$(element).append(footerTemplate);
		});

		$('.comment-foot .add-to-linklist').click(() => this.openAddDialog());
	}

	openAddDialog(): void {
		$('body').append(overlay);

		const listSelect = new SelectComponent();
		this.settings.populateLinkList(listSelect);
		$('#add-user-select-container').append(listSelect.container);
		$('#overlay-target').click(() => $('#overlay').remove());
	}
}