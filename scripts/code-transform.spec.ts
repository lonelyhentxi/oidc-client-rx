import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Biome, Distribution } from '@biomejs/js-api';
import { rewriteObservableSubscribeToLastValueFrom } from './code-transform';

describe('writeAllSpecObservableSubscribeToLastValueFrom', () => {
  it('should transform valid string', async () => {
    const actual = await rewriteObservableSubscribeToLastValueFrom(
      'index.ts',
      `refreshSessionIframeService
              .refreshSessionWithIframe(allConfigs[0]!, allConfigs)
              .subscribe((result) => {
                  expect(
                  result
                  ).toHaveBeenCalledExactlyOnceWith(
                  'a-url',
                  allConfigs[0]!,
                  allConfigs
                  );
              });`
    );

    const expect = `const result = await lastValueFrom(refreshSessionIframeService.refreshSessionWithIframe(allConfigs[0]!, allConfigs));
      expect(result).toHaveBeenCalledExactlyOnceWith('a-url',allConfigs[0]!,allConfigs);`;

    const biome = await Biome.create({
      distribution: Distribution.NODE,
    });

    assert.equal(
      biome.formatContent(actual, { filePath: 'index.ts' }).content,
      biome.formatContent(expect, { filePath: 'index.ts' }).content
    );
  });
});
