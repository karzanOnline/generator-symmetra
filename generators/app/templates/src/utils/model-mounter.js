import { createHistoryEffect, transformModelByURI, URIParamsDecorator, TRANSFORM_KEY, NAMESPACE_KEY } from './history-manager';
import { get } from 'lodash';

export default (app, presets = []) => model => app.model(presets.reduce((mod, preset) => preset(mod), model));

export function mixinHistoryEffect (mod) {
  mod.effects = {
    ...createHistoryEffect(mod),
    ...mod.effects,
  }
  return mod;
}

export function mixinHistoryReducer (mod) {
  mod.reducers = {
    transformModelByURI,
    ...mod.reducers,
  }
  return mod;
}

export function mixinHistorySubscription (mod) {
  const _setup = get(mod, 'subscriptions.setup');
  if(_setup){
    mod.subscriptions.setup = args => _setup({
      ...args,
      URIParamsDecorator,
    });
  }
  return mod;
}

export const mixinHistorySync = [mixinHistoryEffect, mixinHistoryReducer, mixinHistorySubscription];
