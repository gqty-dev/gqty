import { writeGenerate } from '@gqty/cli';
import { resolve } from 'path';
import { schema } from './api';

await writeGenerate(schema, resolve(__dirname, './gqty.ts'));
