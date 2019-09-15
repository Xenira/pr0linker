import { sanitize } from 'dompurify';

import Settings from './settings';
import { COMMENTS_EVENT_NAME } from './util/events';

import './styles/comments.scss';
import SelectComponent from './components/select.component';
import Comment from './util/comment';
import { IPr0Model } from './util/pr0model';

const addUserOverlay: string = require('./templates/add-user-overlay.html');
const linkUsersOverlay: string = require('./templates/link-users-overlay.html');
const addIcon: string = require('./assets/icons/add_comment.svg');

const commentRegex = /\d+:comment(\d+)/i;

const USERS_PER_COMMENT = 10;
const USER_SEPERATOR = ' / ';
const COMMENT_START = 'Gewünschte verlinkungen: ';

interface IUserLinkData extends DOMStringMap {
	user: string;
}


declare const p: IPr0Model;
export default class Comments {
	constructor(private settings: Settings) {
		window.addEventListener(COMMENTS_EVENT_NAME, () => this.render());
	}

	render(): void {
		const footerTemplate: string = require('./templates/comment-foot.html');
		$('.comment-foot').each((_i, element) => {
			const username = element.querySelector('a.user').textContent;
			if (username === p.user.name && element.querySelector('.user-comment-op')) {
				const icon = $(addIcon);
				$(element).append(icon);
				const link = element.querySelector<HTMLLinkElement>('a.permalink');
				const match = commentRegex.exec(link.href);
				if (!match) {
					console.warn('Unable to process', link);
					return;
				}

				const commentId = Number(match[1]);
				icon.click(() => this.openLinkDialog(commentId));
			} else {
				const userLink = footerTemplate.replace('{{user}}', sanitize(username));
				$(element).append(userLink);
			}
		});

		$('.comment-foot .add-to-linklist').click((ev) => this.openAddDialog(ev));
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

	openLinkDialog(commentId: number): void {
		const listsToLink: number[] = [];
		const listSelect = new SelectComponent();
		this.settings.populateLinkList(listSelect);

		$('body').append(linkUsersOverlay);
		$('#overlay-target').click(() => $('#overlay.pr0linker').remove());
		$('#add-list-select-container').append(listSelect.container);
		$('#add-list-button').click(() => {
			const value = Number(listSelect.selectElement.val());
			if (!isNaN(value) && listsToLink.indexOf(value) === -1) {
				listsToLink.push(value);
			}
			this.populateUsersToLinkList(listsToLink);
		});
		$('#post-comment').click(async () => {
			const usersToLink: { name: string; active: boolean }[][] = this.getUsersToLink(listsToLink)
				.filter((u) => u.active)
				.reduce((prev, curr, i) => {
					const index = Math.floor(i / USERS_PER_COMMENT);
					while (prev.length <= index) {
						prev.push([]);
					}
					prev[index].push(curr);
					return prev;
				}, []);

			let comment = COMMENT_START;
			while (usersToLink.length) {
				const users = usersToLink.shift();
				comment += users.reduce((prev, curr, i) => prev + (i !== 0 ? USER_SEPERATOR : '') + '@' + curr.name, '');
				const result = await Comment.post(comment, Number(p.currentView.currentItemId), commentId);
				console.log(result);
				commentId = Number(result.commentId);
				comment = '';
			}

			console.log('post comment for', commentId, 'with users', usersToLink);
		});
	}

	populateUsersToLinkList(listsToLink: number[]): void {
		const list = $('ul#selected-users');
		list.html('');
		this.getUsersToLink(listsToLink).forEach((user) => {
			const item: JQuery<HTMLLIElement> = $(document.createElement('li'));
			item.text(sanitize(user.name));

			if (!user.active) {
				item.addClass('inactive');
				item.prop('title', 'Wird nicht erneut verlinkt, da bereits in den kommentaren verlinkt.');
			}

			list.append(item);
		});
	}

	getUsersToLink(listsToLink: number[]): { name: string; active: boolean }[] {
		const usernames: string[] = [];

		listsToLink.forEach((listId) => {
			this.settings.settings.lists[listId].users.forEach((user) => {
				if (usernames.indexOf(user.handle) === -1) {
					usernames.push(user.handle);
				}
			});
		});

		return usernames.map((name) => {
			return {
				name,
				active: $(`.comment-content a[href="/user/${name}"]`).text().toLowerCase() !== `@${name}`.toLowerCase()
			};
		});
	}
}