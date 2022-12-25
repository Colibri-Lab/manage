App.Modules.Manage.UI.Files = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {
        this.AddClass('app-component-manage-files-field');

        this._value = '';

        this._list = new Colibri.UI.List(this._name + '_list', this.contentContainer);
        this._group = this._list.AddGroup(this._name + '_group', '');

        this._list.shown = true;

        this._list.__renderItemContent = (itemData, item) => {

            const flex = new Colibri.UI.FlexBox(this._name + '_flex', item);

            const icon = new Colibri.UI.Icon(this._name + '_icon', flex);
            const pane = new Colibri.UI.Pane(this._name + '_pane', flex);
            const move = new Colibri.UI.Pane(this._name + '_move', flex);
    
            const path = new Colibri.UI.Input(this._name + '_path', pane);
            const buttons = new Colibri.UI.FlexBox(this._name + '_buttons', pane);
    
            const choose = new Colibri.UI.Icon(this._name + '_choose', buttons);
            const download = new Colibri.UI.Icon(this._name + '_download', buttons);

            const clear = new Colibri.UI.Icon(this._name + '_clear', move);
            const up = new Colibri.UI.Icon(this._name + '_up', move);
            const down = new Colibri.UI.Icon(this._name + '_down', move);

            path.hasIcon = false;
            path.hasClearIcon = false;
    
            flex.shown = icon.shown = move.shown = 
            pane.shown = path.shown = up.shown =
            buttons.shown = clear.shown = down.shown =
            choose.shown = download.shown = true;
    
            clear.value = Colibri.UI.RemoveIcon;
            choose.value = Colibri.UI.FolderIcon;
            download.value = Colibri.UI.DownloadIcon;
            up.value = Colibri.UI.UpIcon;
            down.value = Colibri.UI.DownIcon;
    
            path.tabIndex = true;
            clear.tabIndex = choose.tabIndex = download.tabIndex = true;

            path.value = itemData.path;
            this._showIcon(icon, path.value);

            path.AddHandler(['Filled', 'Cleared'], (event, args) => {
                this._value.splice(item.index, 1, path.value);
                this.value = this._value;
                this.Dispatch('Changed', args);
            });

            clear.AddHandler('Clicked', (event, args) => {
                this._value.splice(item.index, 1);
                this.value = this._value;
                this.Dispatch('Changed', args);
            });

            choose.AddHandler('Clicked', (event, args) => {
                const files = new App.Modules.Manage.Windows.FileWindow('filepicker', document.body); 
                files.Show(false).then((data) => {
                    const index = item.index;
                    this._value.splice(index, 1, data[0].path);
                    this.value = this._value;
                    files.Dispose();
                    this.Dispatch('Changed', args);
                });
            });

            download.AddHandler('Clicked', (event, args) => DownloadFileByPath(item.value.path));


        };

        this._buttons = new Colibri.UI.FlexBox(this._name + '_buttons', this.contentContainer);
        this._clear = new Colibri.UI.Icon(this._name + '_clear', this._buttons);
        this._choose = new Colibri.UI.Icon(this._name + '_choose', this._buttons);
        
        this._buttons.shown = this._clear.shown = 
        this._choose.shown = true;

        this._clear.value = Colibri.UI.RemoveIcon;
        this._choose.value = Colibri.UI.FolderIcon;
        
        this._handleEvents();

    }

    _handleEvents() {

        // this._path.AddHandler(['Filled', 'Cleared'], (event, args) => this.__pathChanged(event, args));
        
        this._clear.AddHandler('Clicked', (event, args) => this.__clearClicked(event, args));
        this._choose.AddHandler('Clicked', (event, args) => this.__chooseClicked(event, args));

    }

    __clearClicked(event, args) {
        this.value = '';
        this.Dispatch('Changed', args);
    }

    __chooseClicked(event, args) {
        const files = new App.Modules.Manage.Windows.FileWindow('filepicker', document.body); 
        files.Show(true).then((data) => {
            data = data.map(d => { return {path: d.path}; });
            this.value = this.value.concat(data);
            files.Dispose();
            this.Dispatch('Changed', args);
        });
    }

    __downloadClicked(event, args) {
        DownloadFileByPath(this.value);
    }

    /**
     * Поставить фокус
     */
    Focus() {
        // this._path.Focus();
    }
    

    /**
     * Значение поля (выбранный файл)
     * @type {File}
     */
    get value() {
        return this._value;
    }
    set value(value) {
        if(!value) {
            this._value = [];
            this._showValue();
            return;
        }

        if(!Array.isArray(value)) {
            value = value.split(';');
        }
        this._value = value;
        this._showValue();
    }

    _showValue() {

        let found = [];
        for(let file of this._value) {
            if(typeof file == 'string') {
                file = {path: file};
            }
            if(file.path === '') {
                continue;
            }

            const id = 'file' + String.MD5(file.path);
            let item = this._group.Children(id);
            if(item) {
                item.value = file;
            }
            else {
                this._group.AddItem(file, id);
            }
            found.push(id);
        }

        this._group.ForEach((name, item) => {
            if(found.indexOf(name) === -1) {
                item.Dispose();
            }
        });

    }

    _showIcon(component, value) {

        const pi = value.pathinfo();
        if(!pi?.ext) {
            component.icon = null;
            component.value = null;
        }
        else {
            const MimeType = Colibri.Common.MimeType;
            if(MimeType.isImage(pi.ext)) {
                component.icon = 'url(\'' + value + '\')';
            }
            else if(Colibri.UI.Files[pi.ext] !== undefined) {
                component.icon = null;
                component.value = Colibri.UI.Files[pi.ext];
            }
        }

        
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Manage.UI.Files', 'App.Modules.Manage.UI.Files', '#{manage-fields-localfiles}');
