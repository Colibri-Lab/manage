App.Modules.Manage.UI.TinyMCETextArea = class extends Colibri.UI.Forms.TextArea {

    RenderFieldContainer() {
        super.RenderFieldContainer();
        this.AddClass('app-tinymcetextarea-component');

        this._controlElementId = 'html' + Date.Mc();
        this._input.attr('id', this._controlElementId);
        this._filepicker = null;

        this._visualCreated = false;

        this.autocomplete = this._fieldData.autocomplete;

    }
    
    __shownHandler(event, args) {
        this.__initVisual();
    }

    _createSnippetTag(snippet, data, type = 'tag') {
        if (type === 'tag') {
            return Element.create('component', Object.assign({ Component: snippet.name, contentEditable: 'false' }, data, { shown: 'true', style: snippet.options.styles }));
        }
        else {
            let html = ['<component Component="' + snippet.name + '" contentEditable="false" shown="true"'];
            Object.forEach(data, (key, value) => {
                html.push(key + '="' + value + '"');
            });
            html.push('style="' + snippet.options.styles + '"');
            html.push(' />');
            return html.join(' ');
        }
    }

    _createAdditionalSnippetsButtons() {
        return 'add-snippet edit-snippet ' + (this._tools ?? []).map(tool => tool.name).join(' | ');
    }

    _createAdditionalTools() {
        let tools = [];
        tools.push({
            name: "add-snippet",
            icon: false,
            text: "#{manage-components-tinymce-add-snippet}",
            onclick: (e) => {
                const button = e.control;

                const _addSnippet = (button, snippet, data) => {
                    button.settings.editor.selection.setContent(this._createSnippetTag(snippet, data, 'html'));
                    button.settings.editor.nodeChanged();
                    this.Dispatch('Changed');
                }

                Promise.all([
                    Manage.Store.AsyncQuery('manage.modules'),
                    Manage.Store.AsyncQuery('manage.snippets')
                ]).then((responses) => {
                    const modules = responses[0];
                    const phpsnippets = responses[1];

                    const snippets = {};
                    const comboList = [];

                    for (const module of modules) {

                        const snippetsObject = eval('App.Modules.' + module.name + '.Snippets');
                        if (!snippetsObject) {
                            continue;
                        }
                        const snippetsList = Object.keys(snippetsObject);
                        if (snippetsList.length == 0) {
                            continue;
                        }

                        for (const snippet of snippetsList) {
                            const name = 'App.Modules.' + module.name + '.Snippets.' + snippet;
                            const snippetObject = eval(name);
                            snippets[snippet] = { text: snippet, name: name, options: snippetObject.Options(), fields: snippetObject.Params() };
                            comboList.push({ text: snippets[snippet].options?.title ?? snippet, value: snippet });
                        }

                    }

                    Object.forEach(phpsnippets, (module, snippetsList) => {
                        for (const snippet of snippetsList) {
                            snippets[snippet.text] = snippet;
                            comboList.push({ text: snippet.options?.title ?? snippet.text, value: snippet.text });
                        }
                    });

                    button.settings.editor.windowManager.open({
                        title: '#{manage-components-tinymce-choose-snippet}',
                        data: {},
                        body: {
                            name: 'snippet',
                            type: 'listbox',
                            label: '#{manage-components-tinymce-snippet}',
                            values: comboList
                        },
                        onsubmit: (e1) => {
                            const snippet = snippets[e1.data.snippet];
                            const fields = snippet.fields;
                            if (fields.length > 0) {
                                button.settings.editor.windowManager.open({
                                    title: 'Параметры ' + snippet.text,
                                    data: {},
                                    body: fields,
                                    minWidth: button.settings.editor.getParam("code_dialog_width", 600),
                                    onsubmit: (e2) => {
                                        button.settings.editor.focus();
                                        _addSnippet(button, snippet, e2.data);
                                    }
                                });
                            }
                            else {
                                button.settings.editor.focus();
                                _addSnippet(button, snippet, {});
                            }

                        }
                    });

                });

            }
        });

        tools.push({
            name: "edit-snippet",
            icon: false,
            text: "#{manage-components-tinymce-edit-snippet}",
            onclick: (e) => {
                const button = e.control;
                const editor = button.settings.editor;
                const dom = editor.dom;
                const sel = editor.selection;
                const node = sel.getNode();
                if (node.matches('component')) {

                    let attrs = {};
                    for (const attr of node.attributes) {
                        attrs[attr.name] = attr.value;
                    }

                    const snippetName = attrs.component;
                    delete attrs.Component;
                    const snippetParams = attrs;

                    const _updateSnippet = (button, node, snippet, data) => {
                        node.replaceWith(this._createSnippetTag(snippet, data));
                        button.settings.editor.nodeChanged();
                        this.Dispatch('Changed');
                    }


                    let snippetObject = null;
                    try {
                        snippetObject = eval(snippetName);
                    }
                    catch (e) { }

                    let snippet = null;
                    let fields = [];
                    if (snippetObject) {
                        snippet = { text: snippetName, name: snippetName, options: snippetObject.Options(), fields: snippetObject.Params(snippetParams) };
                        fields = snippet.fields;
                        if (fields.length > 0) {
                            button.settings.editor.windowManager.open({
                                title: 'Параметры ' + snippet.text,
                                data: {},
                                body: fields,
                                minWidth: button.settings.editor.getParam("code_dialog_width", 600),
                                onsubmit: (e2) => {
                                    button.settings.editor.focus();
                                    _updateSnippet(button, node, snippet, e2.data);
                                }
                            });
                        }
                        else {
                            button.settings.editor.focus();
                            _updateSnippet(button, node, snippet, e2.data);
                        }
                    }
                    else {
                        Manage.Store.AsyncQuery('manage.snippets').then((snippets) => {

                            Object.forEach(snippets, (module, snippetsList) => {
                                for (const sn of snippetsList) {
                                    if (snippetName === sn.text) {
                                        snippetObject = sn;
                                        return false;
                                    }
                                }
                                return true;
                            });

                            snippet = { text: snippetName, name: snippetName, options: snippetObject.options, fields: snippetObject.fields.map((f) => { f.value = snippetParams[f.name] === undefined ? '' : snippetParams[f.name]; return f; }) };
                            fields = snippet.fields;
                            if (fields.length > 0) {
                                button.settings.editor.windowManager.open({
                                    title: '#{manage-components-tinymce-params} ' + snippet.text,
                                    data: {},
                                    body: fields,
                                    minWidth: button.settings.editor.getParam("code_dialog_width", 600),
                                    onsubmit: (e2) => {
                                        button.settings.editor.focus();
                                        _updateSnippet(button, node, snippet, e2.data);
                                    }
                                });
                            }
                            else {
                                button.settings.editor.focus();
                                _updateSnippet(button, node, snippet, e2.data);
                            }

                        })
                    }



                }


            }

        });

        if (this._tools) {
            tools = tools.concat(this._tools);
        }

        console.log(tools);

        return tools;
    }

    __initVisual() {

        if (this._visualCreated || !this.shown) {
            this.AddHandler('Shown', this.__shownHandler);
            return;
        }

        this._visualCreated = true;
        this.RemoveHandler('Shown', this.__shownHandler);

        if (this._fieldData?.params?.visual == true) {

            if (tinymce.get(this._controlElementId)) {
                tinymce.get(this._controlElementId).remove();
            }

            const additionalButtons = (this._fieldData?.params['has-snippets'] ?? true) ? this._createAdditionalSnippetsButtons() : null;
            const additionalTools = (this._fieldData?.params['has-snippets'] ?? true) ? this._createAdditionalTools() : null;

            tinymce.init({
                selector: '#' + this._controlElementId,
                skin: this._fieldData?.params['tinymce-skin'] || 'nulla',
                relative_urls: false,
                remove_script_host: true,
                allow_script_urls: true,
                language: 'ru',
                extended_valid_elements: "script[*],style[*]",
                valid_children: "+body[script],pre[script|div|p|br|span|img|style|h1|h2|h3|h4|h5],*[*]",
                valid_elements: "*[*]",
                content_css: this._contentCss ?? '',
                formats: Object.assign({
                    flexBoxAlignStartSpaceBetween: { block: 'div', classes: 'app-ui-component app-component-flexbox app-component-shown -nowrap' },
                }, this._contentFormats ?? {}),
                content_style:
                    '.app-component-flexbox { display: flex; align-items: flex-start; justify-content: space-between; border: 1px dashed #c0c0c0; padding: 10px; margin: 10px 0px; }' +
                    '.app-component-flexbox > * { margin: 10px; }' + (this._contentStyle ?? ''),
                style_formats: [
                    { title: '#{manage-components-tinymce-flexblock}', format: 'flexBoxAlignStartSpaceBetween' }
                ].concat(this._styleFormats ?? {}),
                codemirror: {
                    indentOnInit: true, // Whether or not to indent code on init.
                    fullscreen: false, // Default setting is false
                    path: '/res/codemirror', // Path to CodeMirror distribution
                    config: { // CodeMirror config object
                        mode: 'application/x-httpd-php',
                        lineNumbers: true
                    },
                    width: 800, // Default value is 800
                    height: 600, // Default value is 550
                    saveCursorPosition: true, // Insert caret marker
                    jsFiles: [ // Additional JS files to load
                        'mode/clike/clike.js',
                        'mode/php/php.js'
                    ]
                },
                menubar: false,
                plugins: [
                    "advlist link image lists charmap print preview hr anchor pagebreak spellchecker",
                    "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
                    "table contextmenu directionality emoticons template textcolor paste textcolor codemirror customautocomplete"
                ],
                toolbar1: this._fieldData?.params['tinymce-toolbar1'] ? (this._fieldData?.params['tinymce-toolbar1'] === 'null' ? null : this._fieldData?.params['tinymce-toolbar1']) : "bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect",
                toolbar2: this._fieldData?.params['tinymce-toolbar2'] ? (this._fieldData?.params['tinymce-toolbar2'] === 'null' ? null : this._fieldData?.params['tinymce-toolbar2']) : "cut copy paste | searchreplace | bullist numlist | outdent indent blockquote | undo redo | link unlink anchor image media embed code | pastetext | forecolor backcolor",
                toolbar3: this._fieldData?.params['tinymce-toolbar3'] ? (this._fieldData?.params['tinymce-toolbar3'] === 'null' ? null : this._fieldData?.params['tinymce-toolbar3']) : "grid_insert | table | hr removeformat | subscript superscript | charmap emoticons | print fullscreen | ltr rtl | visualchars visualblocks nonbreaking pagebreak restoredraft",
                toolbar4: additionalButtons,
                customautocomplete: {
                    insertFrom: 'text',
                    source: (query, callback) => this._getAutocomplete('tinymce', callback, null, query)
                },

                file_picker_callback: (callback, value, meta) => {
                    const element = document.querySelector('.mce-open:hover');

                    const position = element.bounds();
                    position.top += position.height;

                    if (!this._filepicker) {
                        this._filepicker = new App.Modules.Manage.Windows.FileWindow('filepicker', document.body);
                    }
                    this._filepicker.Show(false).then((data) => {
                        const file = data[0];
                        if (file?.bucket) {
                            // Это удаленный файл
                            callback('/modules/manage/files/by-guid.stream?bucket=' + file.bucket + '&guid=' + file.guid + '&type=' + file.ext);
                        }
                        else {
                            callback(file.path);
                        }
                    });

                },
                setup: (ed) => {
                    if (additionalTools) {
                        additionalTools.forEach((button) => {
                            button.editor = ed;
                            ed.addButton(button.name, button);
                        });
                    }
                    ed.on('change', (e) => {
                        this._savedValue = this._getValue();
                        this.Dispatch('Changed');
                    });

                }
            });



        } else if (this._fieldData?.params?.code) {
            if (this._codemirror) {
                this._codemirror.getWrapperElement().remove();
            }
            const requirements = Colibri.Common.MimeType.extrequirements(this._fieldData?.params.code ?? 'html');
            Colibri.UI.Require(requirements.css, requirements.js).then(() => {

                let defaultPros = {
                    mode: Colibri.Common.MimeType.ext2mode(this._fieldData?.params?.code),
                    indentOnInit: true,
                    lineNumbers: true,
                    lineWrapping: true,
                    styleActiveLine: true,
                    matchBrackets: true,
                    foldGutter: true,
                    saveCursorPosition: true,
                    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                    extraKeys: { "Ctrl-/": (cm) => { cm.foldCode(cm.getCursor()); }, "Ctrl-Space": "autocomplete" },
                    hintOptions: { hint: (cm, option) => new Promise((resolve) => this._getAutocomplete('cm', resolve, cm, option)) }
                };

                // TODO проблема с таб индексом, не берет
                // props.tabindex = this._input.css('tab-index');
                this._codemirror = CodeMirror.fromTextArea(this._input, defaultPros);
                this._codemirror.setValue(this._input.value);

                this._codemirror.setSize('100%', '100%');
                this._codemirror.refresh();

                this._codemirror.on('change', (args) => {
                    this._codemirror.refresh();
                    this._getValue();
                    this._savedValue = this._getValue();
                    this.Dispatch('Changed');
                });

            });
        }
        
    }

    _getValue() {

        if (this._fieldData?.params?.visual == true) {
            try {
                var html = tinymce.get(this._controlElementId).getContent();
            } catch (e) {
                var html = '';
            }
            var ret = html
                .replaceAll('<!DOCTYPE html>', '')
                .replaceAll('<html>', '')
                .replaceAll('</html>', '')
                .replaceAll('<head>', '')
                .replaceAll('</head>', '')
                .replaceAll('<body>', '')
                .replaceAll('</body>', '');
            return ret;
        }
        else if (this._fieldData?.params?.code) {
            return this._codemirror && this._codemirror.getValue();
        }
        else {
            return this._input.value;
        }
    }

    get value() {
        return this._savedValue;
    }

    set value(val) {
        let promise;

        this._savedValue = val;

        if (this._autocompleteLoaded) {
            promise = Promise.resolve({
                result: {
                    snippets: this.snippets,
                    autocomplete: this.autocomplete,
                    contentCss: this.contentCss,
                    contentStyle: this.contentStyle,
                    contntFormats: this.contentFormats,
                    styleFormats: this.styleFormats
                }
            });
        } else {
            promise = this._setLookup();
        }

        promise.then(autoCompleteResult => {

            this._autocompleteLoaded = true;
            this.snippets = autoCompleteResult.result.snippets;
            this.autocomplete = autoCompleteResult.result.autocomplete;
            this.contentCss = autoCompleteResult.result.contentCss;
            this.contentStyle = autoCompleteResult.result.contentStyle;
            this.contentFormats = autoCompleteResult.result.contentFormats;
            this.styleFormats = autoCompleteResult.result.styleFormats;
            this.tools = autoCompleteResult.result.tools;

            Colibri.Common.Delay(100).then(() => {

                this.__initVisual();

                if (this._fieldData?.params?.visual == true) {
                    try {
                        tinymce.get(this._controlElementId).setContent(val ? val : '', { format: 'raw' });
                    } catch (e) {
                        this._input.value = val ? val : '';
                    }
                } else if (this._fieldData?.params?.code) {
                    this._codemirror ? this._codemirror.setValue(val ? val : '') : (this._input.value = (val ? val : ''));
                } else {
                    this._input.value = val ? val : '';
                }
            })

        });

    }


    get readonly() {
        return super.readonly;
    }

    set readonly(value) {
        super.readonly = value;

    }

    get enabled() {
        return super.enabled;
    }

    set enabled(value) {
        super.enabled = value;
        if (this._fieldData?.params?.visual == true) {
            try {
                if (value) {
                    tinymce.activeEditor.mode.set('design');
                }
                else {
                    tinymce.activeEditor.mode.set('readonly');
                }
            } catch (e) {
            }
        } else if (this._fieldData?.params?.code && this._codemirror) {
            if (value) {
                this._codemirror.setOption('readOnly', null);
            }
            else {
                this._codemirror.setOption('readOnly', 'nocursor');
            }
        }
    }

    get shown() {
        return super.shown;
    }

    set shown(value) {
        super.shown = value;
    }

    get params() {
        return this._fieldData?.params ?? {};
    }
    set params(value) {
        if (!this._fieldData) {
            this._fieldData = {};
        }
        this._fieldData.params = value;
    }

    _getAutocomplete(type, resolve, cm, option) {

        if (type === 'cm') {
            let cursor = cm.getCursor(), line = cm.getLine(cursor.line);
            let start = cursor.ch, end = cursor.ch;

            while (start && /[A-zА-я]/.test(line.charAt(start - 1))) --start;
            while (end < line.length && /[A-zА-я]/.test(line.charAt(end))) ++end;

            const word = line.slice(start, end);

            let res = [];
            Object.forEach(this._autocomplete, (text, displayText) => {
                if (!word || text.indexOf(word) != -1 || displayText.indexOf(word) != -1) {
                    res.push({ text: '"' + text + '"', displayText: text + ' (' + displayText + ')' });
                }
            });

            res = res.splice(0, 20);

            resolve({
                list: res,
                from: CodeMirror.Pos(cursor.line, start),
                to: CodeMirror.Pos(cursor.line, end)
            });

        } else if (type === 'tinymce') {
            let res = [];

            Object.forEach(this._autocomplete, (text, displayText) => {
                if (!option || text.indexOf(option) != -1 || displayText.indexOf(option) != -1) {
                    res.push({ text: '"' + text + '"', displayText: text + ' (' + displayText + ')' });
                }
            });
            res = res.splice(0, 20);
            resolve(res);
        }

    }

    /**
     * Autocomplete list
     * @type {Array}
     */
    get autocomplete() {
        return this._autocomplete;
    }
    /**
     * Autocomplete list
     * @type {Array}
     */
    set autocomplete(value) {
        this._autocomplete = value;
    }

    /**
     * Snippets used
     * @type {Object}
     */
    get snippets() {
        return this._snippets;
    }
    /**
     * Snippets used
     * @type {Object}
     */
    set snippets(value) {
        this._snippets = value;
    }

    /**
     * Style formats for TinyMCE
     * @type {Object}
     */
    get styleFormats() {
        return this._styleFormats;
    }
    /**
     * Style formats for TinyMCE
     * @type {Object}
     */
    set styleFormats(value) {
        this._styleFormats = value;
    }

    /**
     * String array of content style for TinyMCE
     * @type {String}
     */
    get contentStyle() {
        return this._contentStyle;
    }
    /**
     * String array of content style for TinyMCE
     * @type {String}
     */
    set contentStyle(value) {
        this._contentStyle = value;
    }

    /**
     * Content formats for TinyMCE
     * @type {Object}
     */
    get contentFormats() {
        return this._contentFormats;
    }
    /**
     * Content formats for TinyMCE
     * @type {Object}
     */
    set contentFormats(value) {
        this._contentFormats = value;
    }

    /**
     * Content css style for TinyMCE
     * @type {String}
     */
    get contentCss() {
        return this._contentCss;
    }
    /**
     * Content css style for TinyMCE
     * @type {String}
     */
    set contentCss(value) {
        this._contentCss = value;
    }

    /**
     * Tools object
     * @type {Object}
     */
    get tools() {
        return this._tools;
    }
    /**
     * Tools object
     * @type {Object}
     */
    set tools(value) {
        if (!Array.isArray(value)) {
            value = [];
        }
        // onclick must be evaled
        this._tools = this._convertObject(value);
    }

    _convertObject(array) {

        let ret = [];
        if (!Array.isArray(array)) {
            return array;
        }

        for (const o of array) {
            let oo = Object.cloneRecursive(o);
            Object.forEach(oo, (name, v) => {
                if (name === 'onclick') {
                    oo[name] = typeof v === 'string' ? eval(v) : v;
                } else {
                    oo[name] = this._convertObject(v);
                }
            });
            ret.push(oo);
        }

        return ret;
    }

    Dispose() {
        if (this._filepicker) {
            this._filepicker.Dispose();
        }
        super.Dispose();
    }

    _setLookup() {
        if (this._fieldData?.lookup?.controller) {
            let controller = this._fieldData.lookup.controller;
            let module = eval(controller.module);
            return module.Call(controller.class, controller.method, { _requestCache: true });
        } else {
            return Promise.resolve({
                result: {
                    snippets: [],
                    autocomplete: [],
                    contentCss: '',
                    contentStyle: {},
                    contntFormats: {},
                    styleFormats: {},
                    tools: {}
                }
            });
        }
    }

    Focus() {
        if (this._fieldData?.params?.visual == true) {
            tinymce.get(this._controlElementId)?.focus();
        } else if (this._fieldData?.params?.code) {

        }
    }

}

Colibri.UI.Forms.Field.RegisterFieldComponent('Manage.UI.TinyMCETextArea', 'App.Modules.Manage.UI.TinyMCETextArea', '#{manage-fields-tinymcetext}', null, ['required', 'enabled', 'canbeempty', 'readonly', 'list', 'template', 'greed', 'viewer', 'fieldgenerator', 'generator', 'noteClass', 'validate', 'valuegenerator', 'onchangehandler', 'visual', 'code'])
