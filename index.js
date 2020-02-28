'use strict';

/* eslint-env node */

const path = require('path');
const BroccoliFilter = require('broccoli-persistent-filter');

const IMPORT_PATTERN = /\{\{\s*import\s+([a-z]+[\-,\S*'" ]+)*\s+from\s+['"]([^'"]+)['"]\s*\}\}/g;

function isValidVariableName(name) {
  return /^[A-Za-z0-9.-]+$/.test(name);
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

    this.extensions = ['hbs', 'handlebars'];
    this.targetExtension = 'hbs';
  }

  baseDir() {
    return __dirname;
  }

  processString(contents, relativePath) {
    let imports = [];
    let rewrittenContents = contents.replace(IMPORT_PATTERN, (_, localName, importPath) => {
      if (importPath.endsWith('.scss')) { // .scss or other extensions
        return _;
      }
      if (importPath.startsWith('.')) {
        importPath = path.resolve(relativePath, '..', importPath).split(path.sep).join('/');
        importPath = path.relative(this.options.root, importPath).split(path.sep).join('/');
      }      
      const localNames = localName.replace(/['"]/g, '').split(',');
      localNames.forEach((localName) => {
        localName = localName.trim();
        let importName = localName;
        if (localName.includes(' as ')) {            
          [importName, localName] = localName.split(' as ');
          importName = importName.trim();
          localName = localName.trim();
        }
        if (importName === '*') {
          const name = localName + '\\.([^\\s\\)} |]+)';
          imports.push({ dynamic: true, localName: name, importPath: importPath + '/', isLocalNameValid: isValidVariableName(localName) });
          return;
        }
        imports.push({ localName, importPath: importPath + '/' + importName, isLocalNameValid: isValidVariableName(localName) });
      });
      return '';
    });

    let header = imports.map(({ importPath, localName, isLocalNameValid, dynamic }) => {
      const warnPrefix = 'ember-template-helper-import: ';
      const abstractWarn = `${warnPrefix} Allowed import variable names - camelCased strings, like: fooBar, tomDale`;
      const helperWarn = `
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
        const replaceWith = 'ember-template-helper-import/helpers/invoke-helper this \'' + importPath + (dynamic ? '$1\'$2' : '\'$1');
        rewrittenContents = rewrittenContents.replace(new RegExp('{{' + localName + '( |})', "g"), '{{' + replaceWith);
        rewrittenContents = rewrittenContents.replace(new RegExp('\\(' + localName + '( |\\))', "g"), '(' + replaceWith);
      }
      return warn;
    }).join('');

    return header + rewrittenContents + ' ';
  }

}

module.exports = {
  name: require('./package').name,

  setupPreprocessorRegistry(type, registry) {
    registry.add('template', {
      name: 'ember-template-helper-import',
      ext: 'hbs',
      before: ['ember-template-component-import'],
      toTree: (tree) => {
        tree = new TemplateImportProcessor(tree, { root: this.project.root });
        return tree;
      }
    });

    if (type === 'parent') {
      this.parentRegistry = registry;
    }
  },
};
