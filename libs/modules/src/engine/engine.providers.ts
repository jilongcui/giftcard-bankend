import { prefixesForEngines } from './engine.decorator';
import { Provider } from '@nestjs/common';
import { EngineService } from './engine.interface';
import { EngineCompleteService } from './engine-complete.service';
import { EngineChatService } from './engine-chat.service';

function engineFactory(engine: EngineService, mode: string) {
  if (mode) {
    engine.setMode(mode);
  }
  return engine;
}

function createEngineProvider(mode: string): Provider<EngineService> {
  return {
    provide: `Engine${mode}Service`,
    useFactory: engine => engineFactory(engine, mode),
    inject: [EngineChatService, EngineCompleteService],
  };
}

export function createEngineProviders(): Array<Provider<EngineService>> {
  return prefixesForEngines.map(prefix => createEngineProvider(prefix));
}