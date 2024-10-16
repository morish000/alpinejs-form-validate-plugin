# Form Validate Plugin for Alpine.js.

[Alpine.js](https://alpinejs.dev/)で`Form Validation`を行うためのプラグインです。\
[HTMX](https://htmx.org/)の[hx-post](https://htmx.org/attributes/hx-post/)と[Validation統合](https://htmx.org/docs/#validation)を使いたかったのですが、HTML5
標準バリデーションを使った便利なユーティリティが見つからなかったため自作しました。

# Key features

- 標準バリデーションエラーのメッセージを変更する
- バリデーションロジックを追加する
- バリデーションの実行タイミングを指定する（`onChange`、`onBlur`、`onInput`）
- バリデーション実行後に成功／失敗のイベントをディスパッチする
- `input`イベントを使用した場合に`debounce`/`throttle`を設定する
- バリデーションロジックを外部定義して再利用できるようにする
- メッセージを外部定義して再利用できるようにする

メッセージの設定は[setCustomValidity](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity)を使用し、できるだけHTML5
標準バリデーション合わせるように作成しています。

**ラジオボタンとチェックボックスについて**：

`FORM`におけるラジオボタンとチェックボックスは扱いが難しい要素ですが、このプラグインでは同一の`name`属性を持つものをまとめて以下のように扱います。

- ラジオボタン: `multiple=false`のSELECTタグと同じ振る舞いをするように扱う
- チェックボックス: `multiple=true`のSELECTタグと同じ振る舞いをするように扱う

つまり、ラジオボタンの値は`string`型であり、チェックボックスの値は`string配列`型として扱います。\
そのため、同一の`name`属性を持つラジオボタン、および、チェックボックスには`validate`ディレクティブをどれか1つの要素のみに書くことを想定しています。\
複数書いた場合の動作は考慮していません。

# CodePenでのサンプル

- [ブラウザのバルーンメッセージでエラー表示（デフォルト）](https://codepen.io/morish000/pen/abemgrr)
- [Bootstrapを使ったエラー表示](https://codepen.io/morish000/pen/eYqgxZq)
- [i18nextでメッセージを国際化する例](https://codepen.io/morish000/pen/rNXjRyw)

# Simple Usage

ESMのみ対応しています。

## インポートマップのサンプル

`ems.sh`からは以下のように取得できます。

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

`jsDelivr`からは以下のように取得できます。

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

## セットアップ

`body`タグの`x-init`は`Alpine.js`の初期化をトリガーするためのものですので、必要なタグに`x-init`か`x-data`が書かれていれば不要です。

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

## メッセージの変更

一度Submitボタンを押すとバリデーションが有効になります。\
`valueMissing`、`tooLong`、`tooShort`などのメッセージキーは[ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)を参照してください。

- `el`はディレクティブが設定されている要素オブジェクトであり、`Alpine.js`によって設定されます。
- `input`タグの`id`と`name`は必須です。同一の値である必要はありません。
- デフォルトは`onChange`イベントでバリデーションが実行されますが、テキストボックス等では`onInput`を`true`にすることで入力時に即時実行できます。

以下のサンプルではメッセージにテンプレートリテラルを使用していますが、これはディレクティブの初期化時に一回だけ評価されます。\
つまり、リアクティブではありません。

**テキストのlengthチェック：**

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

**ラジオボタンの必須チェック：**

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

## バリデーションの追加

- `required`属性が付いていない要素では未入力・未選択の場合は他のバリデーションは動かず、正常終了になります。これはHTML5
  標準バリデーションの動作に従っています。
- バリデーション関数を複数設定している場合、どれか1つがエラーになるとチェックを完了します。表示されるエラーメッセージは1つのみです。

バリデーション関数の第一引数（`el`）はフィールド要素オブジェクトです。\
第二引数（`value`）は以下の定義に従います。

| 要素                     | `value`の内容                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| ラジオボタン             | 同一の`name`属性を持つ、選択されている要素の`value`。（`string`）。                                                             |
| チェックボックス         | 同一の`name`属性を持つ、選択されている要素の`value`の配列（`string配列`。全て未選択の場合は`length=0`の配列）。                 |
| ファイル                 | `multiple`の値に限らず、[File](https://developer.mozilla.org/en-US/docs/Web/API/File)の配列（未選択の場合は`length=0`の配列）。 |
| SELECT（multiple=false） | 選択されている場合はその`value`（`string`）。未選択の場合はHTMLの動作に従い、先頭の`option`タグの`value`（`string`）。          |
| SELECT（multiple=true）  | 選択されている`option`タグの`value`の配列（`string配列`。全て未選択の場合は`length=0`の配列）。                                 |
| その他                   | `el.value`の値（`string`）。未入力の場合は空文字列（`""`）。                                                                    |

関数を直接指定する場合はキー（以下では`validate_1`と書かれている）は何でも構いません。\
配列の0番目がバリデーション関数であり、1番目がメッセージの定義です。

**ファイルサイズチェック（multiple=false）：**

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

**SELECT（multiple=true）- 二個以上選択を必須とする：**

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

**チェックボックスの例 - 二個以上選択を必須とする：**

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

# 設定値

## validate-form：ディレクティブ

**デフォルト値：**

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

| 名前                   | 値                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| report                 | ブラウザの標準メッセージを表示するかどうかを指定します。エラー表示をカスタムで作成する場合は`false`に設定します。 |
| trigger                | バリデーション実行契機となるイベントの設定です。                                                                  |
| trigger.target         | イベント発行元のオブジェクトです。デフォルトはディレクティブを設定した`form`タグです。                            |
| trigger.event          | イベント名です。デフォルトは`form`オブジェクトの`submit`イベントで動作します。                                    |
| trigger.preventDefault | バリデーションエラー時にイベントのデフォルト動作を停止するかどうかを指定します。                                  |
| trigger.before         | バリデーション実行前に実行する関数を指定します。型は`(e?: Event) => void`です。                                   |
| trigger.after          | バリデーション実行後に実行する関数を指定します。型は`(e?: Event) => void`です。                                   |

`form`タグの`x-validate-form`ディレクティブには同じフォーマットで設定することができ、デフォルト値を上書きすることができます。

## validate：ディレクティブ

**デフォルト値：**

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

| 名前                                     | 値                                                                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| v                                        | カスタムバリデーションの定義です。                                                                                    |
| m                                        | HTML5標準バリデーション機能のメッセージを指定します。                                                                 |
| report                                   | ブラウザの標準メッセージを表示するかどうかを指定します。デフォルト値は`false`ですが、`form`の設定が優先されます。     |
| onChange                                 | `change`イベントでの実行を設定します。                                                                                |
| onBlur                                   | `blur`イベントでの実行を設定します。                                                                                  |
| onInput                                  | `input`イベントでの実行を設定します。                                                                                 |
| inputLimit                               | `input`イベントが有効な場合にイベント処理を制限します。                                                               |
| inputLimitOpts                           | `inputLimit`の詳細オプションです。`inputLimit`が設定されている場合のみ使用されます。                                  |
| inputLimitOpts.debounce.wait             | 前のイベントから次のイベントまでに、この時間を経過していない場合は次のイベントを発火させません。ミリ秒。              |
| inputLimitOpts.debounce.immediate        | 最初のイベントを発火させるかどうか。                                                                                  |
| inputLimitOpts.throttle.wait             | イベントが発生してからこの時間が経過するまで次のイベントを発火させません。ミリ秒。                                    |
| inputLimitOpts.throttle.options.leading  | 最初のイベントを発火させるかどうか。                                                                                  |
| inputLimitOpts.throttle.options.trailing | 待機時間中にイベントが発生していた場合に待機時間後にイベントを発火させるかどうか。複数回発生していても最後の1回のみ。 |

`formフィールド`タグの`x-validate`ディレクティブには同じフォーマットで設定することができ、デフォルト値を上書きすることができます。

### v

カスタムバリデーションを追加します。\
一度に実行されるのは1つのバリデーション関数のみです。\
先にHTML5標準バリデーションが動作するため、標準バリデーションが成功した後に動作します。\
また、`required`が指定されていない、かつ、未入力（未選択）の場合はカスタムバリデーションは動作せず、バリデーション成功となります。

省略形として以下の書き方ができます。

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

これらは、正式なフォーマットである以下に変換されます。

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

`v`が関数の場合はキーは意味を持ちません。関数が実行され、エラーの場合は`m`の設定に従ってメッセージが設定されます。\
`v`が配列の場合はキーで登録された関数を実行します。配列は関数へのパラメータとなります。\
デフォルトでは関数は登録されていないため、この機能を有効にするためには設定が必要です。`Validator.js`を使用した例を後に示します。\
登録された関数への第一引数は`value`となるため、`v`の配列には第二引数以降の引数を設定します。\
`m`は`v`の実行結果が`false`である場合に設定するメッセージです。\
デフォルトでは配列の0番目の要素がそのままメッセージになります。\
メッセージリソースを外部定義する場合は、`m`の配列はメッセージ取得関数への引数となります。\
`i18next`を使用してメッセージを外部定義する方法の例を後に示します。

### m

HTML5標準バリデーションのメッセージを設定します。\
省略系として以下の書き方ができます。

```javascript
{
  valueMissing: arg,
  typeMismatch: [...args]
}
```

これらは、正式なフォーマットである以下に変換されます。

```javascript
{
  valueMissing: [arg],
  typeMismatch: [...args],
}
```

キーには以下が使用できます。[ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)を参照してください。

- valueMissing
- typeMismatch
- patternMismatch
- tooLong
- tooShort
- rangeUnderflow
- rangeOverflow
- stepMismatch
- badInput

ここで指定される配列は`v.m`の配列と同じ意味を持ちます。\
つまり、デフォルトでは配列の0番目の要素がそのままメッセージとして設定されます。\
メッセージリソースを外部定義する場合は、`m`の配列はメッセージ取得関数への引数となります。\
`i18next`を使用してメッセージを外部定義する方法の例を後に示します。

### onChange、onBlur、onInput

これらの値は通常は`boolean`値ですが、`form`と同様にバリデーション実行前後の関数を設定することができます。\
オブジェクトが設定されている場合は`true`とみなされます。

**例：**

```javascript
onChange = {
  before: (e?: Event) => {
    // バリデーション前の処理
  },
  after: (e?: Event) => {
    // バリデーション後の処理
  }
}
```

### inputLimit

インプットイベントの実行制御を行います。\
`debounce`、`throttle`が指定でき、動作は一般的なものです。\
`inputLimit`の型定義は以下です。

```typescript
type InputLimit =
  | "none"
  | "debounce"
  | "throttle"
  | `debounce:${number}`
  | `throttle:${number}`;
```

`${number}`は`wait`値であり、ここで指定したものが最優先で使用されます。

## validate-message-for：ディレクティブ

バリデーションメッセージを要素の`textContent`に出力するためのディレクティブです。

**例：**

```html
<p x-validate-message-for="#sample"></p>
```

属性値は対象の`formフィールド`要素の検索パラメータです。\
見つかった`formフィールド`がバリデーションエラーの場合、ディレクティブを指定した要素（上の例では`p`タグ）の`textContent`にメッセージを設定します。\
属性値には[document.querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)へのパラメータを設定します。\
複数マッチする場合は最初の要素のエラーメッセージを表示します。\
見つからない場合は何もしません。通常は`id`検索になるはずです。

このディレクティブにはタグの表示・非表示制御を行う機能はありませんので、他の方法と組み合わせる必要があるかもしれません。\
`Bootstrap`を使用した例を後に示します。

## デフォルト値の変更

プラグインの初期化時にデフォルト値を上書きすることができます。

**デフォルト値を使用：**

```javascript
import { createValidatePluginDefault } from '・・・';

・・・

Alpine.plugin(createValidatePluginDefault);
```

**デフォルト値を上書き：**

```javascript
import { createValidatePlugin } from '・・・';

・・・

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

上書きしたい項目のみを指定できますが、ツリー構造には従う必要があります。\
通常の優先順位は以下となります。

- `タグのディレクティブに指定した値` > `初期化時に指定した値` > `デフォルト値`

ですが、フィールド要素の`report`値のみ以下の優先順位となります。

- `フィールドタグのディレクティブに指定した値` > `フォームタグの決定値` >
  `初期化時に指定した値` > `デフォルト値`

つまり、フィールドタグの`report`の`デフォルト値`や`初期化時の上書き値`は通常使われることはありません。

# イベント

`form`タグ、および、`formフィールド`タグではバリデーションの実行結果を`CustomEvent`で`dispatch`します。

**成功時：**\
イベント名：`x-validate:success`

**エラー時：**\
イベント名：`x-validate:failed`

`Alpine.js`のプレフィックスが変更されている場合はイベント名の`x-`も変わります。

# i18next（オプション）

メッセージリソースとして[i18next](https://www.i18next.com/)を使うオプションがあります。\
ここでは`i18next`を使うためのセットアップと例を示します。\
実際にバリデーションする方法は後に示します。

## セットアップ

`i18next`のセットアップ詳細については`i18next`のドキュメントを参照してください。\
ここでは`i18nextHttpBackend`を使用してサーバからメッセージリソースを取得します。\
サーバに以下のパスでメッセージリソースファイルが配置されていることを前提とします。

- `/locales/validate/en.json`：
  ```json
  {
    "greeting": "Hello, {{name}}!"
  }
  ```
- `/locales/validate/ja.json`：
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
          "i18next": "https://esm.sh/i18next@23.x",
          "i18next-http-backend": "https://esm.sh/i18next-http-backend@2.x",
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

この例では`script`タグで初期化するために`DOMContentLoaded`イベントハンドラ内で実行しています。\
バンドルする場合は[script defer](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#defer)でロードするのが良いでしょう。その場合は`DOMContentLoaded`イベントハンドラに設定する必要が無くなります。

リアクティブにするために、`Alpine.reactive`を使用していますが、`Alpine.store`を使用することもできます。

```javascript
Alpine.store("i18next", {
  timestamp: Date.now(),
  i18next: () => i18next,
});
const i18nStore = Alpine.store("i18next");
```

## t：マジック関数

`i18next`の[t](https://www.i18next.com/overview/api#t)関数で取得した値をそのまま返却します。\
このユーティリティではサニタイズ処理は行っていません。\
必要に応じて出力時にはサニタイズを行うようにしてください。

**例：**

```html
<p x-text="$t('greeting', { name: 'morish000'})"></p>
```

## i18next-text：ディレクティブ

`i18next`の`t`関数で取得した文字列を`textContent`に設定します。

**例：**

```html
<p x-i18next-text="['greeting', { name: 'morish000'}]"></p>
```

## i18next：マジック関数

`i18next`オブジェクトを取得します。ロケールの変更やリロードを行いたい場合に使用します。

**例：**

```html
<button @click="$i18next().changeLanguage('en')">English</button>
<button @click="$i18next().changeLanguage('ja')">Japanese</button>
<button @click="$i18next().reloadResources()">Reload</button>
```

`t`マジック関数と`i18next-text`ディレクティブは`changeLanguage`、`reloadResources`リアクティブに動作します。

# Use Bootstrap to Display Error Messages

バリデーションメッセージの出力に[Bootstrap](https://getbootstrap.com/)を使用するサンプルです。

**例：**

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

- `link`タグで`Bootstrap`をダウンロードします。
- `x-validate-form`で`report=false`を設定し、標準のバルーンメッセージを出さないようにします。
- `@x-validate:success`、`@x-validate:failed`で`was-validated`クラスの追加、削除をします。
- `form-group`クラスの`div`タグで各フィールドを囲み、`x-validate-message-for`でメッセージを出力します。メッセージ出力用の`p`タグには`invalid-feedback`クラスを設定します。
- `x-cloak`については[Alpine.jsのマニュアル](https://alpinejs.dev/directives/cloak)を参照ください。
- `was-validated`、`invalid-feedback`クラスについては[Bootstrap](https://getbootstrap.com/docs/5.1/forms/validation/)のマニュアルを参照ください。

# Use Validator.js and Custom Function for Validation Functions

カスタムバリデーション関数に[Validator.js](https://github.com/validatorjs/validator.js)を使用するサンプルです。\
関数名をキーとして実行しますので、第一引数に検証値を取り、戻り値が`boolean`であれば独自実装のものも使えます。

以下の例では`Validator.js`の`contains`関数と`isUppercase`を実行しています。\
`contains`関数には第二引数、第三引数に渡す値を`v`に設定しています。\
`isUppercase`関数には検証値以外のパラメータを設定していないため、`v`は未設定です。

また、独自実装の関数として、ファイルサイズチェックを行う関数を追加しています。

初期化時に`createValidatePlugin`関数の引数で指定します。

**例：**

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

メッセージリソースに`i18next`を使用するサンプルです。

- `/locales/validate/en.json`：
  ```json
  {
    "moreThanChars": "Please enter at least {{ count }} characters.",
    "required": "This value is required. {{ name }}"
  }
  ```
- `/locales/validate/ja.json`：
  ```json
  {
    "moreThanChars": "{{ count }} 文字以上で入力してください。",
    "required": "この値は必須です。{{ name }}"
  }
  ```

**例：**

```html
<html>
  <head>
    <script type="importmap">
      {
        "imports": {
          "alpinejs": "https://esm.sh/alpinejs@3.14.x",
          "i18next": "https://esm.sh/i18next@23.x",
          "i18next-http-backend": "https://esm.sh/i18next-http-backend@2.x",
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
              messageResolver: createI18NextMessageResolver(i18nStore)(Alpine),
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

i18nextの設定は上の説明と同じです。\
バリデーションで使用するためには、`createValidatePlugin`のパラメータとして`messageResolver`を設定します。\
ディレクティブで`m`に設定する配列は[i18next.t関数](https://www.i18next.com/overview/api#t)への引数です。0番目の要素がキー、2番目の要素が`options`の相当します。

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
