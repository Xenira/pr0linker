import { ICommentResponse } from './comment';

export interface IPr0Model {
	View: {
		Stream: {
			Comments: {
				prototype: {
					render: () => void;
				};
			};
		};
		Settings: {
			prototype: {
				render: () => void;
			};
		};
		User: {
			prototype: {
				render: () => void;
			};
		};
	};
	getLocation: () => string;
	user: {
		name: string;
		id: string;
	};
	api: {
		post: (endpoint: 'comments/post', data: { comment: string; itemId: string; parentId: string; _nonce: string }, success: (data: ICommentResponse) => void, error: (err: unknown) => void) => void;
	};
	currentView: {
		currentItemId: string;
		data: {
			user: {
				name: string;
			};
		};
	};
}