App.Modules.Manage.UI.File = class extends Colibri.UI.Forms.Field {
    
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

        this._handleEvents();

    }

    _handleEvents() {

        this._path.AddHandler(['Filled', 'Cleared'], (event, args) => this.__pathChanged(event, args));
        this._clear.AddHandler('Clicked', (event, args) => this.__clearClicked(event, args));
        this._choose.AddHandler('Clicked', (event, args) => this.__chooseClicked(event, args));
        this._download.AddHandler('Clicked', (event, args) => this.__downloadClicked(event, args));

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __pathChanged(event, args) {
        this.value = this._path.value;
        this.Dispatch('Changed', args);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __clearClicked(event, args) {
        this.value = '';
        this.Dispatch('Changed', args);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __chooseClicked(event, args) {
        const files = new App.Modules.Manage.Windows.FileWindow('filepicker', document.body); 
        files.Show(false).then((data) => {
            const file = data[0];
            files.Dispose();
            this.value = file.path;
            this.Dispatch('Changed', args);
        });
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __downloadClicked(event, args) {
        DownloadFileByPath(this.value);
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
    }

    _showValue() {
        this._path.value = this._value;
        this._showIcon();
    }

    _showIcon() {
        try {
            const value = this._value;
            const pi = value.pathinfo();
            if(!pi?.ext) {
                this._icon.icon = null;
                this._icon.value = null;
            }
            else {
                const MimeType = Colibri.Common.MimeType;
                if(MimeType.isImage(pi.ext)) {
                    this._icon.icon = 'url(\'' + value + '\')';
                }
                else if(Colibri.UI.Files[pi.ext] !== undefined) {
                    this._icon.icon = null;
                    this._icon.value = Colibri.UI.Files[pi.ext];
                }
            }
    
        }
        catch(e) {

        }
        
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Manage.UI.File', 'App.Modules.Manage.UI.File', '#{manage-fields-localfile}');
