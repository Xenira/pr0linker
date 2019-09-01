import { sanitize } from 'dompurify';

const template = require('../templates/list-select.html');

export interface ISelectOption {
	key: string;
	value: string;
}

export default class SelectComponent {
	container: JQuery<HTMLDivElement>;
	selectElement: JQuery<HTMLSelectElement>;

	public constructor(private defaultElement?: ISelectOption) {
		this.container = $(document.createElement('div'));
		this.container.addClass('select-container');
		this.container.append(template);
		this.selectElement = this.container.find('select') as unknown as JQuery<HTMLSelectElement>;
	}

	setItems(items: ISelectOption[]): void {
		this.selectElement.html('');
		if (this.defaultElement) {
			items.unshift(this.defaultElement);
		}

		this.addItems(items);
	}
	addItems(items: ISelectOption[]): void {
		items.forEach((i): JQuery<HTMLSelectElement> => this.selectElement.append(`<option value="${sanitize(i.key)}">${sanitize(i.value)}</option>`));
	}
}