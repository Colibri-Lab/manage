App.Modules.Manage.UI.RemoteFileListViewer = class extends Colibri.UI.Viewer {
    
    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-remotefile-viewer-component');
        this._list = new Colibri.UI.List(this._name + '_image', this);
        this._list.shown = true;
        this._group = this._list.AddGroup('group', '');
        this._list.__renderItemContent = (itemData, item) => {
            const icon = new Colibri.UI.Icon(item.name + '_icon', item);
            icon.shown = true;
            icon.width = 50;
            icon.height = 50;
            this._showIcon(icon, itemData);
        };

    }

    _getUrl(value) {
        return '/modules/manage/files/by-guid.stream?bucket=' + value.bucket + '&guid=' + value.guid + '&type=' + value.ext;
    }

    _showIcon(icon, value) {
        if(!value || !value?.ext) {
            icon.icon = null;
            icon.value = null;
        }
        else {
            const MimeType = Colibri.Common.MimeType;
            if(MimeType.isImage(value.ext)) {
                icon.icon = 'url(\'' + this._getUrl(value) + '\')';
            }
            else if(Colibri.UI.Files[value.ext] !== undefined) {
                icon.icon = null;
                icon.value = Colibri.UI.Files[value.ext];
            }
        }   
    }

    _showList() {
        this._group.Clear();
        for(const v of this._value) {
            this._group.AddItem(v);
        }
    }

    set value(value) {
        this._value = value;
        this._showList();
    }


}
Colibri.UI.Viewer.Register('App.Modules.Manage.UI.RemoteFileListViewer', 'Удаленный файл');