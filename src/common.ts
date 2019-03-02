export interface FluxStandardAction<Payload, Meta = undefined> {
  type: string;
  payload?: Payload;
  error?: boolean;
  meta?: Meta;
}

/**
 * Is a type of FSA which has a function payload (async / non-async)
 */
export type AsyncStandardAction<Meta = undefined> = FluxStandardAction<
  Function,
  Meta
>;
