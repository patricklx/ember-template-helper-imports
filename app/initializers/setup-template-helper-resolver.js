
export default {
  name: 'setup-template-helper-resolver',
  initialize: function initialize(application) {
    let resolver = application.__registry__.resolver._fallback || application.__registry__.resolver;
    resolver.resolveHelper = function(parsedName) {
      let podPrefix = this.namespace.podModulePrefix || this.namespace.modulePrefix;
      let fullNameWithoutType = parsedName.fullNameWithoutType;

      const normalizedModuleName = podPrefix + '/' + fullNameWithoutType;
      if (this._moduleRegistry.has(normalizedModuleName)) {
        return this._extractDefaultExport(normalizedModuleName, parsedName);
      }

      if (this._moduleRegistry.has(fullNameWithoutType)) {
        return this._extractDefaultExport(fullNameWithoutType, parsedName);
      }

      return null;
    };
  }
};
