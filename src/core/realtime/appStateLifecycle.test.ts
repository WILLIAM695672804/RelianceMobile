import type { AppStateStatus } from 'react-native';

import { BACKGROUND_DISCONNECT_DELAY_MS, bindAppStateLifecycle } from './appStateLifecycle';

function setup() {
  let listener: ((state: AppStateStatus) => void) | undefined;
  const remove = jest.fn();
  const service = { pause: jest.fn(), resume: jest.fn() };
  const unbind = bindAppStateLifecycle({
    service,
    addListener: (next) => {
      listener = next;
      return { remove };
    },
  });
  return { service, remove, unbind, emit: (state: AppStateStatus) => listener?.(state) };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('bindAppStateLifecycle', () => {
  it('suspend la connexion après 30 s en arrière-plan', () => {
    const { service, emit } = setup();
    emit('background');

    jest.advanceTimersByTime(BACKGROUND_DISCONNECT_DELAY_MS - 1);
    expect(service.pause).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(service.pause).toHaveBeenCalledTimes(1);
  });

  it('annule la suspension si l’application revient au premier plan avant 30 s', () => {
    const { service, emit } = setup();
    emit('background');
    jest.advanceTimersByTime(10_000);
    emit('active');
    jest.advanceTimersByTime(BACKGROUND_DISCONNECT_DELAY_MS);

    expect(service.pause).not.toHaveBeenCalled();
    expect(service.resume).not.toHaveBeenCalled();
  });

  it('reprend la connexion au retour au premier plan après suspension', () => {
    const { service, emit } = setup();
    emit('background');
    jest.advanceTimersByTime(BACKGROUND_DISCONNECT_DELAY_MS);
    emit('active');

    expect(service.resume).toHaveBeenCalledTimes(1);
  });

  it('ignore l’état transitoire inactive', () => {
    const { service, emit } = setup();
    emit('inactive');
    jest.advanceTimersByTime(BACKGROUND_DISCONNECT_DELAY_MS);
    expect(service.pause).not.toHaveBeenCalled();
  });

  it('se détache proprement', () => {
    const { service, emit, unbind, remove } = setup();
    emit('background');
    unbind();
    jest.advanceTimersByTime(BACKGROUND_DISCONNECT_DELAY_MS);

    expect(remove).toHaveBeenCalled();
    expect(service.pause).not.toHaveBeenCalled();
  });
});
