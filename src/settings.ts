import { sanitize } from 'dompurify';

import { SETTINGS_EVENT_NAME } from './util/events';
import { ISettings } from './model/settings';
import { IUser } from './model/user';
import SelectComponent from './components/select.component';

import './styles/settings.scss';

const settingsTemplate = require('./templates/settings.html');
const deleteIcon = require('./assets/icons/delete.svg');
const deleteAllIcon = require('./assets/icons/delete_forever.svg');

const SETTINGS_PREFIX = 'pr0linkerSettings';
const SETTINGS_LISTS = 'lists';
const SETTINGS_GENERAL = 'general';

const RENAME_PROMPT = 'Gib den neuen namen für die liste {{name}} ein:';
const DELETE_WARNING = 'Willst du die Liste {{name}} wirklich Löschen? Dies kann nicht rückgängig gemacht werden!';

export default class Settings {

	settings: ISettings;

	private listSelect: SelectComponent;

	constructor() {
		this.settings = {
			general: JSON.parse(localStorage.getItem(`${SETTINGS_PREFIX}.${SETTINGS_GENERAL}`)) || {},
			lists: JSON.parse(localStorage.getItem(`${SETTINGS_PREFIX}.${SETTINGS_LISTS}`)) || [{
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
		this.listSelect.selectElement.change((e) => {
			const index = Number.parseInt(e.target.value, 10);
			if (!Number.isInteger(index)) {
				return;
			}
			this.renderLinks(index);
		});

		$('#add-link-list').click(() => {
			this.addList(sanitize($('#new-list-name').val().toString().trim()));
			$('#new-list-name').val('');
			this.populateLinkList(this.listSelect, this.settings.lists.length - 1);
			this.renderLinks(this.settings.lists.length - 1);
		});

		$('#list-select-container').replaceWith(this.listSelect.container);
		this.populateLinkList(this.listSelect);
		this.renderLinks();
	}

	populateLinkList(select: SelectComponent, index?: number): void {
		if (index === undefined) {
			index = Number(select.selectElement.val());
		}
		select.setItems(this.settings.lists.map((list, i) => ({ key: i.toString(), value: `${list.name} (${list.users.length})` })));

		select.selectElement.val(index);
	}

	private renderLinks(index = Number(this.listSelect.selectElement.val())): void {
		const linkList = $('#link-users');
		linkList.html('');

		const users: { [username: string]: IUser } = {};
		if (index >= 0) {
			$('#list-title').show();
			$('#list-title > h4').text(this.settings.lists[index].name);
			$('#edit-list').off('click').click(() => {
				let name: string = prompt(RENAME_PROMPT.replace('{{name}}', this.settings.lists[index].name), this.settings.lists[index].name);
				name = sanitize(name.trim());
				if (!name || !name.length) {
					return;
				}

				this.settings.lists[index].name = name;
				this.saveLists();
				this.populateLinkList(this.listSelect, index);
				this.renderLinks(index);
			});
			$('#delete-list').off('click').click(() => {
				if (!confirm(DELETE_WARNING.replace('{{name}}', this.settings.lists[index].name))) {
					return;
				}
				this.deleteList(index);
				this.populateLinkList(this.listSelect, this.settings.lists.length ? 0 : -1);
				this.renderLinks(this.settings.lists.length ? 0 : -1);
			});
			this.settings.lists[index].users.forEach((u) => users[u.handle] = u);
		} else {
			$('#list-title').hide();
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
				deleteLink.click(() => {
					this.deleteUserFromList(index, user, sanitizedUserHandle);
					this.populateLinkList(this.listSelect);
					this.renderLinks();
				});
				deleteLink.append(index < 0 ? deleteAllIcon : deleteIcon);

				listItem.append(deleteLink);
				linkList.append(listItem);
			}
		}

		if (!hasUsers) {
			linkList.append('<p>Es sind keine Benutzer in dieser Liste.</p>');
		}

		if (index >= 0) {
			const addUserInput: JQuery<HTMLInputElement> = $(document.createElement('input'));
			addUserInput.prop('placeholder', 'Benutzername');
			const addUserButton = $(document.createElement('a'));
			addUserButton.addClass('icon-button');
			addUserButton.text('Benutzer Hinzufügen');
			addUserButton.click(() => {
				this.addUserToList(index, addUserInput.val().toString());
				this.populateLinkList(this.listSelect);
				this.renderLinks();
			});
			linkList.append(addUserInput, addUserButton);
		}
	}

	public addUserToList(index: number, username: string): void {
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
		this.saveLists();
	}

	public deleteUserFromList(index: number, user: IUser, handle: string): void {
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
		this.saveLists();
	}

	public addList(name: string): void {
		this.settings.lists.push({
			name,
			key: name.replace(/\W/g, ''),
			users: []
		});
		this.saveLists();
	}

	public deleteList(index: number): void {
		console.warn('List before delete:', this.settings.lists);
		this.settings.lists.splice(index, 1);
		this.saveLists();
	}

	public saveLists(): void {
		window.localStorage.setItem(`${SETTINGS_PREFIX}.${SETTINGS_LISTS}`, JSON.stringify(this.settings.lists));
	}
}