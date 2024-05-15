import type { z } from 'zod';
import type { Endpoint } from './endpoint';
import type { DeleteIfValueIsNeverOrEmptyObj, DeleteNever, PartialIfOptional, ValueOf } from './utils';

export type EndpointImpl<E> = E extends Endpoint<infer _P, infer _S> ? EndpointImplType<E> : never;
type EndpointImplType<E> = (input: EndpointInput<E>) => Promise<EndpointOutput<E>>;

type InputParamType<E, Param> = E extends Endpoint<infer _P, infer _S> ? (Param extends keyof E['proc']['input'] ? z.infer<E['proc']['input'][Param]> : never) : never;

type MapRequestGroup<E, G extends string> = E extends Endpoint<infer _P, infer _S>
	? PartialIfOptional<{
			[K in keyof E['request']['mapping'] as E['request']['mapping'][K] extends `${G}.${infer Param}` ? Param : never]: InputParamType<E, K>;
		}>
	: never;
export type EndpointInput<E> = DeleteIfValueIsNeverOrEmptyObj<{
	path: MapRequestGroup<E, 'path'>;
	query: MapRequestGroup<E, 'query'>;
	header: MapRequestGroup<E, 'header'>;
	cookie: MapRequestGroup<E, 'cookie'>;
	body: MapRequestGroup<E, 'body'>;
}>;

type OutputParamType<E, R, Param> = E extends Endpoint<infer _P, infer _S>
	? R extends keyof E['proc']['output']
		? Param extends keyof E['proc']['output'][R]
			? z.infer<E['proc']['output'][R][Param]>
			: never
		: never
	: never;

type MapResponseGroup<E, R, G extends string> = E extends Endpoint<infer _P, infer _S>
	? R extends keyof E['response']
		? PartialIfOptional<{
				[K in keyof E['response'][R]['mapping'] as E['response'][R]['mapping'][K] extends `${G}.${infer Param}` ? Param : never]: OutputParamType<E, R, K>;
			}>
		: never
	: never;
export type EndpointOutput<E> = E extends Endpoint<infer _P, infer _S>
	? ValueOf<{
			[R in keyof E['response']]: EndpointResult<E, R>;
		}>
	: never;
export type EndpointResult<E, R> = E extends Endpoint<infer _P, infer _S>
	? R extends keyof E['response']
		? DeleteIfValueIsNeverOrEmptyObj<{
				status: E['response'][R]['status'];
				header: DeleteNever<MapResponseGroup<E, R, 'header'>>;
				cookie: DeleteNever<MapResponseGroup<E, R, 'cookie'>>;
				body: DeleteNever<MapResponseGroup<E, R, 'body'>>;
			}>
		: never
	: never;
