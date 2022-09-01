App.Modules.Manage.UI.RemoteFile = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {
        this.AddClass('app-component-manage-file-field');

        this._value = '';

        this._flex = new Colibri.UI.FlexBox(this._name + '_flex', this.contentContainer);

        this._icon = new Colibri.UI.Icon(this._name + '_icon', this._flex);
        this._pane = new Colibri.UI.Pane(this._name + '_pane', this._flex);

        this._path = new Colibri.UI.Input(this._name + '_path', this._pane);
        this._buttons = new Colibri.UI.FlexBox(this._name + '_buttons', this._pane);

        this._clear = new Colibri.UI.Icon(this._name + '_clear', this._buttons);
        this._choose = new Colibri.UI.Icon(this._name + '_choose', this._buttons);
        this._download = new Colibri.UI.Icon(this._name + '_download', this._buttons);

        this._path.hasIcon = false;
        this._path.hasClearIcon = false;

        this._flex.shown = this._icon.shown = 
        this._pane.shown = this._path.shown = 
        this._buttons.shown = this._clear.shown = 
        this._choose.shown = this._download.shown = true;

        this._clear.value = Colibri.UI.RemoveIcon;
        this._choose.value = Colibri.UI.FolderIcon;
        this._download.value = Colibri.UI.DownloadIcon;

        this._path.tabIndex = true;
        this._clear.tabIndex = this._choose.tabIndex = this._download.tabIndex = true;
        this._path.readonly = true;

        this._handleEvents();
        this._enableButtons();

    }

    _handleEvents() {

        this._clear.AddHandler('Clicked', (event, args) => this.__clearClicked(event, args));
        this._choose.AddHandler('Clicked', (event, args) => this.__chooseClicked(event, args));
        this._download.AddHandler('Clicked', (event, args) => this.__downloadClicked(event, args));

    }

    _enableButtons() {
        const enabled = this._isValue(this._value);
        this._clear.enabled = enabled;
        this._download.enabled = enabled;

    }

    __pathChanged(event, args) {
        this.value = this._path.value;
        this.Dispatch('Changed', args);
    }

    __clearClicked(event, args) {
        this.value = null;
        this.Dispatch('Changed', args);
    }

    __chooseClicked(event, args) {
        const files = new App.Modules.Manage.Windows.FileWindow('filepicker', document.body); 
        files.Show(false, true, false).then((data) => {
            const file = data[0];
            files.Dispose();
            this.value = file;
            this.Dispatch('Changed', args);
        });
    }

    __downloadClicked(event, args) {
        if(!this._isValue(this._value)) {
            return;
        }
        DownloadFileByPath(this._getUrl(this._value));
    }

    /**
     * Поставить фокус
     */
    Focus() {
        this._path.Focus();
    }
    

    /**
     * Значение поля (выбранный файл)
     * @type {File}
     */
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
        this._showValue();
        this._enableButtons();
    }

    _isValue(value) {
        return !Array.isArray(value) && value instanceof Object;
    }

    _showValue() {
        if(this._isValue(this._value)) {
            this._path.value = this._value.name + ' (' + this._value.ext + ')';
            this._showIcon();
        }
        else {
            this._path.value = '';
            this._showIcon();
        }
    }

    _showIcon() {
        const value = this._value;

        if(!value || !value?.ext) {
            this._icon.icon = null;
            this._icon.value = null;
        }
        else {
            const MimeType = Colibri.Common.MimeType;
            if(MimeType.isImage(value.ext)) {
                this._icon.icon = 'url(\'' + this._getUrl(value) + '\')';
            }
            else if(Colibri.UI.Files[value.ext] !== undefined) {
                this._icon.icon = null;
                this._icon.value = Colibri.UI.Files[value.ext];
            }
        }   
    }

    _getUrl(value) {
        return '/modules/manage/files/by-guid.stream?bucket=' + value.bucket + '&guid=' + value.guid + '&type=' + value.ext;
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Manage.UI.RemoteFile', 'App.Modules.Manage.UI.RemoteFile', '#{app-fields-remotefile;Файл из удаленного хранилища}')
