'use strict';

const metaImportUrlRegex = /import\.meta\.url/g;

const depsFileRegex = /\.\/deps\.js/g;

const lodashEsRegex = /lodash-es/g;

exports.afterProcess = function afterProcess(
  /**
   * @type {[fileContent: string, filePath: string, jestConfig: unknown, transformOptions: unknown]}
   */
  [],
  /**
   * @type {{code: string}}
   */
  result
) {
  return {
    code: result.code
      .replace(lodashEsRegex, 'lodash')
      .replace(metaImportUrlRegex, 'new URL("file:" + __filename)')
      .replace(depsFileRegex, './deps'),
  };
};
