import type { Proc } from './proc';
import type { SafeOmit } from './utils';

// Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
type InformationalStatusCode = 100 | 101 | 102 | 103;
type SuccessStatusCode = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226;
type RedirectStatusCode = 300 | 301 | 302 | 303 | 304 | 307 | 308;
type ClientErrorStatusCode = 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 426 | 428 | 429 | 431 | 451;
type ServerErrorStatusCode = 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;
export type StatusCode = InformationalStatusCode | SuccessStatusCode | RedirectStatusCode | ClientErrorStatusCode | ServerErrorStatusCode;

type PathParamUnion<S extends string> = S extends `${string}/{${infer Param}}${infer Rest}` ? Param | PathParamUnion<Rest> : never;
export type RequestMappingOf<S extends string> =
	| (PathParamUnion<S> extends never ? never : `path.${PathParamUnion<S>}`)
	| `query.${string}`
	| `header.${string}`
	| `cookie.${string}`
	| `body.${string}`;
export type ResponseMapping = `header.${string}` | `cookie.${string}` | `body.${string}`;

export interface Endpoint<P extends Proc, S extends string> {
	proc: P;
	pathname: S;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	request: {
		format?: 'json' | 'formdata'; // default: 'json'
		mapping: {
			[K in keyof P['input']]: RequestMappingOf<S>;
		};
	};
	response: {
		[R in keyof P['output']]: {
			status: StatusCode;
			format?: 'json' | 'formdata'; // default: 'json'
			mapping: {
				[K in keyof P['output'][R]]: ResponseMapping;
			};
		};
	};
}

export const defineEndpoint = <P extends Proc, S extends string, Config extends SafeOmit<Endpoint<P, S>, 'proc' | 'pathname'>>(
	proc: P,
	pathname: S,
	config: Config,
): Config & { proc: P; pathname: S } => {
	return { ...config, proc, pathname } satisfies Endpoint<P, S>;
};
