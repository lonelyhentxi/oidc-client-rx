import { TestBed } from '@/testing';
import { of } from 'rxjs';
import { PASSED_CONFIG } from './auth-config';
import { AuthModule } from './auth.module';
import { ConfigurationService } from './config/config.service';
import {
  StsConfigHttpLoader,
  StsConfigLoader,
  StsConfigStaticLoader,
} from './config/loader/config-loader';
import { mockProvider } from './testing/mock';

describe('AuthModule', () => {
  describe('APP_CONFIG', () => {
    let authModule: AuthModule;
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [AuthModule.forRoot({ config: { authority: 'something' } })],
        providers: [mockProvider(ConfigurationService)],
      }).compileComponents();
      authModule = TestBed.getImportByType(AuthModule);
    });

    it('should create', () => {
      expect(AuthModule).toBeDefined();
      expect(authModule).toBeDefined();
    });

    it('should provide config', () => {
      const config = authModule.get(PASSED_CONFIG);

      expect(config).toEqual({ config: { authority: 'something' } });
    });

    it('should create StsConfigStaticLoader if config is passed', () => {
      const configLoader = authModule.get(StsConfigLoader);

      expect(configLoader instanceof StsConfigStaticLoader).toBe(true);
    });
  });

  describe('StsConfigHttpLoader', () => {
    let authModule: AuthModule;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          AuthModule.forRoot({
            loader: {
              provide: StsConfigLoader,
              useFactory: () => new StsConfigHttpLoader(of({})),
            },
          }),
        ],
        providers: [mockProvider(ConfigurationService)],
      }).compileComponents();
      authModule = TestBed.getImportByType(AuthModule);
    });

    it('should create StsConfigStaticLoader if config is passed', () => {
      const configLoader = authModule.get(StsConfigLoader);

      expect(configLoader instanceof StsConfigHttpLoader).toBe(true);
    });
  });
});
