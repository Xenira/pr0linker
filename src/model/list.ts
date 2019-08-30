import { IUser } from './user';

export interface IList {
	name: string;
	key: string;
	users: IUser[];
}