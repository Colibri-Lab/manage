
/*global tinymce, module, require, define, global, self */

; (function (f) {
    'use strict';

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = f(require('jquery'));

        // RequireJS
    } else if (typeof define === 'function' && define.amd) {
        define(['jquery'], f);

        // <script>
    } else {
        var g;
        if (typeof window !== 'undefined') {
            g = window;
        } else if (typeof global !== 'undefined') {
            g = global;
        } else if (typeof self !== 'undefined') {
            g = self;
        } else {
            g = this;
        }

        f(g.jQuery);
    }

})(function ($) {
    'use strict';

    function loadCss(file, d) {
        if(d === undefined) {
            d = document;
        }
        if(d.getElementById(hex_md5(file))) {
            return;
        }
        var head  = d.getElementsByTagName('head')[0];
        var link  = d.createElement('link');
        link.id   = hex_md5(file);
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = file;
        link.media = 'all';
        head.appendChild(link);
    }
    
    var TemplateGenerator = function (ed, options) {
        this.editor = ed;

        this.options = Object.assign({}, {
            source: function(selectedNode) { return []; },
            delay: 100,
            queryBy: 'name',
            items: 100,
            text: ''
        }, ed.getParam('templategenerator'));
        
        // генератор
        // в момент нажатия control пробел генератор запоминает где мы были в этот момент
        // генерирует управляющие элементы (while, for, foreach, endwhite, endfor, endforeach) добавляет переменные, которые ему дали (парметр templategenerator
        // далее определяет какой там у нас был тэг
        // если мы были в параграфе, и выбрали управляющий тэг то, в случае начального тэга генерирует параграф с параметрами и вставляет ПЕРЕД выделенным параграфом
        // если окончательный тэг то после 
        // если же мы находимся в таблице, то генератор находит ТР и генерирует ТР колспэн (нужное количесто) и вставляет перед выделенным ТР
        // если же окончательный тэг то после 
        // каждый тэг обрабатывается отдельно 


        if(this.options.css) {
            loadCss('//' + document.domain + this.options.css, ed.getDoc());
        }
        loadCss(ed.baseURI.toAbsolute("plugins/templategenerator/generator.css"));

        this.options.insertFrom = this.options.insertFrom || this.options.queryBy;

        this.matcher = this.options.matcher || this.matcher;
        this.sorter = this.options.sorter || this.sorter;
        this.renderDropdown = this.options.renderDropdown || this.renderDropdown;
        this.render = this.options.render || this.render;
        this.insert = this.options.insert || this.insert;
        this.highlighter = this.options.highlighter || this.highlighter;

        this.query = '';
        this.hasFocus = true;

        this.renderInput();

        this.bindEvents();
    };

    TemplateGenerator.commands = [
        {
            name: 'args',
            item: '$args->',
            type: ['inline'],
            create: 'after',
            icon: 'args',
            class: 'variable',
            params: [
                {content: '{? echo $args->', type: 'placeholder'},
                {type: 'var', name: 'var'},
                {content: '?}', type: 'placeholder'}
            ]
        },
        {
            name: 'var',
            item: '$variable',
            type: ['inline'],
            create: 'after',
            class: 'variable',
            icon: 'var',
            params: [
                {content: '{? echo ', type: 'placeholder'},
                {type: 'var', name: 'var'},
                {content: '?}', type: 'placeholder'}
            ]
        },
        {
            name: 'subtemplate',
            item: '$subtemplate',
            type: ['inline', 'block'],
            create: 'after',
            class: 'template',
            icon: 'template',
            params: [
                {content: '{? echo Template::Exec(\'', type: 'placeholder'},
                {type: 'var', name: 'template'},
                {content: '\', ', type: 'placeholder'},
                {type: 'var', name: 'params'},
                {content: ' ); ?}', type: 'placeholder'},
            ]
        },
        {
            name: 'if',
            item: 'if(...):',
            type: ['inline', 'block'],
            create: 'before',
            class: 'condition',
            icon: 'if',
            params: [
                {content: '{? if( ', type: 'placeholder'},
                {type: 'var', name: 'condition'},
                {content: ' ): ?}', type: 'placeholder'},
            ],
        },
        {
            name: 'elseif',
            item: 'elseif(...):',
            type: ['inline', 'block'],
            create: 'before',
            class: 'condition',
            icon: 'if',
            params: [
                {content: '{? elseif( ', type: 'placeholder'},
                {type: 'var', name: 'condition'},
                {content: ' ): ?}', type: 'placeholder'},
            ],
        },
        {
            name: 'else',
            item: 'else:',
            type: ['inline', 'block'],
            create: 'before',
            class: 'condition',
            icon: 'if',
            params: [
                {content: '{? else: ?} ', type: 'placeholder'},
            ],
        },
        {
            name: 'endif',
            item: 'endif;',
            type: ['inline', 'block'],
            create: 'after',
            class: 'condition',
            icon: 'if',
            params: [
                {content: '{? endif; ?} ', type: 'placeholder'},
            ],
        },
        {
            name: 'while',
            item: 'while(...):',
            type: ['inline', 'block'],
            create: 'before',
            class: 'cycle',
            icon: 'while',
            params: [
                {content: '{? while( ', type: 'placeholder'},
                {type: 'var', name: 'condition'},
                {content: ' ): ?}', type: 'placeholder'},
            ],
        },
        {
            name: 'endwhile',
            item: 'endwhile;',
            type: ['inline', 'block'],
            create: 'after',
            class: 'cycle',
            icon: 'while',
            params: [
                {content: '{? endwhile; ?}', type: 'placeholder'},
            ],
        },
        {
            name: 'foreach',
            item: 'foreach(list as item):',
            type: ['inline', 'block'],
            create: 'before',
            class: 'cycle',
            icon: 'foreach',
            params: [
                {content: '{? foreach( ', type: 'placeholder'},
                {type: 'var', name: 'list'},
                {content: ' as ', type: 'placeholder'},
                {type: 'var', name: 'item'},
                {content: ' ): ?}', type: 'placeholder'},
            ],
        },
        {
            name: 'endforeach',
            item: 'endforeach;',
            type: ['inline', 'block'],
            create: 'after',
            class: 'cycle',
            icon: 'foreach',
            params: [
                {content: '{? endforeach; ?}', type: 'placeholder'},
            ],
        },
        
    ],

    TemplateGenerator.prototype = {

        constructor: TemplateGenerator,

        

        _createTag: function(o, place, type) {
            // o - обьект, который содержит описание того, что нужно сделать
            // place - элемент, где мы сейчас находимся
            // type - тип inline, block

            let tag = 'div';
            let p = place;
            if(type == 'inline') {
                tag = 'span';
            }
            else {
                // если находимся в таблице
                if(p.closest('tr')) {
                    tag = 'tr';
                    p = p.closest('tr');
                }
                else if(p.closest('li')) {
                    tag = 'li';
                    p = p.closest('li');
                }
                else if (p.closest('p')) {
                    tag = 'p';
                    p = p.closest('p');
                }
                else if (p.closest('div')) {
                    tag = 'div';
                    p = p.closest('div');
                }
                else {
                    tag = 'p';
                }
            }

            let tagToInsert = Element.fromHtml('<' + tag + ' class="msi-ui-operator ' + o.name + ' ' + type + ' ' + o.class + '" contenteditable="false"></' + tag + '>')[0];
            if(tag == 'tr') {
                tagToInsert.append('<td colspan="' + p.querySelectorAll('td').length + '"></td>');
            }
            o.params.forEach((param) => {
                if(param.type == 'placeholder') {
                    // просто текст, не редактируемый
                    if(tag == 'tr') {
                        tagToInsert.querySelector('td').append(Element.fromHtml(param.content)[0]);    
                    }
                    else {
                        tagToInsert.append(Element.fromHtml(param.content)[0]);
                    }
                }
                else if(param.type == 'var') {
                    if(tag == 'tr') {
                        tagToInsert.querySelector('td').append(Element.fromHtml('<span contenteditable="true" class="var" data-var="' + param.name + '"></span>')[0]);
                    }
                    else {
                        tagToInsert.append(Element.fromHtml('<span contenteditable="true" class="var" data-var="' + param.name + '"></span>'));
                    }
                }
            });

            if(o.create == 'before') {
                p.before(tagToInsert);
            }
            else if(o.create == 'after') {
                p.after(tagToInsert);
            }

        },

        // создаем элемент, к которому будем привязываться в последствии
        renderInput: function () {
            const autocompleteElement = this.editor.getDoc().querySelector('#autocomplete');
            autocompleteElement && autocompleteElement.remove();
            let selection = this.editor.getDoc().getSelection();
            selection.getRangeAt(0).insertNode(Element.fromHtml('<span id="autocomplete"></span>')[0]);
        },

        bindEvents: function () {
            this.editor.on('keyup', this.editorKeyUpProxy = (е) => this.rteKeyUp(е));
            this.editor.on('keydown', this.editorKeyDownProxy = (е) => this.rteKeyDown(е));
            this.editor.on('click', this.editorClickProxy = (е) => this.rteClicked(е));

            this.editor.getBody().addEventListener('click', this.bodyClickProxy = (е) => this.rteLostFocus(е));

            this.editor.getWin().addEventListener('scroll', this.rteScroll = (е) => this.cleanUp(true));
        },

        unbindEvents: function () {
            this.editor.off('keyup', this.editorKeyUpProxy);
            this.editor.off('keydown', this.editorKeyDownProxy);
            this.editor.off('click', this.editorClickProxy);

            this.editor.getBody().removeEventListener('click', this.bodyClickProxy);

            this.editor.getWin().removeEventListener('scroll', this.rteScroll);
        },

        rteKeyUp: function (e) {
            switch (e.which || e.keyCode) {
                //DOWN ARROW
                case 40:
                //UP ARROW
                case 38:
                //SHIFT
                case 16:
                //CTRL
                case 17:
                //ALT
                case 18:
                    break;

                //BACKSPACE
                case 8:
                    if (this.query === '') {
                        this.cleanUp(true);
                    } else {
                        this.lookup();
                    }
                    break;

                //TAB
                case 9:
                //ENTER
                case 13:
                    var item = (this.$dropdown !== undefined) ? this.$dropdown.querySelector('li.active') : [];
                    if (item.length) {
                        this.select(item.tag());
                        this.cleanUp(false);
                    } else {
                        this.cleanUp(true);
                    }
                    break;

                //ESC
                case 27:
                    this.cleanUp(true);
                    break;

                default:
                    this.lookup();
            }
        },

        rteKeyDown: function (e) {
            switch (e.which || e.keyCode) {
                //TAB
                case 9:
                //ENTER
                case 13:
                    this.autoCompleteClick(e);
                    break;
                //ESC
                case 27:
                    e.preventDefault();
                    break;

                //UP ARROW
                case 38:
                    e.preventDefault();
                    if (this.$dropdown !== undefined) {
                        this.highlightPreviousResult();
                    }
                    break;
                //DOWN ARROW
                case 40:
                    e.preventDefault();
                    if (this.$dropdown !== undefined) {
                        this.highlightNextResult();
                    }
                    break;
            }

            e.stopPropagation();
        },

        rteClicked: function (e) {
            var $target = e.target;
            
            if (this.hasFocus && (e.target.parentElement instanceof Element && e.target.parentElement.attr('id') !== 'autocomplete')) {
                this.cleanUp(true);
            }
        },

        rteLostFocus: function () {
            if (this.hasFocus) {
                this.cleanUp(true);
            }
        },

        lookup: function () {

            if (!this.$dropdown) {
                this.show();
            }

            var selection = this.editor.getBody().querySelector('span#autocomplete');

            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                var items = this.options.source(selection, () => this.process());
                if (items) {
                    this.process(items);
                }
            }, this.options.delay);
        },

        highlighter: function (text) {
            return text.replace(new RegExp('(' + this.query.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1') + ')', 'ig'), function ($1, match) {
                return '<strong>' + match + '</strong>';
            });
        },

        show: function () {
            var offset = this.editor.inline ? this.offsetInline() : this.offset();

            this.$dropdown = this.renderDropdown();
            document.querySelector('body').append(this.$dropdown);
            this.$dropdown.css({ 'top': offset.top + 'px', 'left': offset.left + 'px', zIndex: Colibri.UI.zIndex() });

            this.$dropdown.addEventListener('click', (e) => this.autoCompleteClick(e));
        },

        process: function (data) {
            if (!this.hasFocus) {
                return;
            }

            var _this = this,
                result = [],
                items = TemplateGenerator.commands.concat(data);

            items = items.slice(0, this.options.items);

            this.$dropdown.html('');
            items.forEach( (item, i) => {
                item.type.forEach((t) => {
                    var $element = this.renderItem(item, i, t);
                    $element.tag('tag', item);
                    $element.tag('type', t);
                    this.$dropdown.append($element);
                })
                
            });

            // показываем, если что то есть
            if(this.$dropdown.querySelector('li').length) {
                this.$dropdown.show();
            }

        },

        renderDropdown: function () {
            return Element.fromHtml('<ul class="rte-autocomplete dropdown-menu"><li class="loading"></li></ul>')[0];
        },

        renderItem: function (item, index, type) {
            return Element.fromHtml('<li><a href="javascript:;"><span>' + item.item + ' (' + type + ')</span></a></li>')[0];
        },

        autoCompleteClick: function (e) {

            var active = this.$dropdown.querySelector('li.active');
            if(!active) {
                active = e.target.closest('li');
            }

            var item = active.tag('tag');
            var type = active.tag('type')
            this.ExecCommand(item, type);
            e.stopPropagation();
            e.preventDefault();
        },

        ExecCommand: function (item, type) {
            if (item) {
                this.select(item, type);
                this.cleanUp(false);
            }
        },

        highlightPreviousResult: function () {
            var lis = this.$dropdown.querySelectorAll('li');
            var active = this.$dropdown.querySelector('li.active');
            var currentIndex = active ? active.index() : 0,
                index = (currentIndex === 0) ? this.$dropdown.querySelectorAll('li').length - 1 : --currentIndex;

            lis.forEach(li => li.classList.remove('active'))
            lis[index].classList.add('active');
        },

        highlightNextResult: function () {
            var lis = this.$dropdown.querySelectorAll('li');
            var active = this.$dropdown.querySelector('li.active');
            var currentIndex = active ? active.index() : 0,
                index = (currentIndex === this.$dropdown.querySelectorAll('li').length - 1) ? 0 : ++currentIndex;

            lis.forEach(li => li.classList.remove('active'));
            lis[index].classList.add('active');
        },

        select: function (item, type) {
            this.editor.focus();
            var selection = this.editor.getBody().querySelector('span#autocomplete');
            this._createTag(item, selection, type);
            this.editor.getBody().querySelector('span#autocomplete').remove();

        },

        insert: function (item) {
            return '' + item[this.options.insertFrom] + ' ';
        },

        cleanUp: function (rollback) {
            this.unbindEvents();
            this.hasFocus = false;
            const autocompleteElement = this.editor.getDoc().querySelector('#autocomplete');
            autocompleteElement && autocompleteElement.remove();

            if (this.$dropdown) {
                this.$dropdown.remove();
                delete this.$dropdown;
            }
        },

        offset: function () {
            var autocompleteSpan = this.editor.getBody().querySelector('span#autocomplete');
            var rtePosition = this.editor.getContainer().offset(),
                contentAreaPosition = this.editor.getContentAreaContainer().position(),
                nodePosition = autocompleteSpan ? autocompleteSpan.position() : {left: 0, top: 0};
            ;
            return {
                top: contentAreaPosition.top + nodePosition.top - this.editor.getBody().scrollTop + 5, // + nodePosition.top + nodeOffset.height - this.editor.getBody().scrollTop + 5,
                left: contentAreaPosition.left + nodePosition.left + 5, // + nodePosition.left
            };
        },

        offsetInline: function () {
            var nodePosition = this.editor.getBody().querySelector('span#autocomplete').offset();
            var nodeBounds = this.editor.selection.getNode();

            return {
                top: nodePosition.top + nodeBounds.height + 5,
                left: nodePosition.left
            };
        }

    };

    tinymce.create('tinymce.plugins.TemplateGenerator', {

        init: function (ed) {

            var autoComplete,
                autoCompleteData = ed.getParam('templategenerator');

            loadCss(ed.baseURI.toAbsolute("plugins/templategenerator/generator.css"));

            ed.settings.content_css = (ed.settings.content_css ? ed.settings.content_css + ',' : '') + ed.baseURI.toAbsolute("plugins/templategenerator/generator.css");

            ed.on('keydown', function (e) {
                if(e.keyCode == 32 && e.ctrlKey) {
                    if (autoComplete === undefined || (autoComplete.hasFocus !== undefined && !autoComplete.hasFocus)) {
                        e.preventDefault();
                        autoComplete = new TemplateGenerator(ed, Object.assign({}, autoCompleteData, { 'selection': ed.selection }));
                    }
                }
            });

            const createMenu = (type) => {

                let menu = [];

                TemplateGenerator.commands.forEach((command) => {
                    if(command.type.indexOf(type) !== -1) {
                        menu.push({
                            text: command.item,
                            icon: 'shown',
                            image: ed.baseURI.toAbsolute('plugins/templategenerator/' + command.icon + '.svg'),
                            onclick: function(e) {
                                if (autoComplete === undefined || (autoComplete.hasFocus !== undefined && !autoComplete.hasFocus)) {
                                    autoComplete = new TemplateGenerator(ed, Object.assign({}, autoCompleteData, { 'selection': ed.selection }));
                                }
                                autoComplete.ExecCommand(command, type);
                            }
                        });
                    }
                });

                return menu;

            };

            ed.addButton('templatebutton', {
                type: 'menubutton',
                text: 'Команды',
                menu: [
                    {
                        text: 'Блочные элементы',
                        icon: 'block',
                        menu: createMenu('block')
                    },
                    {
                        text: 'Элементы в строке',
                        icon: 'inline',
                        menu: createMenu('inline')
                    }
                ],
            });

            let buttons = {};
            TemplateGenerator.commands.forEach((command) => {

                if(!buttons[command.class]) {
                    buttons[command.class] = [];
                }
                buttons[command.class].push(command);
            });

            let btns = [];
            Object.keys(buttons).forEach((button) => {

                let menu = [];
                let cmds = buttons[button];
                cmds.forEach((command) => {
                    menu.push({
                        text: command.item,
                        icon: 'shown',
                        image: ed.baseURI.toAbsolute('plugins/templategenerator/' + command.icon + '.svg'),
                        menu: [
                            {
                                text: 'Блок',
                                onclick: function(e) {
                                    if (autoComplete === undefined || (autoComplete.hasFocus !== undefined && !autoComplete.hasFocus)) {
                                        autoComplete = new TemplateGenerator(ed, Object.assign({}, autoCompleteData, { 'selection': ed.selection }));
                                    }
                                    autoComplete.ExecCommand(command, 'block');
                                }
                            },
                            {
                                text: 'В строке',
                                onclick: function(e) {
                                    if (autoComplete === undefined || (autoComplete.hasFocus !== undefined && !autoComplete.hasFocus)) {
                                        autoComplete = new TemplateGenerator(ed, Object.assign({}, autoCompleteData, { 'selection': ed.selection }));
                                    }
                                    autoComplete.ExecCommand(command, 'inline');
                                }
                            }
                        ]
                    });
                });

                btns.push('templatebutton' + button);
                ed.addButton('templatebutton' + button, {
                    type: 'menubutton',
                    image: ed.baseURI.toAbsolute('plugins/templategenerator/' + cmds[0].icon + '.svg'),
                    icon: 'shown',
                    menu: menu,
                    tooltip: cmds[0].item
                });


            });


            ed.settings.toolbar4 = (ed.settings.toolbar4 ? ed.settings.toolbar4 + ' | ' : '') + 'templatebutton ' + btns.join(' ');

        },

        getInfo: function () {
            return {
                longname: 'templategenerator',
                author: 'Vahan P. Grigoryan',
                version: tinymce.majorVersion + '.' + tinymce.minorVersion
            };
        }
    });

    tinymce.PluginManager.add('templategenerator', tinymce.plugins.TemplateGenerator);

});