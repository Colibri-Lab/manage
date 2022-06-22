App.Modules.Manage.UI.TinyMCETextArea = class extends Colibri.UI.Forms.TextArea {

    RenderFieldContainer() {
        super.RenderFieldContainer();

        this._controlElementId = 'html' + Date.Mc();
        this._input.attr('id', this._controlElementId);
        this._filepicker = null;

        this._visualCreated = false;

    }

    _createSnippetTag(snippet, data, type = 'tag') {
        if(type === 'tag') {
            return Element.create('component', Object.assign({Component: snippet.name, contentEditable: 'false'}, data, {shown: 'true', style: snippet.options.styles}));
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
        return 'add-snippet edit-snippet';
    }

    _createAdditionalTools() {
        const tools = [];
        tools.push({
            name: "add-snippet",
            icon: false,
            text: "#{manage-components-tinymce-add-snippet;Вставить снипет}",
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

                    for(const module of modules) {

                        const snippetsObject = eval('App.Modules.' + module.name + '.Snippets');
                        if(!snippetsObject) {
                            continue;
                        }
                        const snippetsList = Object.keys(snippetsObject);
                        if(snippetsList.length == 0) {
                            continue;
                        }
                        
                        for(const snippet of snippetsList) {
                            const name = 'App.Modules.' + module.name + '.Snippets.' + snippet;
                            const snippetObject = eval(name);
                            snippets[snippet] = {text: snippet, name: name, options: snippetObject.Options(), fields: snippetObject.Params()};
                            comboList.push({text: snippets[snippet].options?.title ?? snippet, value: snippet});
                        }

                    }
                    
                    Object.forEach(phpsnippets, (module, snippetsList) => {
                        for(const snippet of snippetsList) {
                            snippets[snippet.text] = snippet;
                            comboList.push({text: snippet.options?.title ?? snippet.text, value: snippet.text});
                        }
                    });

                    button.settings.editor.windowManager.open({
                        title: '#{manage-components-tinymce-choose-snippet;Выбрать снипет}',
                        data: {},
                        body: {
                            name: 'snippet',
                            type: 'listbox',
                            label: '#{manage-components-tinymce-snippet;Снипет}',
                            values: comboList
                        },
                        onsubmit: (e1) => {
                            const snippet = snippets[e1.data.snippet];
                            const fields = snippet.fields;
                            if(fields.length > 0) {
                                button.settings.editor.windowManager.open({
                                    title: 'Параметры ' + snippet.text,
                                    data: {},
                                    body: fields,
                                    minWidth: button.settings.editor.getParam("code_dialog_width", 600),
                                    onsubmit: (e2)  => {
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
            text: "#{manage-components-tinymce-edit-snippet;Редактировать снипет}",
            onclick: (e) => {
                const button = e.control;
                const editor = button.settings.editor;
                const dom = editor.dom;
                const sel = editor.selection;
                const node = sel.getNode();
                if (node.matches('component')) {

                    let attrs = {};
                    for(const attr of node.attributes) {
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
                    catch(e) {}
                    
                    let snippet = null;
                    let fields = [];
                    if(snippetObject) {
                        snippet = {text: snippetName, name: snippetName, options: snippetObject.Options(), fields: snippetObject.Params(snippetParams)};
                        fields = snippet.fields;
                        if(fields.length > 0) {
                            button.settings.editor.windowManager.open({
                                title: 'Параметры ' + snippet.text,
                                data: {},
                                body: fields,
                                minWidth: button.settings.editor.getParam("code_dialog_width", 600),
                                onsubmit: (e2)  => {
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
                                for(const sn of snippetsList) {
                                    if(snippetName === sn.text) {
                                        snippetObject = sn;
                                        return false;
                                    }
                                }
                                return true;
                            });

                            snippet = {text: snippetName, name: snippetName, options: snippetObject.options, fields: snippetObject.fields.map((f) => {f.value = snippetParams[f.name]; return f;})};
                            fields = snippet.fields;
                            if(fields.length > 0) {
                                button.settings.editor.windowManager.open({
                                    title: '#{manage-components-tinymce-params;Параметры} ' + snippet.text,
                                    data: {},
                                    body: fields,
                                    minWidth: button.settings.editor.getParam("code_dialog_width", 600),
                                    onsubmit: (e2)  => {
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

        return tools;
    }

    __initVisual() {

        if(this._visualCreated || !this.shown) {
            return;
        }

        if (this._fieldData?.params?.visual == true) {

            if (tinymce.get(this._controlElementId)) {
                tinymce.get(this._controlElementId).remove();
            }

            const additionalButtons = this._createAdditionalSnippetsButtons();
            const additionalTools = this._createAdditionalTools();
            
            tinymce.init({
                selector: '#' + this._controlElementId,
                skin: 'nulla',
                relative_urls: false,
                remove_script_host: true,
                allow_script_urls: true,
                language: 'ru',
                extended_valid_elements: "script[*],style[*]",
                valid_children: "+body[script],pre[script|div|p|br|span|img|style|h1|h2|h3|h4|h5],*[*]",
                valid_elements: "*[*]",
                // content_css: this.tinymceContentCss,
                // content_style: this.tinymceContentStyle,
                // formats: this.tinymceContentFormats,
                // style_formats: this.tinymceContentStyleFormats,
                formats: {
                    flexBoxAlignStartSpaceBetween: { block: 'div', classes: 'app-ui-component app-component-flexbox app-component-shown -nowrap' },
                },
                content_style: 
                    '.app-component-flexbox { display: flex; align-items: flex-start; justify-content: space-between; border: 1px dashed #c0c0c0; padding: 10px; margin: 10px 0px; }' + 
                    '.app-component-flexbox > * { margin: 10px; }',
                style_formats: [
                    { title: '#{manage-components-tinymce-flexblock;Флексбокс (в начало, пространство между блоками)}', format: 'flexBoxAlignStartSpaceBetween' }
                ],
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
                    "table contextmenu directionality emoticons template textcolor paste textcolor codemirror" // customautocomplete
                ],
                toolbar1: "bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect",
                toolbar2: "cut copy paste | searchreplace | bullist numlist | outdent indent blockquote | undo redo | link unlink anchor image media embed code | pastetext | forecolor backcolor",
                toolbar3: "grid_insert | table | hr removeformat | subscript superscript | charmap emoticons | print fullscreen | ltr rtl | visualchars visualblocks nonbreaking pagebreak restoredraft",
                toolbar4: additionalButtons,
                // customautocomplete: this.tinymceCustomAutocomplete,
                
                file_picker_callback: (callback, value, meta) => {
                    const element = document.querySelector('.mce-open:hover');

                    const position = element.bounds();
                    position.top += position.height;

                    this._filepicker = new App.Modules.Manage.Windows.FileWindow('filepicker', document.body); 
                    this._filepicker.Show(false).then((data) => {
                        const file = data[0];
                        if(file?.bucket) {
                            // Это удаленный файл
                            callback('/modules/manage/files/by-guid.stream?bucket=' + file.bucket + '&guid=' + file.guid + '&type=' + file.ext);
                        }
                        else {
                            callback(file.path);
                        }
                    });

                },
                setup: (ed) => {

                    additionalTools.forEach((button) => {
                        button.editor = ed;
                        ed.addButton(button.name, button);
                    });

                    ed.on('change', (e) => {
                        this.Dispatch('Changed');
                    });

                    // window.app.raiseEvent('application.tinymce.setup', { control: self, editor: ed });

                },
            });
            this._visualCreated = true;

        } else if (this._fieldData?.params?.code) {
            if(this._codemirror) {
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
                    extraKeys: {"Ctrl-/": (cm) => { cm.foldCode(cm.getCursor()); }},
                };
            

                // TODO проблема с таб индексом, не берет
                // props.tabindex = this._input.css('tab-index');
                this._codemirror = CodeMirror.fromTextArea(this._input, defaultPros);
                this._codemirror.setValue(this._input.value);

                const height = this._element.bounds().height - 50;
                this._codemirror.setSize('100%', height);

            });
            this._visualCreated = true;

        }
    }

    get value() {
        

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
    
    set value(val) {
        
        Colibri.Common.Delay(100).then(() => {

            this.__initVisual();
            if (this._fieldData?.params?.visual == true) {
                try {
                    tinymce.get(this._controlElementId).setContent(val ? val : '', { format: 'raw' });
                } catch (e) {
                    this._input.value = val ? val : '';
                }
            } else if (this._fieldData?.params?.code) {
                this._codemirror ? this._codemirror.setValue(val) : (this._input.value = val);
            } else {
                this._input.value = val ? val : '';
            }
            
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
                if(value) {
                    tinymce.activeEditor.mode.set('design');
                }
                else {
                    tinymce.activeEditor.mode.set('readonly');
                }
            } catch (e) {
            }
        } else if (this._fieldData?.params?.code && this._codemirror) {
            if(value) {
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
        Colibri.Common.Delay(100).then(() => {
            this.__initVisual();
        });
    }

    Dispose() {
        if(this._filepicker) {
            this._filepicker.Dispose();
        }
        super.Dispose();
    }

}