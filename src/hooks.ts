import * as Glob from 'glob';
import { promisify } from 'util';
import { getDesiredTypesFromFile } from './ts-compiler';
import { unsafe_cast } from './ts-util';

type globFn = (pattern: string) => Promise<string[]>;
const glob: globFn = unsafe_cast<globFn>(promisify(Glob.Glob));

export async function beforeCompileHook() {
  
  const files = await glob('./**/!(*.config).ts');
  console.log(files);
  files.forEach(e => {
    console.log(e)
    getDesiredTypesFromFile(e).then(e => e).catch(err => console.error);

  });
}