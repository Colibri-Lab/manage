App.Modules.Manage.UI.RemoteFileViewer = class extends Colibri.UI.Viewer {
    
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-remotefile-viewer-component');
        this._icon = new Colibri.UI.Icon(this._name + '_image', this);
        this._icon.shown = true;
        this._icon.width = 20;
        this._icon.height = 20;
        
    }

    _getUrl(value) {
        return '/modules/manage/files/by-guid.stream?bucket=' + value.bucket + '&guid=' + value.guid + '&type=' + value.ext;
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
            } else if(Colibri.UI.Files[value.ext] !== undefined) {
                this._icon.icon = null;
                this._icon.value = Colibri.UI.Files[value.ext];
            } else {
                this._icon.icon = null;
                this._icon.value = Colibri.UI.Forms.File;
            }
        }   
    }

    set value(value) {
        this._value = value;
        this._showIcon();
    }


}
Colibri.UI.Viewer.Register('App.Modules.Manage.UI.RemoteFileViewer', '#{manage-viewers-remotefile}');