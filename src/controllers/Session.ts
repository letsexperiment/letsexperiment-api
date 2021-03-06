import { Collection, ObjectID, MongoError, InsertWriteOpResult } from 'mongodb';

import store from '../store';
import Session from '../models/Session';
import HttpResponse from '../models/HttpResponse';

export default class SessionContoller {
	private collection: Collection;

	constructor() {
		this.collection = store.db.collection('sessions');
	}

	public getAllSessions(): Promise<HttpResponse> {
		return new Promise((resolve, reject) => {
			this.collection.find({}).toArray((dbError, dbRes) => {
				if (dbError) {
					reject(new HttpResponse(500, 'Database', dbError));
				}
				resolve(new HttpResponse(200, 'Success', dbRes));
			});
		});
	}

	private getSession(filter: any): Promise<HttpResponse> {
		return new Promise((resolve, reject) => {
			this.collection.findOne(filter, (dbError, dbRes) => {
				if (dbError) {
					reject(new HttpResponse(500, 'Database', dbError));
				}
				if (dbRes === null) {
					reject(new HttpResponse(400, 'InvalidQueryParameterValue', 'Session doesn\'t exist.'));
				}
				resolve(new HttpResponse(200, 'Success', dbRes));
			});
		});
	}

	public getSessionById(id: string): Promise<HttpResponse>  {
		return new Promise((resolve, reject) => {
			if (id.length !== 24) {
				reject(new HttpResponse(400, 'InvalidQueryParameterValue', 'Session doesn\'t exist.'));
			}
			this.getSession({_id: new ObjectID(id)})
				.then((r) => resolve(r))
				.catch((r) => reject(r));
		});
	}

	private insertSession(session: Session): Promise<HttpResponse> {
		return new Promise((resolve, reject) => {
			this.collection.insertOne(session.props, (dbError, dbRes) => {
				if (dbError) {
					reject(new HttpResponse(500, 'Database', dbError));
				}
				resolve(new HttpResponse(200, 'Success', session.props));
			});
		});
	}

	public addSession(props: any): Promise<HttpResponse> {
		return new Promise((resolve, reject) => {
			const required = [
				'partnerOneNickname',
				'partnerTwoNickname',
				'partnerOneQuestions',
				'partnerTwoQuestions',
				'partnerOneIsDone',
				'partnerTwoIsDone',
				'partnerOneCurrentGroup',
				'partnerTwoCurrentGroup',
				'showTransfer'
			];
			const session = new Session(props, required);
			session.validate()
				.then(session.hasRequiredProperties.bind(session))
				.then(() => {
					this.insertSession(session)
						.then((r) => resolve(r))
						.catch((r) => reject(r));
				})
				.catch((message: any) => {
					reject(new HttpResponse(400, 'InvalidInput', message));
				});
		});
	}

	private updateSession(filter: any, props: any): Promise<HttpResponse> {
		return new Promise((resolve, reject) => {
			if (Object.keys(props).length === 0) {
				reject(new HttpResponse(400, 'InvalidInput', 'No properties to update'));
			}
			const session = new Session(props);
			session.validate()
				.then(() => {
					this.collection.updateOne(filter, {$set: props}, (dbError, dbRes) => {
						if (dbError) {
							reject(new HttpResponse(500, 'Database', dbError));
						}
						resolve(new HttpResponse(200, 'Success', dbRes));
					});
				})
				.catch((message: any) => {
					reject(new HttpResponse(400, 'InvalidInput', message));
				});
		});
	}

	public updateSessionById(id: string, props: any): Promise<HttpResponse> {
		return new Promise((resolve, reject) => {
			this.getSessionById(id).then(() => {
				this.updateSession({
					_id: new ObjectID(id)
				}, props)
					.then((r) => resolve(r))
					.catch((e) => reject(e));
			}).catch((r) => reject(r));
		});
	}

	private deleteSession(filter: any): Promise<HttpResponse> {
		return new Promise((resolve, reject) => {
			this.collection.deleteOne(filter, (dbError, dbRes: any) => {
				if (dbError) {
					reject(new HttpResponse(500, 'Database', dbError));
				}
				if (dbRes.result.n === 0) {
					reject(new HttpResponse(400, 'InvalidQueryParameterValue', 'Session doesn\'t exist.'));
				}
				resolve(new HttpResponse(200, 'Success', dbRes));
			});
		});
	}

	public deleteSessionById(id: string): Promise<HttpResponse> {
		return new Promise((resolve, reject) => {
			this.getSessionById(id).then(() => {
				this.deleteSession({
					_id: new ObjectID(id)
				})
					.then((r) => resolve(r))
					.catch((r) => reject(r));
			}).catch((r) => reject(r));
		});
	}

	public deleteAll(confirm: string): Promise<HttpResponse> {
		return new Promise((resolve, reject) => {
			if (confirm !== 'true') {
				reject(new HttpResponse(400, 'InvalidInput', 'Requires confirmation.'));
			}
			this.collection.deleteMany({}, (dbError, dbRes: any) => {
				if (dbError) {
					reject(new HttpResponse(500, 'Database', dbError));
				}
				resolve(new HttpResponse(200, 'Success', dbRes));
			});
		});
	}
}