> This document was originally written in Japanese, and the English version is
> machine translated. For the original, please refer to
> [README_ja.md](README_ja.md).

# Form Validate Plugin for Alpine.js

This is a plugin for performing `form validation` with
[Alpine.js](https://alpinejs.dev/).\
I wanted to use [hx-post](https://htmx.org/attributes/hx-post/) and
[Validation Integration](https://htmx.org/docs/#validation) in
[HTMX](https://htmx.org/), but I couldn't find convenient utilities using HTML5
form validation, so I created one myself.

# Key Features

- Change default validation error messages
- Add validation logic
- Specify validation execution timing (`onChange`, `onBlur`, `onInput`)
- Dispatch success/failure events after validation
- Set `debounce`/`throttle` for `input` events
- Define validation logic externally for reuse
- Define messages externally for reuse

Messages are set using
[setCustomValidity](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity)
to conform as much as possible to HTML5 standard validation.

**Regarding Radio Buttons and Checkboxes:**

Radio buttons and checkboxes are tricky elements within `FORM`, but this plugin
treats those with the same `name` attribute collectively as follows:

- Radio Buttons: Treated as SELECT tags with `multiple=false`
- Checkboxes: Treated as SELECT tags with `multiple=true`

Thus, the value of radio buttons is handled as a `string`, and the value of
checkboxes as a `string array`.\
Therefore, it is expected that the `validate` directive is written only to one
element among radio buttons or checkboxes with the same `name` attribute.\
The behavior when written to multiple elements is not considered.

# Sample on CodePen

- [Display Errors with Browser Balloon Message (Default)](https://codepen.io/morish000/pen/abemgrr)
- [Display Errors Using Bootstrap](https://codepen.io/morish000/pen/eYqgxZq)
- [Example of Internationalizing Messages with i18next](https://codepen.io/morish000/pen/rNXjRyw)

# Simple Usage

Only supports ESM.

## Import Map Sample

You can obtain it from `esm.sh` as follows:

```html
<script type="importmap">
  {
    "imports": {
      "@morish000/alpinejs_form_validate_plugin": "https://esm.sh/jsr/@morish000/alpinejs-form-validate-plugin",
      "@morish000/alpinejs_form_validate_plugin/plugin": "https://esm.sh/jsr/@morish000/alpinejs-form-validate-plugin/plugin",
      "@morish000/alpinejs_form_validate_plugin/functions": "https://esm.sh/jsr/@morish000/alpinejs-form-validate-plugin/functions",
      "@morish000/alpinejs_form_validate_plugin/i18next/alpinejs_i18next_plugin": "https://esm.sh/jsr/@morish000/alpinejs-form-validate-plugin/i18next/alpinejs_i18next_plugin",
      "@morish000/alpinejs_form_validate_plugin/i18next/i18next_message_resolver": "https://esm.sh/jsr/@morish000/alpinejs-form-validate-plugin/i18next/i18next_message_resolver"
    }
  }
</script>
```

You can obtain it from `jsDelivr` as follows:

```html
<script type="importmap">
  {
    "imports": {
      "@morish000/alpinejs_form_validate_plugin": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/mod.mjs",
      "@morish000/alpinejs_form_validate_plugin/plugin": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/alpinejs_form_validate_plugin.mjs",
      "@morish000/alpinejs_form_validate_plugin/functions": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/functions/index.mjs",
      "@morish000/alpinejs_form_validate_plugin/i18next/alpinejs_i18next_plugin": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/i18next/alpinejs_i18next_plugin.mjs",
      "@morish000/alpinejs_form_validate_plugin/i18next/i18next_message_resolver": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/i18next/i18next_message_resolver.mjs"
    }
  }
</script>
```

## Setup

`x-init` triggers the initialization of `Alpine.js`, so it's unnecessary if
`x-init` or `x-data` is already present on necessary tags.

```html
<html>
  <head>
    <script type="importmap">
      {
        "imports": {
          "alpinejs": "https://esm.sh/alpinejs@3.14.x",
          "@morish000/alpinejs_form_validate_plugin": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/alpinejs_form_validate_plugin.mjs"
        }
      }
    </script>
    <script type="module">
      import Alpine from "alpinejs";
      import { createValidatePluginDefault } from "@morish000/alpinejs_form_validate_plugin";
      document.addEventListener("DOMContentLoaded", () => {
        Alpine.plugin(createValidatePluginDefault);
        Alpine.start();
      });
    </script>
  </head>

  <body id="body-1" x-init></body>
</html>
```

## Changing Messages

Validation becomes active after pressing the submit button once.\
Refer to
[ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)
for keys such as `valueMissing`, `tooLong`, `tooShort`.

- `el` is the element object where the directive is set, and is set by
  `Alpine.js`.
- `id` and `name` of the `input` tag are mandatory. They don't need to be the
  same.
- By default, validation is executed with the `onChange` event, but for text
  boxes, it can be executed immediately on input by setting `onInput` to `true`.

In the sample below, template literals are used for messages, but they are
evaluated only once during directive initialization. This means they are not
reactive.

**Text Length Check:**

```html
<form x-validate-form autocomplete="off" novalidate>
  <input
    id="text-1"
    name="text-1"
    type="text"
    required
    minlength="2"
    x-validate="{
      onInput: true,
      m: {
        valueMissing: `${$el.name} is required`,
        tooShort: `Please enter at least ${$el.minLength} characters`
      }
    }"
  />
  <input type="submit" value="Submit" />
</form>
```

**Required Check for Radio Buttons:**

```html
<form x-validate-form autocomplete="off" novalidate>
  <input
    id="radio-1"
    name="radio-1"
    type="radio"
    value="radio-1"
    required
    x-validate="{
      m: {
        valueMissing: `${$el.name} is required`,
      }
    }"
  />
  <input id="radio-2" name="radio-1" type="radio" value="radio-2" />
  <input type="submit" value="Submit" />
</form>
```

## Adding Validation

- For elements without the `required` attribute, if not entered or selected,
  other validations do not run, and it ends successfully. This follows the
  behavior of HTML5 standard validation.
- When multiple validation functions are set, validation completes if one of
  them results in an error. Only one error message is displayed.

The first argument of the validation function (`el`) is the field element
object.\
The second argument (`value`) follows the definitions below.

| Element                 | Contents of `value`                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Radio Buttons           | `Value` of the selected element with the same `name` attribute (`string`).                                                       |
| Checkboxes              | Array of `values` of selected elements with the same `name` attribute (`string array`; if none selected, array with `length=0`). |
| File                    | Array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File) regardless of `multiple` (if none selected, `length=0`).  |
| SELECT (multiple=false) | `Value` if selected (`string`). If not selected, the `value` of the first `option` tag following HTML behavior (`string`).       |
| SELECT (multiple=true)  | Array of `values` of selected `option` tags (`string array`; if none selected, array with `length=0`).                           |
| Other                   | The value of `el.value` (`string`). If not entered, an empty string (`""`).                                                      |

When a function is specified directly, the key (written below as `validate_1`)
can be any name.\
The 0th element of the array is the validation function, and the 1st is the
message definition.

**File Size Check (multiple=false):**

```html
<form x-validate-form autocomplete="off" novalidate>
  <input
    id="file-1"
    name="file-1"
    type="file"
    x-validate="{
      v: {
        validate_1: [(el, value) => value.length == 1 && value[0].size < 256, 'Please select a file smaller than 256 bytes'],
      },
    }"
  />
  <input type="submit" value="Submit" />
</form>
```

**SELECT (multiple=true) - Require more than two selections:**

```html
<form x-validate-form autocomplete="off" novalidate>
  <select
    id="select-1"
    name="select-1"
    multiple
    required
    x-validate="{
      v: {
        validate: [(el, value) => value.length > 1, 'Please select at least two options'],
      },
      m: {
        valueMissing: 'Please select at least two options'
      }
    }"
  >
    <option value="check-1">Option 1</option>
    <option value="check-2">Option 2</option>
    <option value="check-3">Option 3</option>
  </select>
  <input type="submit" value="Submit" />
</form>
```

**Checkbox Example - Require more than two selections:**

```html
<form x-validate-form autocomplete="off" novalidate>
  <input
    id="check-1"
    name="check-1"
    value="check-1"
    type="checkbox"
    required
    x-validate="{
      v: {
        validate: [(el, value) => value.length > 1, 'Please select at least two options'],
      },
      m: {
        valueMissing: 'Please select at least two options'
      }
    }"
  />
  <input id="check-2" name="check-1" value="check-2" type="checkbox" />
  <input type="submit" value="Submit" />
</form>
```

# Configuration Values

## validate-form: Directive

**Default Values:**

```javascript
{
  report: true,
  trigger: {
    target: el,
    event: "submit",
    preventDefault: true,
    before: null,
    after: null,
  },
}
```

| Name                   | Value                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| report                 | Specifies whether to display the browser's default message. Set to `false` to create a custom error display. |
| trigger                | Settings for events that trigger validation execution.                                                       |
| trigger.target         | The object from which the event is issued. By default, it is the `form` tag where the directive is set.      |
| trigger.event          | Event name. By default, it operates with the `submit` event of the form object.                              |
| trigger.preventDefault | Specifies whether to stop the default action when there is a validation error.                               |
| trigger.before         | Function to execute before validation. Type is `(e?: Event) => void`.                                        |
| trigger.after          | Function to execute after validation. Type is `(e?: Event) => void`.                                         |

You can set the `x-validate-form` directive of the `form` tag in the same format
and overwrite the default values.

## validate: Directive

**Default Values:**

```javascript
{
  v: {},
  m: {},
  report: false,
  onChange: true,
  onBlur: false,
  onInput: false,
  inputLimit: "none",
  inputLimitOpts: {
    debounce: { wait: 250, immediate: false },
    throttle: {
      wait: 500,
      options: { leading: false, trailing: true },
    },
  },
}
```

| Name                                     | Value                                                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| v                                        | Custom validation definitions.                                                                                                        |
| m                                        | Specify messages for HTML5 standard validation features.                                                                              |
| report                                   | Specify whether to show the browser's default message. The default value is `false`, but the `form` setting takes precedence.         |
| onChange                                 | Set for execution with the `change` event.                                                                                            |
| onBlur                                   | Set for execution with the `blur` event.                                                                                              |
| onInput                                  | Set for execution with the `input` event.                                                                                             |
| inputLimit                               | Restrict event processing when the `input` event is enabled.                                                                          |
| inputLimitOpts                           | Detailed options for `inputLimit`. Used only if `inputLimit` is set.                                                                  |
| inputLimitOpts.debounce.wait             | Do not fire the next event if this time has not elapsed between the previous and the next event. Milliseconds.                        |
| inputLimitOpts.debounce.immediate        | Whether to fire the first event.                                                                                                      |
| inputLimitOpts.throttle.wait             | Do not fire the next event until this time has elapsed after the event. Milliseconds.                                                 |
| inputLimitOpts.throttle.options.leading  | Whether to fire the first event.                                                                                                      |
| inputLimitOpts.throttle.options.trailing | Whether to fire an event after the waiting time if an event occurred during the waiting time. Fires only once even if multiple occur. |

You can set the `x-validate` directive of the `form field` tag in the same
format and overwrite the default values.

### v

Add custom validation.\
Only one validation function is executed at a time.\
HTML5 standard validation operates first, so it works after the standard
validation succeeds.\
Also, if `required` is not specified and not entered (not selected), custom
validation does not operate, and validation succeeds.

You can abbreviate the following format:

```javascript
{
  key1: [(el, value) => boolean, arg],
  key2: [(el, value) => boolean, [...args]],
  key3: {
    v: (el, value) => boolean,
    m: arg
  },
  key4: arg,
  key5: [...args],
  key6: {
    v: arg,
    m: arg
  },
}
```

These convert to the following formal format:

```javascript
{
  key1: {
    v: (el, value) => boolean,
    m: [arg]
  },
  key2: {
    v: (el, value) => boolean,
    m: [...args]
  },
  key3: {
    v: (el, value) => boolean,
    m: [arg]
  },
  key4: {
    v: [],
    m: [arg],
  },
  key5: {
    v: [],
    m: [...args],
  },
  key6: {
    v: [arg],
    m: [arg]
  },
}
```

If `v` is a function, the key is meaningless. The function is executed, and if
there is an error, a message is set according to the settings of `m`.\
If `v` is an array, the function registered with the key is executed. The array
becomes a parameter to the function.\
By default, no functions are registered, so setting is required to enable this
feature. An example using `Validator.js` is shown later.\
The first argument to the registered function is `value`, so the second and
subsequent arguments to the `v` array are set.\
`m` is the message set if the execution result of `v` is false.\
By default, the 0th element of the array becomes the message as it is.\
If defining message resources externally, the `m` array becomes an argument to
the message retrieval function.\
Examples of how to use `i18next` to define messages externally are shown later.

### m

Set messages for HTML5 standard validation.\
You can abbreviate the following format:

```javascript
{
  valueMissing: arg,
  typeMismatch: [...args]
}
```

These convert to the following formal format:

```javascript
{
  valueMissing: [arg],
  typeMismatch: [...args],
}
```

You can use the following keys: Refer to
[ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState).

- valueMissing
- typeMismatch
- patternMismatch
- tooLong
- tooShort
- rangeUnderflow
- rangeOverflow
- stepMismatch
- badInput

The array specified here has the same meaning as the `v.m` array.\
That is, by default, the 0th element of the array becomes the message as it is.\
If defining message resources externally, the `m` array becomes an argument to
the message retrieval function.\
Examples of how to use `i18next` to define messages externally are shown later.

### onChange, onBlur, onInput

These values are usually `boolean` values, but like `form`, you can set
functions before and after validation execution.\
An object set is regarded as `true`.

**Example:**

```javascript
onChange = {
  before: (e?: Event) => {
    // Processing before validation
  },
  after: (e?: Event) => {
    // Processing after validation
  }
}
```

### inputLimit

Controls the execution of input events.\
You can specify `debounce`, `throttle`, and their behavior is general.\
The type definition of `inputLimit` is as follows.

```typescript
type InputLimit =
  | "none"
  | "debounce"
  | "throttle"
  | `debounce:${number}`
  | `throttle:${number}`;
```

`${number}` is the `wait` value, and those specified here will be used with the
highest priority.

## validate-message-for: Directive

Directive for outputting validation messages to the `textContent` of an element.

**Example:**

```html
<p x-validate-message-for="#sample"></p>
```

The attribute value is the search parameter for the target `form field`
element.\
If the found `form field` has a validation error, the message is set to the
element specified with the directive (in the example above, the `p` tag)
`textContent`.\
Set parameters to
[document.querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)
for the attribute value.\
If multiple matches occur, the error message of the first element is displayed.\
If not found, nothing is done. Typically, it should be an `id` search.

This directive does not have a feature to control the display and hide of tags,
so it may be necessary to combine with other methods.\
An example using `Bootstrap` is shown later.

## Changing Default Values

You can overwrite the default values during plugin initialization.

**Using Default Values:**

```javascript
import { createValidatePluginDefault } from '...';

...

Alpine.plugin(createValidatePluginDefault);
```

**Overwriting Default Values:**

```javascript
import { createValidatePlugin } from '...';

...

Alpine.plugin(createValidatePlugin({
  defaultFormOptions: {
    report: ...,
    trigger: {
      target: ...,
    }
  },
  defaultFieldOptions: {
    v: ...,
    inputLimitOpts: {
      throttle: {
        wait: ...,
      }
    }
  }
}));
```

Specify only the items you want to overwrite, but you must follow the tree
structure.\
The usual priority is as follows:

- `Values specified in the directive of the tag` >
  `Values specified at initialization` > `Default values`

However, only the `report` value of the field element has the priority below.

- `Values specified in the directive of the field tag` >
  `Determined value of the form tag` > `Values overwritten at initialization` >
  `Default values`

Therefore, the `report` `default value` or `overwritten value at initialization`
of the field tag is usually not used.

# Events

In the `form` tag and the `form field` tag, the execution result of validation
is `dispatched` as a `CustomEvent`.

**On Success:**\
Event Name: `x-validate:success`

**On Error:**\
Event Name: `x-validate:failed`

If the prefix of `Alpine.js` is changed, the `x-` in the event name will also
change.

# i18next (Optional)

There is an option to use [i18next](https://www.i18next.com/) as a message
resource.\
Here, setup and examples for using `i18next` are shown.\
How to actually validate is shown later.

## Setup

Refer to the `i18next` documentation for details on the `i18next` setup.\
Here, we will use `i18nextHttpBackend` to get message resources from the
server.\
Assuming message resource files are placed on the server at the following paths:

- `/locales/validate/en.json`:
  ```json
  {
    "greeting": "Hello, {{name}}!"
  }
  ```
- `/locales/validate/ja.json`:
  ```json
  {
    "greeting": "こんにちは, {{name}}!"
  }
  ```

```html
<html>
  <head>
    <script type="importmap">
      {
        "imports": {
          "alpinejs": "https://esm.sh/alpinejs@3.14.x",
          "i18next": "https://esm.sh/i18next@24.2.x",
          "i18next-http-backend": "https://esm.sh/i18next-http-backend@3.0.x",
          "@morish000/alpinejs_form_validate_plugin/i18next/alpinejs_i18next_plugin": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/i18next/alpinejs_i18next_plugin.mjs"
        }
      }
    </script>
    <script type="module">
      import Alpine from "alpinejs";
      import i18next from "i18next";
      import i18nextHttpBackend from "i18next-http-backend";
      import { createI18NextPlugin } from "@morish000/alpinejs_form_validate_plugin/i18next/alpinejs_i18next_plugin";
      document.addEventListener("DOMContentLoaded", () => {
        i18next.on("initialized", () => {
          const i18nStore = Alpine.reactive(
            {
              timestamp: Date.now(),
              i18next: () => i18next,
            },
          );
          Alpine.plugin(createI18NextPlugin(i18nStore));
          Alpine.start();
        });

        i18next.on("failedLoading", (lng, ns, msg) => {
          console.error(`failedLoading ${lng}, ${ns}, ${msg}`);
        });

        const i18nextOptions = {
          fallbackLng: "en",
          ns: ["validate"],
          defaultNS: "validate",
          preload: ["en", "ja"],
          backend: {
            loadPath: "/locales/{{ns}}/{{lng}}.json",
          },
        };

        i18next
          .use(i18nextHttpBackend)
          .init(i18nextOptions);
      });
    </script>
  </head>

  <body id="body-1" x-init>
    <p x-text="$t('greeting', { name: 'morish000'})"></p>
    <p x-i18next-text="['greeting', { name: 'morish000'}]"></p>
    <button @click="$i18next().changeLanguage('en')">English</button>
    <button @click="$i18next().changeLanguage('ja')">Japanese</button>
    <button @click="$i18next().reloadResources()">Reload</button>
  </body>
</html>
```

In this example, the `DOMContentLoaded` event handler is used to initialize in
the `script` tag.\
When bundling, it's better to load with
[script defer](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#defer).
In that case, it's no longer necessary to set to the `DOMContentLoaded` event
handler.

To make it reactive, `Alpine.reactive` is used, but `Alpine.store` can also be
used.

```javascript
Alpine.store("i18next", {
  timestamp: Date.now(),
  i18next: () => i18next,
});
const i18nStore = Alpine.store("i18next");
```

## t: Magic Function

Returns the value obtained with the [t](https://www.i18next.com/overview/api#t)
function of `i18next` as it is.\
This utility does not perform sanitization processing.\
Sanitization should be performed as needed when outputting.

**Example:**

```html
<p x-text="$t('greeting', { name: 'morish000'})"></p>
```

## i18next-text: Directive

Sets the string obtained with the `t` function of `i18next` to `textContent`.

**Example:**

```html
<p x-i18next-text="['greeting', { name: 'morish000'}]"></p>
```

## i18next: Magic Function

Gets the `i18next` object. Used when you want to change locales or reload.

**Example:**

```html
<button @click="$i18next().changeLanguage('en')">English</button>
<button @click="$i18next().changeLanguage('ja')">Japanese</button>
<button @click="$i18next().reloadResources()">Reload</button>
```

The `t` magic function and the `i18next-text` directive operate reactively with
`changeLanguage` and `reloadResources`.

# Use Bootstrap to Display Error Messages

An example of using [Bootstrap](https://getbootstrap.com/) to output validation
messages.

**Example:**

```html
<html>
  <head>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
    />
    <style>
      [x-cloak] {
        display: none !important;
      }
    </style>
    <script type="importmap">
      {
        "imports": {
          "alpinejs": "https://esm.sh/alpinejs@3.14.x",
          "@morish000/alpinejs_form_validate_plugin": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/alpinejs_form_validate_plugin.mjs"
        }
      }
    </script>
    <script type="module">
      import Alpine from "alpinejs";
      import { createValidatePluginDefault } from "@morish000/alpinejs_form_validate_plugin";
      document.addEventListener("DOMContentLoaded", () => {
        Alpine.plugin(createValidatePluginDefault);
        Alpine.start();
      });
    </script>
  </head>

  <body id="body-1" x-init>
    <div class="container">
      <form
        x-validate-form="{ report: false }"
        @x-validate:success="$el.classList.remove('was-validated');"
        @x-validate:failed="$el.classList.add('was-validated');"
        autocomplete="off"
        novalidate
      >
        <div class="form-group">
          <input
            id="text-1"
            name="text-1"
            type="text"
            required
            minlength="2"
            x-validate="{
          onInput: true,
          m: {
            valueMissing: `${$el.name} is required`,
            tooShort: `Please enter at least ${$el.minLength} characters`
          }
        }"
          />
          <p x-validate-message-for="#text-1" class="invalid-feedback" x-cloak>
          </p>
        </div>
        <div class="form-group">
          <input
            id="check-1"
            name="check-1"
            value="check-1"
            type="checkbox"
            required
            x-validate="{
          v: {
            validate: [(el, value) => value.length > 1, 'Please select at least two options'],
          },
          m: {
            valueMissing: 'Please select at least two options'
          }
        }"
          />
          <input id="check-2" name="check-1" value="check-2" type="checkbox" />
          <p x-validate-message-for="#check-1" class="invalid-feedback" x-cloak>
          </p>
        </div>
        <div class="form-group">
          <input
            id="radio-1"
            name="radio-1"
            value="radio-1"
            type="radio"
            required
            x-validate="{
          m: {
            valueMissing: 'This value is required'
          }
         }"
          />
          <input id="radio-2" name="radio-1" value="radio-2" type="radio" />
          <p x-validate-message-for="#radio-1" class="invalid-feedback" x-cloak>
          </p>
        </div>
        <input type="submit" value="Submit" />
      </form>
    </div>
  </body>
</html>
```

- The `link` tag downloads `Bootstrap`.
- Set `report=false` in `x-validate-form` to prevent the default balloon
  message.
- Use `@x-validate:success` and `@x-validate:failed` to add or remove the
  `was-validated` class.
- Surround each field with a `div` tag of the `form-group` class and output
  messages with `x-validate-message-for`. Set the `invalid-feedback` class on
  the `p` tag for message output.
- For `x-cloak`, refer to
  [Alpine.js Documentation](https://alpinejs.dev/directives/cloak).
- For the `was-validated` and `invalid-feedback` classes, refer to the
  [Bootstrap Manual](https://getbootstrap.com/docs/5.1/forms/validation/).

# Use Validator.js and Custom Function for Validation Functions

An example of using [Validator.js](https://github.com/validatorjs/validator.js)
for custom validation functions.\
Keys execute with the function name, so you can use custom implementations if
the first argument is a check value and the return value is `boolean`.

In the example below, the `contains` and `isUppercase` functions of
`Validator.js` are executed.\
The `v` is set with the second and third arguments to the `contains` function.\
The `isUppercase` function has no parameters set other than the check value, so
`v` is not set.

Additionally, a function for file size checks is added as a custom
implementation by including it as a validation function.

Specify it in the parameter of the `createValidatePlugin` function during
initialization.

**Example:**

```html
<html>
  <head>
    <script type="importmap">
      {
        "imports": {
          "alpinejs": "https://esm.sh/alpinejs@3.14.x",
          "validator": "https://esm.sh/validator@13.12.x",
          "@morish000/alpinejs_form_validate_plugin": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/alpinejs_form_validate_plugin.mjs",
          "@morish000/alpinejs_form_validate_plugin/functions": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/functions/index.mjs"
        }
      }
    </script>
    <script type="module">
      import Alpine from "alpinejs";
      import validator from "validator";
      import { createValidatePlugin } from "@morish000/alpinejs_form_validate_plugin";
      import { createCustomFieldValidator } from "@morish000/alpinejs_form_validate_plugin/functions";

      document.addEventListener("DOMContentLoaded", () => {
        Alpine.plugin(createValidatePlugin({
          defaultFunctionsOptions: {
            customFieldValidators: [
              createCustomFieldValidator(validator),
              createCustomFieldValidator({
                maxFileSize: (value, size) =>
                  value.length == 1 && value[0].size < size,
              }),
            ],
          },
        }));
        Alpine.start();
      });
    </script>
  </head>

  <body id="body-1" x-init>
    <form x-validate-form autocomplete="off" novalidate>
      <input
        id="text-1"
        name="text-1"
        type="text"
        required
        x-validate="{
        onInput: true,
        v: {
          contains: {
            v: ['abc', { ignoreCase: true}],
            m: 'Please include \'abc\'.'
          }
        },
        m: {
          valueMissing: `${$el.name} is required`,
        }
      }"
      />
      <input
        id="text-2"
        name="text-2"
        type="text"
        required
        x-validate="{
        onInput: true,
        v: {
          isUppercase: 'Please enter in uppercase.'
        },
        m: {
          valueMissing: `${$el.name} is required`,
        }
      }"
      />
      <input
        id="file-1"
        name="file-1"
        type="file"
        x-validate="{
        v: {
          maxFileSize: {
            v : 256,
            m : 'Please select a file smaller than 256 bytes'
          }
        }
      }"
      />
      <input type="submit" value="Submit" />
    </form>
  </body>
</html>
```

# Use i18next for Message Resources

An example using `i18next` for message resources.

- `/locales/validate/en.json`:
  ```json
  {
    "moreThanChars": "Please enter at least {{ count }} characters.",
    "required": "This value is required. {{ name }}"
  }
  ```
- `/locales/validate/ja.json`:
  ```json
  {
    "moreThanChars": "{{ count }} 文字以上で入力してください。",
    "required": "この値は必須です。{{ name }}"
  }
  ```

**Example:**

```html
<html>
  <head>
    <script type="importmap">
      {
        "imports": {
          "alpinejs": "https://esm.sh/alpinejs@3.14.x",
          "i18next": "https://esm.sh/i18next@24.2.x",
          "i18next-http-backend": "https://esm.sh/i18next-http-backend@3.0.x",
          "@morish000/alpinejs_form_validate_plugin": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/alpinejs_form_validate_plugin.mjs",
          "@morish000/alpinejs_form_validate_plugin/i18next/alpinejs_i18next_plugin": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/i18next/alpinejs_i18next_plugin.mjs",
          "@morish000/alpinejs_form_validate_plugin/i18next/i18next_message_resolver": "https://cdn.jsdelivr.net/gh/morish000/alpinejs-form-validate-plugin/dist/i18next/i18next_message_resolver.mjs"
        }
      }
    </script>
    <script type="module">
      import Alpine from "alpinejs";
      import i18next from "i18next";
      import i18nextHttpBackend from "i18next-http-backend";
      import { createI18NextPlugin } from "@morish000/alpinejs_form_validate_plugin/i18next/alpinejs_i18next_plugin";
      import { createI18NextMessageResolver } from "@morish000/alpinejs_form_validate_plugin/i18next/i18next_message_resolver";
      import { createValidatePlugin } from "@morish000/alpinejs_form_validate_plugin";
      document.addEventListener("DOMContentLoaded", () => {
        i18next.on("initialized", () => {
          const i18nStore = Alpine.reactive(
            {
              timestamp: Date.now(),
              i18next: () => i18next,
            },
          );
          Alpine.plugin(createI18NextPlugin(i18nStore));
          Alpine.plugin(createValidatePlugin({
            defaultFunctionsOptions: {
              messageResolver: createI18NextMessageResolver(i18nStore)(
                Alpine,
              ),
            },
          }));
          Alpine.start();
        });

        i18next.on("failedLoading", (lng, ns, msg) => {
          console.error(`failedLoading ${lng}, ${ns}, ${msg}`);
        });

        const i18nextOptions = {
          fallbackLng: "en",
          ns: ["validate"],
          defaultNS: "validate",
          preload: ["en", "ja"],
          backend: {
            loadPath: "/locales/{{ns}}/{{lng}}.json",
          },
        };

        i18next
          .use(i18nextHttpBackend)
          .init(i18nextOptions);
      });
    </script>
  </head>

  <body id="body-1" x-init>
    <form x-validate-form autocomplete="off" novalidate>
      <input
        id="text-1"
        name="text-1"
        type="text"
        required
        x-validate="{
        onInput: true,
        v: {
          validate: {
            v: (el, value) => value.length > 1,
            m: ['moreThanChars', { count: 2 }]
          }
        },
        m: {
          valueMissing: ['required', { name: $el.name }],
        }
      }"
      />
      <input type="submit" value="Submit" />
    </form>
    <button @click="$i18next().changeLanguage('en')">English</button>
    <button @click="$i18next().changeLanguage('ja')">Japanese</button>
    <button @click="$i18next().reloadResources()">Reload</button>
  </body>
</html>
```

The i18next setup is the same as described above.\
To use it in validation, set `messageResolver` as a parameter for
`createValidatePlugin`.\
The array set in `m` in the directive is an argument to the
[i18next.t function](https://www.i18next.com/overview/api#t). The 0th element is
the key corresponding to it, and the 2nd element is the `options`.

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
