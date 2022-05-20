'use strict';

const metaImportUrlRegex = /import\.meta\.url/g;

const depsFileRegex = /\.\/deps\.js/g;

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
      .replace(metaImportUrlRegex, 'new URL("file:" + __filename)')
      .replace(depsFileRegex, './deps'),
  };
};
