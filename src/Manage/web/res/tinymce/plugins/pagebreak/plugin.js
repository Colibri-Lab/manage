tinymce.PluginManager.add('pagebreak', function (editor) {

    const pageBreakClass = 'mce-pagebreak';
    const separatorHtml = editor.options.get('pagebreak_separator') || '<!-- pagebreak -->';

    const pageBreakSeparatorRegExp = new RegExp(
        separatorHtml.replace(/[\?\.\*\[\]\(\)\{\}\+\^\$\:]/g, a => '\\' + a),
        'gi'
    );

    const placeholderHtml =
        `<img src="${tinymce.Env.transparentSrc}" 
            class="${pageBreakClass}" 
            data-mce-resize="false" 
            data-mce-placeholder />`;

    // Command
    editor.addCommand('mcePageBreak', () => {
        if (editor.options.get('pagebreak_split_block')) {
            editor.insertContent(`<p>${placeholderHtml}</p>`);
        } else {
            editor.insertContent(placeholderHtml);
        }
    });

    // Toolbar button
    editor.ui.registry.addButton('pagebreak', {
        icon: 'page-break',
        tooltip: 'Page break',
        onAction: () => editor.execCommand('mcePageBreak')
    });

    // Menu item
    editor.ui.registry.addMenuItem('pagebreak', {
        text: 'Page break',
        icon: 'page-break',
        onAction: () => editor.execCommand('mcePageBreak')
    });

    // Highlight selection
    editor.on('click', (e) => {
        const el = e.target;
        if (el.nodeName === 'IMG' && editor.dom.hasClass(el, pageBreakClass)) {
            editor.selection.select(el);
        }
    });

    // Replace separator with placeholder
    editor.on('BeforeSetContent', (e) => {
        if (e.content) {
            e.content = e.content.replace(pageBreakSeparatorRegExp, placeholderHtml);
        }
    });

    // Serialize back to separator
    editor.on('PreInit', () => {
        editor.serializer.addNodeFilter('img', (nodes) => {
            let i = nodes.length;

            while (i--) {
                const node = nodes[i];
                const className = node.attr('class');

                if (className && className.indexOf(pageBreakClass) !== -1) {
                    const parent = node.parent;

                    if (
                        parent &&
                        editor.schema.getBlockElements()[parent.name] &&
                        editor.options.get('pagebreak_split_block')
                    ) {
                        parent.type = 3;
                        parent.value = separatorHtml;
                        parent.raw = true;
                        node.remove();
                        continue;
                    }

                    node.type = 3;
                    node.value = separatorHtml;
                    node.raw = true;
                }
            }
        });
    });

    return {
        getMetadata: () => ({
            name: 'Page Break',
            url: ''
        })
    };
});