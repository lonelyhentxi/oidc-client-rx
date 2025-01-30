import { TestBed } from '@/testing';
import { lastValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { vi } from 'vitest';
import { EventTypes } from './event-types';
import { PublicEventsService } from './public-events.service';

describe('Events Service', () => {
  let eventsService: PublicEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PublicEventsService],
    });
    eventsService = TestBed.inject(PublicEventsService);
  });

  it('should create', () => {
    expect(eventsService).toBeTruthy();
  });

  it('registering to single event with one event emit works', async () => {
    const firedEvent = await lastValueFrom(eventsService.registerForEvents());
    expect(firedEvent).toBeTruthy();
    expect(firedEvent).toEqual({
      type: EventTypes.ConfigLoaded,
      value: { myKey: 'myValue' },
    });
    eventsService.fireEvent(EventTypes.ConfigLoaded, { myKey: 'myValue' });
  });

  it('registering to single event with multiple same event emit works', async () => {
    const spy = vi.fn()('spy');

    const firedEvent = await lastValueFrom(eventsService.registerForEvents());
    spy(firedEvent);
    expect(firedEvent).toBeTruthy();
    eventsService.fireEvent(EventTypes.ConfigLoaded, { myKey: 'myValue' });
    eventsService.fireEvent(EventTypes.ConfigLoaded, { myKey: 'myValue2' });

    expect(spy.calls.count()).toBe(2);
    expect(spy.calls.first().args[0]).toEqual({
      type: EventTypes.ConfigLoaded,
      value: { myKey: 'myValue' },
    });
    expect(spy.postSpy.mock.calls.at(-1)?.[0]).toEqual({
      type: EventTypes.ConfigLoaded,
      value: { myKey: 'myValue2' },
    });
  });

  it('registering to single event with multiple emit works', async () => {
    const firedEvent = await lastValueFrom(
      eventsService
        .registerForEvents()
        .pipe(filter((x) => x.type === EventTypes.ConfigLoaded))
    );
    expect(firedEvent).toBeTruthy();
    expect(firedEvent).toEqual({
      type: EventTypes.ConfigLoaded,
      value: { myKey: 'myValue' },
    });
    eventsService.fireEvent(EventTypes.ConfigLoaded, { myKey: 'myValue' });
    eventsService.fireEvent(EventTypes.NewAuthenticationResult, true);
  });
});
