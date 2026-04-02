tinymce.PluginManager.add('customautocomplete', function (editor) {

    const options = editor.options.get('customautocomplete') || {};

    editor.ui.registry.addAutocompleter('customautocomplete', {
        trigger: options.trigger || '@',
        minChars: options.minChars || 1,

        fetch: (pattern) => {
            debugger;
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

    return {
        getMetadata: function () {
            return {
                name: 'Custom Autocomplete (TinyMCE 8)',
                url: ''
            };
        }
    };
});