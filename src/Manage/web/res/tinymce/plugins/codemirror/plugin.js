tinymce.PluginManager.add('codemirror', (editor, url) => {
    function loadCss(file, doc = document) {
        if (doc.getElementById(file)) return;

        const link = doc.createElement('link');
        link.id = file;
        link.rel = 'stylesheet';
        link.href = file;

        doc.head.appendChild(link);
    }


    editor.on('init', () => {
        loadCss(editor.baseURI.toAbsolute("plugins/codemirror/codemirror.css"));
    });

	// Функция для открытия окна с CodeMirror
	const openCodeEditor = () => {
		editor.windowManager.open({
			title: 'Source Code',
			label: 'sourcecode',
			size: 'large',
			body: {
				type: 'panel',
				size: 'large',
				items: [
                    {
                        type: 'htmlpanel',
                        html: `<iframe width="100%" height="100%" src="${editor.baseURI.toAbsolute("plugins/codemirror/source.html")}" style="width:100%;height:100%;border:0;"></iframe>`
                    }
                ]
			},
			buttons: [
				{ type: 'cancel', text: 'Cancel' },
				{ type: 'submit', text: 'Save', primary: true }
			],

			// Событие срабатывает, когда iframe загружен
			onMessage: (api, message) => {
				// Можно использовать для кастомных уведомлений из iframe
			},

			onSubmit: (api) => {
				debugger;
				// Достаем iframe через селектор или API
				const iframe = document.querySelector('.tox-dialog__body iframe');
				if (iframe && iframe.contentWindow.getCode) {
					const newContent = iframe.contentWindow.getCode();
					editor.setContent(newContent);
				}
				api.close();
			}
		});

		// Передаем данные в iframe после его загрузки
		setTimeout(() => {
			const iframe = document.querySelector('.tox-dialog__body iframe');
			if (iframe && iframe.contentWindow.setCode) {
				iframe.contentWindow.setCode(editor.getContent());
			}
		}, 500); // Небольшая задержка для гарантии загрузки DOM iframe
	};

	// Добавляем кнопку в тулбар
	editor.ui.registry.addButton('sourcecode', {
		icon: 'sourcecode',
		tooltip: 'Исходный код (CodeMirror)',
		onAction: openCodeEditor
	});

	// Добавляем пункт меню
	editor.ui.registry.addMenuItem('sourcecode', {
		text: 'Исходный код',
		icon: 'sourcecode',
		onAction: openCodeEditor
	});

	return {
		getMetadata: () => ({
			name: 'CodeMirror Plugin',
			url: 'https://yourwebsite.com'
		})
	};
});
