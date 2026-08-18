/**
 * Remote file list viewer component
 * @class
 * @memberof App.Modules.Manage.UI
 * @extends Colibri.UI.Viewer
 */
App.Modules.Manage.UI.RemoteFileListViewer = class extends Colibri.UI.Viewer {
    
    /**
     * Constructor
     * @constructor
     * @param {string} name component name
     * @param {Colibri.UI.IContainer} container component container
     * @param {HTMLElement} element component element
     * @param {Colibri.UI.Viewer} root component root
     */
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
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

    /**
     * @ignore
     * @private
     * @param {string} value 
     * @returns {string}
     */
    _getUrl(value) {
        return '/modules/manage/files/by-guid.stream?bucket=' + value.bucket + '&guid=' + value.guid + '&type=' + value.ext;
    }

    /**
     * @ignore
     * @private
     */
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

    /**
     * @ignore
     * @private
     */
    _showList() {
        this._group.Clear();
        if(isIterable(this._value)) {
            for(const v of this._value) {
                this._group.AddItem(v);
            }
        }
    }

    /**
     * Value object
     * @type {Array}
     */
    set value(value) {
        this._value = value;
        this._showList();
    }

    /**
     * Value object
     * @type {Array}
     */
    get value() {
        return this._value;
    }


}
Colibri.UI.Viewer.Register('App.Modules.Manage.UI.RemoteFileListViewer', '#{manage-viewers-remotefilelist}');