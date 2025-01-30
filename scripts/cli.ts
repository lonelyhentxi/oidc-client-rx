#!/usr/bin/env node

import { Command } from 'commander';
import { rewriteAllObservableSubscribeToLastValueFrom } from './code-transform';

const program = new Command();

program
  .version('1.0.0')
  .description('A CLI tool to help develop oidc-client-rx');

program
  .command('rewrite <pattern>')
  .description('Rewrite files matching the given glob pattern')
  .action(async (pattern: string) => {
    await rewriteAllObservableSubscribeToLastValueFrom(pattern);
  });

program.parse(process.argv);
