import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a v4 UUID
 * @returns UUID string
 */
export const generateUUID = (): string => {
  return uuidv4();
};

/**
 * Validate a UUID string
 * @param uuid - UUID string to validate
 * @returns boolean
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
