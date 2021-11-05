'use strict';

const metaImportUrlRegex = /import\.meta\.url/g;

exports.afterProcess = function afterProcess(
  /**
   * @type {[fileContent: string, filePath: string, jestConfig: unknown, transformOptions: unknown]}
   */
  [],
  /**
   * @type {string}
   */
  result
) {
  return result.replace(metaImportUrlRegex, 'new URL("file:" + __filename)');
};
