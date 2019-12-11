'use strict';

/* eslint-env node */

const assert = require('assert');
const path = require('path');
const BroccoliFilter = require('broccoli-persistent-filter');
const md5Hex = require('md5-hex');

const IMPORT_PATTERN = /\{\{\s*import\s+([a-z][^\s]+)\s+from\s+['"]([^'"]+)['"]\s*\}\}/g;

function isValidVariableName(name) {
  if (!(/^[A-Za-z0-9]+$/.test(name))) {
    return false;
  }
  return true;
}


class TemplateImportProcessor extends BroccoliFilter {

  constructor(inputNode, options = {}) {
    if (!options.hasOwnProperty('persist')) {
      options.persist = true;
    }

    super(inputNode, {
      annotation: options.annotation,
      persist: options.persist
    });

    this.options = options;
    this._console = this.options.console || console;

    this.extensions = [ 'hbs', 'handlebars' ];
    this.targetExtension = 'hbs';
  }

  baseDir() {
    return __dirname;
  }

  cacheKeyProcessString(string, relativePath) {
    return md5Hex([
      'import-helper',
      string,
      relativePath
    ]);
  }

  processString(contents, relativePath) {
    let imports = [];
    let rewrittenContents = contents.replace(IMPORT_PATTERN, (_, localName, importPath) => {
      if (importPath.startsWith('.')) {
        importPath = path.resolve(relativePath, '..', importPath).split(path.sep).join('/');
        importPath = path.relative(this.options.root, importPath).split(path.sep).join('/');
      }
      imports.push({ localName, importPath, isLocalNameValid: isValidVariableName(localName) });
      return '';
    });

    let header = imports.map(({ importPath, localName, isLocalNameValid }) => {
      const warnPrefix = 'ember-template-helper-import: ';
      const abstractWarn = `${warnPrefix} Allowed import variable names - camelCased strings, like: fooBar, tomDale`;
      const helperWarn =  `
        ${warnPrefix}Warning!
        in file: "${relativePath}"
        subject: "${localName}" is not allowed as Variable name for helper import.`;
      const warn = isLocalNameValid ? '' : `
        <pre data-test-name="${localName}">${helperWarn}</pre>
        <pre data-test-global-warn="${localName}">${abstractWarn}</pre>
      `;
      if (!isLocalNameValid) {
        this._console.log(helperWarn);
        if (relativePath !== 'dummy/pods/application/template.hbs') {
          // don't throw on 'dummy/pods/application/template.hbs' (test template)
          throw new Error(helperWarn);
        }
      }
      if (localName[0].toLowerCase() === localName[0]) {
        rewrittenContents = rewrittenContents.replace(new RegExp('{{' + localName + '( |})', "g"), '{{ember-template-helper-import/helpers/invoke-helper this \'' + importPath + '\'$1');
        rewrittenContents = rewrittenContents.replace(new RegExp('\\(' + localName + '( |\\))', "g"), '(ember-template-helper-import/helpers/invoke-helper this \'' + importPath + '\'$1');
      }
      return warn;
    }).join('');

    return header + rewrittenContents;
  }

}

module.exports = {
  name: require('./package').name,

  setupPreprocessorRegistry(type, registry) {
    const podModulePrefix = this.project.config().podModulePrefix;

    assert.notStrictEqual(
      podModulePrefix,
      undefined,
      `${this.name}: 'podModulePrefix' has not been defined in config/environment.js`
    );
    registry.add('template', {
      name: 'ember-template-helper-import',
      ext: 'hbs',
      before: ['ember-template-component-import'],
      toTree: (tree) => {
        let componentsRoot = path.join(this.project.root, podModulePrefix);
        tree = new TemplateImportProcessor(tree, { root: componentsRoot });
        return tree;
      }
    });

    if (type === 'parent') {
      this.parentRegistry = registry;
    }
  },
};
