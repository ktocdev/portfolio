/* Loaded with --import before the tests: Node runs the .ts sources directly
   (built-in type stripping), and this hook supplies the two things the
   bundler normally does — the @/ alias and extensionless imports. */
import { register } from 'node:module';

register('./resolve.mjs', import.meta.url);
