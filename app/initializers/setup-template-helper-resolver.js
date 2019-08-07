
export default {
  name: 'setup-template-helper-resolver',
  initialize: function initialize(application) {
    let resolver = application.__registry__.resolver._fallback || application.__registry__.resolver;
    const resolveHelper = resolver.resolveHelper;
    resolver.resolveHelper = function(parsedName) {
      if (resolveHelper) {
        const resolved = resolveHelper.call(this, parsedName);
        if (this._moduleRegistry.has(resolved)) {
          const exp = this._extractDefaultExport(resolved, parsedName);
          return exp.helper || exp;
        }
      }
      let prefix = this.namespace.podModulePrefix;
      let fullNameWithoutType = parsedName.fullNameWithoutType;

      let normalizedModuleName = prefix + '/' + fullNameWithoutType;
      if (this._moduleRegistry.has(normalizedModuleName)) {
        const exp = this._extractDefaultExport(normalizedModuleName, parsedName);
        return exp.helper || exp;
      }

      prefix = this.namespace.modulePrefix;
      normalizedModuleName = prefix + '/' + fullNameWithoutType;
      if (this._moduleRegistry.has(normalizedModuleName)) {
        const exp = this._extractDefaultExport(normalizedModuleName, parsedName);
        return exp.helper || exp;
      }

      if (this._moduleRegistry.has(fullNameWithoutType)) {
        const exp = this._extractDefaultExport(fullNameWithoutType, parsedName);
        return exp.helper || exp;
      }

      return null;
    };
  }
};
