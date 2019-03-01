export interface FluxStandardAction<Payload, Meta = undefined> {
  type: string;
  payload?: Payload;
  error?: boolean;
  meta?: Meta;
}

export type AsyncStandardAction = FluxStandardAction<Function>;
