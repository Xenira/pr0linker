import { sanitize } from 'dompurify';

import { SETTINGS_EVENT_NAME } from './util/events';
import { ISettings } from './model/settings';
import { IUser } from './model/user';
import SelectComponent from './components/select.component';

import './styles/settings.scss';

const settingsTemplate = require('./templates/settings.html');
const deleteIcon = require('./assets/icons/delete.svg');
const deleteAllIcon = require('./assets/icons/delete_forever.svg');

export default class Settings {

	settings: ISettings;

	private listSelect: SelectComponent;

	constructor() {
		const storageItem = localStorage.getItem('pr0linkerSettings');
		this.settings = storageItem ? JSON.parse(storageItem).settings : {
			general: {},
			lists: [{
				name: 'Default',
				key: 'default',
				users: [{
					handle: 'Werd0lf',
					registered: new Date().getTime()
				}]
			}]
		};
		window.addEventListener(SETTINGS_EVENT_NAME, () => this.addSettingsTab());
	}

	addSettingsTab(): void {
		const button = document.createElement('a');
		button.innerText = 'pr0linker';
		button.href = '#';
		button.addEventListener('click', () => {
			$('.tab-bar .active').removeClass('active');
			button.classList.add('active');
			this.loadSettingsPage();
		});
		$('.tab-bar').append(button);
	}

	loadSettingsPage(): void {
		$('.pane.form-page').html(settingsTemplate);
		this.listSelect = new SelectComponent({ key: '-1', value: 'Alle Verlinkungswünsche' });
		console.log(this.listSelect);
		$('#list-select-container').replaceWith(this.listSelect.container);
		this.populateLinkList(this.listSelect);
	}

	populateLinkList(select: SelectComponent, index = Number(this.listSelect.selectElement.val())): void {
		select.setItems(this.settings.lists.map((list, i) => ({ key: i.toString(), value: `${list.name} (${list.users.length})` })));

		select.selectElement.change((e) => {
			const index = Number.parseInt(e.target.value, 10);
			if (!Number.isInteger(index)) {
				return;
			}
			this.renderLinks(index);
		});

		select.selectElement.val(index);
		this.renderLinks(index);
	}

	private renderLinks(index: number): void {
		const linkList = $('#link-users');
		linkList.html('');

		const users: { [username: string]: IUser } = {};
		if (index >= 0) {
			this.settings.lists[index].users.forEach((u) => users[u.handle] = u);
		} else {
			this.settings.lists.forEach((list) => {
				list.users.forEach((u) => users[u.handle] = u);
			});
		}

		let hasUsers = false;
		for (const key in users) {
			if (users.hasOwnProperty(key)) {
				hasUsers = true;
				const user = users[key];
				const sanitizedUserHandle = sanitize(user.handle);

				const listItem = $(document.createElement('li'));
				listItem.append(`<a href="/user/${sanitizedUserHandle}">@${sanitizedUserHandle}</a> `);

				const deleteLink = $(document.createElement('a'));
				deleteLink.addClass('icon-button');
				deleteLink.click(() => this.deleteUserFromList(index, user, sanitizedUserHandle));
				deleteLink.append(index < 0 ? deleteAllIcon : deleteIcon);

				listItem.append(deleteLink);
				linkList.append(listItem);
			}
		}

		if (!hasUsers) {
			linkList.append('<span>Es sind keine Benutzer in dieser Liste.</span>');
		}

		if (index >= 0) {
			const addUserInput: JQuery<HTMLInputElement> = $(document.createElement('input'));
			addUserInput.prop('placeholder', 'Benutzername');
			const addUserButton = $(document.createElement('a'));
			addUserButton.addClass('icon-button');
			addUserButton.text('Benutzer Hinzufügen');
			addUserButton.click(() => this.addUserToList(index, addUserInput.val().toString()));
			linkList.append(addUserInput, addUserButton);
		}
	}

	addUserToList(index: number, username: string): void {
		if (index >= this.settings.lists.length) {
			return;
		}

		console.log(username);
		username = username.replace('@', '');
		if (this.settings.lists[index].users.some((u) => u.handle === username)) {
			return;
		}
		this.settings.lists[index].users.push({
			handle: sanitize(username),
			registered: new Date().getTime()
		});
		this.populateLinkList(this.listSelect);
	}

	private deleteUserFromList(index: number, user: IUser, handle: string): void {
		if (index < 0 && !confirm(`Möchtest du ${handle} wirklich aus ALLEN Listen entfernen?`)) {
			return;
		}

		if (index >= 0 && (index >= this.settings.lists.length
			|| !confirm(`Möchtest du ${handle} wirklich aus der Liste '${sanitize(this.settings.lists[index].name)}' löschen?`))) {
			return;
		}

		this.settings.lists.filter((_list, i) => index < 0 || index === i).forEach((list) => {
			list.users = list.users.filter((u) => user.handle !== u.handle);
		});
		this.populateLinkList(this.listSelect);
	}
}