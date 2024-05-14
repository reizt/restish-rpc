import type { z } from 'zod';
import type { Proc, ProcImpl } from './proc';
import type { DeleteNever, PartialIfOptional, SafeOmit, ValueOf } from './utils';

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

export const defineEndpoint = <P extends Proc, S extends string, Config extends SafeOmit<Endpoint<P, S>, 'proc' | 'pathname'>>(
	proc: P,
	pathname: S,
	config: Config,
): Config & { proc: P; pathname: S } => {
	return { ...config, proc, pathname } satisfies Endpoint<P, S>;
};
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

export type EndpointImpl<E> = E extends Endpoint<infer P, infer S> ? EndpointImplType<P, S, E> : never;
type EndpointImplType<P extends Proc, S extends string, E extends Endpoint<P, S>> = (procImpl: ProcImpl<E['proc']>, input: EndpointInput<P, S, E>) => Promise<EndpointOutput<P, S, E>>;

type InputParamType<S extends string, E extends Endpoint<Proc, S>, Param extends keyof E['request']['mapping']> = Param extends keyof E['proc']['input'] ? z.infer<E['proc']['input'][Param]> : never;

type MapRequestPath<P extends Proc, S extends string, E extends Endpoint<P, S>> = PartialIfOptional<{
	[K in keyof E['request']['mapping'] as E['request']['mapping'][K] extends `path.${infer Param}` ? Param : never]: InputParamType<S, E, K>;
}>;
type MapRequestQuery<P extends Proc, S extends string, E extends Endpoint<P, S>> = PartialIfOptional<{
	[K in keyof E['request']['mapping'] as E['request']['mapping'][K] extends `query.${infer Param}` ? Param : never]: InputParamType<S, E, K>;
}>;
type MapRequestHeader<P extends Proc, S extends string, E extends Endpoint<P, S>> = PartialIfOptional<{
	[K in keyof E['request']['mapping'] as E['request']['mapping'][K] extends `header.${infer Param}` ? Param : never]: InputParamType<S, E, K>;
}>;
type MapRequestCookie<P extends Proc, S extends string, E extends Endpoint<P, S>> = PartialIfOptional<{
	[K in keyof E['request']['mapping'] as E['request']['mapping'][K] extends `cookie.${infer Param}` ? Param : never]: InputParamType<S, E, K>;
}>;
type MapRequestBody<P extends Proc, S extends string, E extends Endpoint<P, S>> = PartialIfOptional<{
	[K in keyof E['request']['mapping'] as E['request']['mapping'][K] extends `body.${infer Param}` ? Param : never]: InputParamType<S, E, K>;
}>;
export type EndpointInput<P extends Proc, S extends string, E extends Endpoint<P, S>> = DeleteNever<{ path: MapRequestPath<P, S, E> }> &
	DeleteNever<{ query: MapRequestQuery<P, S, E> }> &
	DeleteNever<{ header: MapRequestHeader<P, S, E> }> &
	DeleteNever<{ cookie: MapRequestCookie<P, S, E> }> &
	DeleteNever<{ body: MapRequestBody<P, S, E> }>;

type OutputParamType<S extends string, E extends Endpoint<Proc, S>, R extends keyof E['response'], Param extends keyof E['response'][R]['mapping']> = R extends keyof E['proc']['output']
	? Param extends keyof E['proc']['output'][R]
		? z.infer<E['proc']['output'][R][Param]>
		: never
	: never;

type MapResponseHeader<P extends Proc, S extends string, E extends Endpoint<P, S>, R extends keyof E['response']> = PartialIfOptional<{
	[K in keyof E['response'][R]['mapping'] as E['response'][R]['mapping'][K] extends `header.${infer Param}` ? Param : never]: OutputParamType<S, E, R, K>;
}>;
type MapResponseCookie<P extends Proc, S extends string, E extends Endpoint<P, S>, R extends keyof E['response']> = PartialIfOptional<{
	[K in keyof E['response'][R]['mapping'] as E['response'][R]['mapping'][K] extends `cookie.${infer Param}` ? Param : never]: OutputParamType<S, E, R, K>;
}>;
type MapResponseBody<P extends Proc, S extends string, E extends Endpoint<P, S>, R extends keyof E['response']> = PartialIfOptional<{
	[K in keyof E['response'][R]['mapping'] as E['response'][R]['mapping'][K] extends `body.${infer Param}` ? Param : never]: OutputParamType<S, E, R, K>;
}>;
export type EndpointOutput<P extends Proc, S extends string, E extends Endpoint<P, S>> = ValueOf<{
	[R in keyof E['response']]: EndpointResult<P, S, E, R>;
}>;
export type EndpointResult<P extends Proc, S extends string, E extends Endpoint<P, S>, R extends keyof E['response']> = {
	status: E['response'][R]['status'];
} & DeleteNever<{ header: MapResponseHeader<P, S, E, R> }> &
	DeleteNever<{ cookie: MapResponseCookie<P, S, E, R> }> &
	DeleteNever<{ body: MapResponseBody<P, S, E, R> }>;
