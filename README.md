ember-template-helper-import
==============================================================================

forked from https://github.com/crashco/ember-template-component-import and changed to allow helper imports
This is to be used alongside https://github.com/crashco/ember-template-component-import

This addon allows you to use import-style syntax to create local bindings to
a helper within a template file.

* More concise helpers invocation while making it explicit where it comes from
* No hyphens needed!
* Relative imports!

* Currently only tested with simple helpers

Installation
------------------------------------------------------------------------------

```
ember install ember-template-helper-import
```


Usage
------------------------------------------------------------------------------

Use the same kind of import syntax you are familiar with from Javascript:

```hbs
{{import myHelper from 'ui/helper'}}

{{myHelper 'a'}}

{{import helper as ashelper from "ui/helpers" }}
{{import a as ahelper from "ui/helpers" }}
{{import "* as helpers" from "u/helpersi" }}
{{import "a, b" from "ui/helpers" }}
{{import "a as x, b as y" from "ui/helpers" }}
{{import "a as z, helper" from "ui/helpers" }}
```

The helper is looked up from the given string using a direct lookup
pattern. I set the `resolveHelper` in the resolver. 
All this addon does is taking that `{{import ...}}` statement
and replacing all helper invocations with `{{ember-template-helper-import/helpers/invoke-helper 'myHelper' ...}}`.

Our helper then looks up the actual helper and calls `compute` with the other arguments

Motivation
------------------------------------------------------------------------------

[ember-template-component-import](https://github.com/crashco/ember-template-component-import)
already gives us import for components, but I really miss the helper imports.
So I went ahead and added this functionality :)


But what about Module Unification?
------------------------------------------------------------------------------

Once Module Unification lands fully, this addon will be largely obsolete. MU
provides all these benefits and more.

So on the one hand, your templates will start to look _something kinda like_
MU a little sooner, which is nice.

But be warned - any official tooling to codemod templates into a new MU world
likely won't support this addon. So weigh the pros and cons carefully before
widely adopting this addon.

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
