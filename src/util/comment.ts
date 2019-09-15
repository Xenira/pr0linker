import { IPr0Model } from './pr0model';

declare const p: IPr0Model;

export default class Comment {
	public static post(comment: string, itemId: number, parentId: number): Promise<ICommentResponse> {
		const _nonce = p.user.id.substr(0, 16);
		return new Promise<ICommentResponse>((resolve, reject): void => {
			p.api.post('comments/post', {
				comment,
				itemId: itemId.toString(),
				parentId: parentId.toString(),
				_nonce
			}, (data) => resolve(data), (err) => reject(err));
		});
	}
}

export interface ICommentResponse {
	cache: null;
	commentId: string;
	comments: IComment[];
	qc: number;
	rt: number;
	ts: number;
}

export interface IComment {
	confidence: number;
	content: string;
	created: number;
	down: number;
	id: number;
	mark: number;
	name: string;
	parent: number;
	up: number;
}