import { ProtectedContext } from '../../trpc';

/**
 * Creates a regex pattern for validating KSUIDs with a specific prefix
 * @param prefix The prefix for the KSUID (e.g., "chan", "msg", "user")
 * @returns A RegExp that matches the pattern: prefix_27alphanumeric
 *
 * @example
 * idRegex("chan") // matches "chan_1a2b3c4d5e6f7g8h9i0j1k2l3m4"
 * idRegex("msg")  // matches "msg_1a2b3c4d5e6f7g8h9i0j1k2l3m4"
 */
export const ksuidRegex = (prefix: string): RegExp => new RegExp(`^${prefix}_[0-9A-Za-z]{27}$`);

export const ID_PREFIX = {
  CHANNEL: 'chan',
  MESSAGE: 'msg',
  USER: 'user',
  ORGANIZATION: 'org',
};

export type ProtectedInput<T> = {
  ctx: ProtectedContext;
  input: T;
};
