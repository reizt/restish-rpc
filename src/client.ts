import type { Endpoint } from './endpoint';
import type { Proc, ProcInput, ProcOutput } from './proc';

export interface ClientConfig {
	baseUrl: string;
}

export class RRClient {
	constructor(public config: ClientConfig) {}

	async call<P extends Proc>(endpoint: Endpoint<P, any>, input: ProcInput<P>): Promise<ProcOutput<P>> {
		const request = this.createRequest(endpoint, input);
		const response = await fetch(request);

		if (response.body == null) {
			return {} as ProcOutput<P>;
		}

		return await response.json();
	}

	createRequest<P extends Proc>(endpoint: Endpoint<P, any>, input: ProcInput<P>): Request {
		const url = this.config.baseUrl + endpoint.pathname;
		return new Request(url, {
			method: endpoint.method,
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(input),
		});
	}
}
