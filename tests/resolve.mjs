/* Resolve hook for the tests (see register.mjs): maps @/ to src/ as
   tsconfig's paths does, and tries .ts / .tsx for extensionless imports. */
const SRC = new URL('../src/', import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  const target = specifier.startsWith('@/') ? new URL(specifier.slice(2), SRC).href : specifier;
  try {
    return await nextResolve(target, context);
  } catch (error) {
    const relative = target.startsWith('.') || target.startsWith('file:');
    if (error?.code !== 'ERR_MODULE_NOT_FOUND' || !relative || /\.\w+$/.test(target)) throw error;
    for (const ext of ['.ts', '.tsx']) {
      try {
        return await nextResolve(target + ext, context);
      } catch {
        /* Try the next extension. */
      }
    }
    throw error;
  }
}
