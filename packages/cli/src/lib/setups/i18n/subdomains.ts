import {getCodeFormatOptions} from '../../format-code.js';
import {replaceRemixEnv, replaceServerI18n} from './replacers.js';
import type {SetupConfig} from './index.js';

export async function setupI18nSubdomains(options: SetupConfig) {
  const workPromise = getCodeFormatOptions(options.rootDirectory).then(
    (formatConfig) =>
      replaceServerI18n(
        options,
        formatConfig,
        getSubdomainLocaleExtractorFunction,
      ).then(() => replaceRemixEnv(options, formatConfig)),
  );

  return {workPromise};
}

export function getSubdomainLocaleExtractorFunction(
  isTs: boolean,
  typeName: string,
) {
  let serializedFn = extractLocale.toString();
  if (process.env.NODE_ENV !== 'test') {
    serializedFn = serializedFn.replaceAll('//!', '');
  }

  const returnType = `{language: LanguageCode; country: CountryCode}`;

  return isTs
    ? `export type ${typeName} = ${returnType};\n\n` +
        serializedFn
          .replace(')', `: string): ${typeName}`)
          .replace('defaultLocale', `$&: ${returnType}`)
          .replace(
            /supportedLocales[^}]+\}/,
            `$& as Record<CountryCode, LanguageCode>`,
          )
          .replace('.toUpperCase()', '$& as keyof typeof supportedLocales')
    : serializedFn;
}

export function extractLocale(requestUrl: string) {
  const defaultLocale = {language: 'EN', country: 'US'} as const;
  const supportedLocales = {
    ES: 'ES',
    FR: 'FR',
    DE: 'DE',
    JP: 'JA',
  } as const;

  //!
  const url = new URL(requestUrl);
  const firstSubdomain = url.hostname
    .split('.')[0]
    ?.toUpperCase() as keyof typeof supportedLocales;

  //!
  return supportedLocales[firstSubdomain]
    ? {language: supportedLocales[firstSubdomain], country: firstSubdomain}
    : defaultLocale;
}