/**
 * Remote file viewer component
 * @class
 * @memberof App.Modules.Manage.UI
 * @extends Colibri.UI.Viewer
 */
App.Modules.Manage.UI.RemoteFileViewer = class extends Colibri.UI.Viewer {
    
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
        this._icon = new Colibri.UI.Icon(this._name + '_image', this);
        this._icon.shown = true;
        this._icon.width = 20;
        this._icon.height = 20;
        
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

    /**
     * Value object
     * @type {File}
     */
    set value(value) {
        this._value = value;
        this._showIcon();
    }

    /**
     * Value object
     * @type {File}
     */
    get value() {
        return this._value;
    }


}
Colibri.UI.Viewer.Register('App.Modules.Manage.UI.RemoteFileViewer', '#{manage-viewers-remotefile}');