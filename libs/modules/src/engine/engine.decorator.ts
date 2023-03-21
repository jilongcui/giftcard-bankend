
import { Inject } from '@nestjs/common';

export const prefixesForEngines: string[] = new Array<string>();

export function InjectEngine(mode: string = '') {
  if (!prefixesForEngines.includes(mode)) {
    prefixesForEngines.push(mode);
  }
  return Inject(`Engine${mode}Service`);
}