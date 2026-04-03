tinymce.PluginManager.add('customautocomplete', function (editor) {

    const options = editor.getParam('customautocomplete') || {};

    editor.ui.registry.addAutocompleter('customautocomplete_provider', {
        trigger: options.trigger || '@',
        minChars: options.minChars || 0,

        fetch: (pattern) => {
            const src = options.source;

            const promise = typeof src === 'function'
                ? src(pattern)
                : Promise.resolve(src || []);

            return promise.then(items => {
                return items.map(item => ({
                    value: item[options.insertFrom || 'text'],
                    text: item[options.queryBy || 'text']
                }));
            });
        },

        onAction: (api, rng, value) => {
            editor.selection.setRng(rng);
            editor.insertContent(value + ' ');
            api.hide();
        }
    });

    function triggerAutocompleter(editor, char = null) {
        char = options.trigger || '@';
        editor.focus();
        // 1. Вставляем триггер в текущую позицию курсора
        editor.execCommand('mceInsertContent', false, char);

        // 2. Генерируем событие клавиатуры (input), чтобы редактор считал триггер
        const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: char
        });

        editor.getBody().dispatchEvent(inputEvent);
    }

    editor.on('keydown', (e) => {
        if (e.ctrlKey && e.key === ' ') {
            e.preventDefault();
            triggerAutocompleter(editor, '@');
        }
    });

    return {
        getMetadata: function () {
            return {
                name: 'Custom Autocomplete (TinyMCE 8)',
                url: ''
            };
        }
    };
});