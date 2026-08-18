/**
 * File manager component
 * @class
 * @memberof App.Modules.Manage.UI
 * @extends Colibri.UI.Component
 */
App.Modules.Manage.UI.FileManager = class extends Colibri.UI.Component {

    /**
     * Constructor
     * @constructor
     * @param {string} name component name
     * @param {Colibri.UI.IContainer} container component container
     */
    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Manage.UI.FileManager']);
        this.AddClass('app-file-manager-component');

        this._drop = new Colibri.UI.FileDropManager(this.container);
        // this._drop.allowSize = 20971520;
        //  allowSize="20971520"

        this._folders = this.Children('split/folders-pane/folders');
        this._searchInput = this.Children('split/files-pane/search-pane/search-input');
        this._files = this.Children('split/files-pane/files');
        
        this._uploadFile = this.Children('split/files-pane/buttons-pane/upload-file');
        this._editFile = this.Children('split/files-pane/buttons-pane/edit-file');
        this._deleteFile = this.Children('split/files-pane/buttons-pane/delete-file');

        this._folders.AddHandler('SelectionChanged', this.__foldersSelectionChanged, false, this);      
        this._folders.AddHandler('NodeEditCompleted', this.__foldersNodeEditCompleted, false, this);
        this._folders.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderFoldersContextMenu(event, args))
        this._folders.AddHandler('ContextMenuItemClicked', this.__clickOnFoldersContextMenu, false, this);        

        this._files.AddHandler('SelectionChanged', this.__filesSelectionChanged, false, this);      
        this._files.AddHandler('CheckChanged', this.__checkChangedOnFiles, false, this);
        this._files.AddHandler('ContextMenuIconClicked', this.__renderFilesContextMenu, false, this);
        this._files.AddHandler('ContextMenuItemClicked', this.__clickOnFilesContextMenu, false, this);        
        this._files.AddHandler('DoubleClicked', this.__filesDoubleClicked, false, this);

        this._uploadFile.AddHandler('Changed', this.__addDataButtonClicked, false, this);
        this._editFile.AddHandler('Clicked', this.__editDataButtonClicked, false, this);
        this._deleteFile.AddHandler('Clicked', this.__deleteDataButtonClicked, false, this);

        this._searchInput.AddHandler(['Filled', 'Cleared'], this.__searchInputFilled, false, this);

        this._drop.AddHandler('FileDropped', this.__dropContainerFileDropped, false, this);

    }
    
    /** 
     * @ignore
     * @protected
     */
    _registerEvents() {
        this.RegisterEvent('SelectionChanged', false, 'Когда выбор файлов изменился');
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __renderFoldersContextMenu(event, args) {
        let contextmenu = [];
        
        const itemData = args.item?.tag;
        if(!itemData) {
            return;
        }
        else {
            contextmenu.push({name: 'new-folder', title: '#{manage-contextmenu-newfolder}', icon: Colibri.UI.ContextMenuAddIcon});
            contextmenu.push({name: 'edit-folder', title: '#{manage-contextmenu-editfolder}', icon: Colibri.UI.ContextMenuEditIcon});
            contextmenu.push({name: 'remove-folder', title: '#{manage-contextmenu-deletefolder}', icon: Colibri.UI.ContextMenuRemoveIcon});

            args.item.contextmenu = contextmenu;
            args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.LB, Colibri.UI.ContextMenu.LT] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RT], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __clickOnFoldersContextMenu(event, args) {
        const item = args?.item;
        const menuData = args.menuData;
        if(!menuData) {
            return false;
        }

        if(menuData.name == 'new-folder') {
            item.Expand();
            item.isLeaf = false;
            const node = this._folders.AddNew(item, 'UNTITLED', {new: true, name: 'UNTITLED', path: item.tag.path});
            node.editable = true;
            node.Edit();
        }
        else if(menuData.name == 'edit-folder') {
            item.Edit();
        }
        else if(menuData.name == 'remove-folder') {
            App.Confirm.Show('#{manage-folders-messages-removefolder}', '#{manage-folders-messages-removefoldermessage}', '#{manage-folders-messages-removefoldermessage-delete}').then(() => {
                Manage.RemoveFolder(item.tag.path);
                this._folders.selected = item.parentNode;
            });
        }

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __renderFilesContextMenu(event, args) {
        
        const itemData = args.item?.value;
        if(!itemData) {
            return;
        }

        let contextmenu = [];
        contextmenu.push({name: 'edit-file', title: '#{manage-contextmenu-editfile}', icon: Colibri.UI.ContextMenuEditIcon});
        contextmenu.push({name: 'remove-file', title: '#{manage-contextmenu-deletefile}', icon: Colibri.UI.ContextMenuRemoveIcon});
        contextmenu.push({name: 'separator'});
        contextmenu.push({name: 'download-file', title: '#{manage-contextmenu-downloadfile}', icon: Colibri.UI.ContextMenuDownloadIcon});
        args.item.contextmenu = contextmenu;
        args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.LB, Colibri.UI.ContextMenu.LT] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RT], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __clickOnFilesContextMenu(event, args) {
        const selection = this._folders.selected;
        if(!selection) {
            return;
        }

        const item = args?.item;
        const menuData = args.menuData;
        if(!menuData) {
            return false;
        }

        if(menuData.name == 'edit-file') {
        
            App.Prompt.Show('#{manage-files-messages-editfile}', {
                name: {
                    type: 'varchar',
                    component: 'Text',
                    default: item.value.name,
                    desc: '#{manage-files-fields-name-desc}',
                    note: '#{manage-files-fields-name-note}',
                    params: {
                        validate: [{
                            message: '#{manage-files-fields-name-validation1}',
                            method: '(field, validator) => !!field.value'
                        }]
                    }
                }
            }, '#{manage-files-messages-editfile-save}').then((data) => {
                Manage.RenameFile(selection.tag.path, item.value.name, data.name);
                item.Dispose();
            });

        }
        else if(menuData.name == 'remove-file') {
            App.Confirm.Show('#{manage-files-messages-removefile}', '#{manage-files-messages-removefilemessage}', '#{manage-files-messages-removefilemessage-delete}').then(() => {
                Manage.RemoveFile(item.value.path);
                item.Dispose();
            });
        }
        else if(menuData.name == 'download-file') {
            DownloadFileByPath(item.value.path);
        }

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __foldersNodeEditCompleted(event, args) {
        
        const node = args.node;
        const mode = args.mode;
        const value = args.value;
        const parentNode = node.parentNode;
        if(node.tag?.new) {
            // добавляем
            node.Dispose();
            if(mode == 'save') {
                Manage.CreateFolder(parentNode.tag.path + value + '/');
            }
            else {
                parentNode.isLeaf = parentNode.nodes.children == 0;
                if(parentNode.isLeaf) {
                    parentNode.Collapse();
                }
                this._folders.selected = parentNode;
            }
        }
        else {
            if(mode == 'save') {
                const path = node.tag.path;
                node.Dispose();
                Manage.RenameFolder(path, parentNode.tag.path + value + '/');
            }
        }
    }

    /**
     * Is component got multiple values
     * @type {boolean}
     */
    set multiple(value) {
        this._files.showCheckboxes = value === true || value === 'true';
    } 

    /**
     * Is component got multiple values
     * @type {boolean}
     */
    get multiple() {
        return this._files.showCheckboxes;
    }

    /**
     * Is component editable
     * @type {boolean}
     */
    set editable(value) {
        const buttonsPane = this.Children('split/files-pane/buttons-pane');
        buttonsPane.shown = value === true || value === 'true';
        if(!buttonsPane.shown) {
            this.AddClass('-readonly');
        }
        else {
            this.RemoveClass('-readonly');
        }
    } 

    /**
     * Is component editable
     * @type {boolean}
     */
    get editable() {
        const buttonsPane = this.Children('split/files-pane/buttons-pane');
        return buttonsPane.shown;
    }

    /**
     * Is component selected
     * @type {boolean}
     */
    get selected() {
        return this._files.selected;
    }

    /**
     * Is component checked
     * @type {boolean}
     */
    get checked() {
        return this._files.checked;
    }

    /**
     * Get files
     * @type {Array}
     */
    get files() {
        const files = [];
        if(this._files.selected) {
            files.push(this._files.selected.value);
        }
        for(const file of this._files.checked) {
            files.push(file.value);
        }
        return files;
    }

    /**
     * Clear selection
     * @public
     */
    ClearSelection() {
        this._folders.selected = null;
        // this._files.UncheckAllRows();
        // this._files.UncheckAllRows();
    }

    /**
     * Enable files pane
     * @private
     */
    _enableFilesPane() {
        
        const selection = this._folders.selected;
        const folder = selection?.tag;

        const filesSelected = this._files.selected;
        const filesChecked = this._files.checked;
        
        this._searchInput.enabled = selection && folder !== null;
        this._files.enabled = selection && folder !== null;
        this._uploadFile.enabled = selection && folder !== null;
        this._editFile.enabled = (!!filesSelected || filesChecked.length == 1);
        this._deleteFile.enabled = (!!filesSelected || filesChecked.length > 0);

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __checkChangedOnFiles(event, args) {
        this._enableFilesPane();
        this.Dispatch('SelectionChanged', {});
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __filesSelectionChanged(event, args) {
        this._enableFilesPane();
        this.Dispatch('SelectionChanged', {});
    }
    
    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __foldersSelectionChanged(event, args) {

        const selection = this._folders.selected;
        const folder = selection?.tag;
        if(!folder) {
            this._files.ClearAllRows();
            return false;
        }

        this._enableFilesPane();

        this._files.UnselectAllRows();
        this._files.UncheckAllRows();

        Manage.Files(folder.path, this._searchInput.value, true).then(response => {
            const files = response.result;
            Manage.Store.Set('manage.files', response.result);
            this._files.value = files;
        });
        this.Dispatch('SelectionChanged', {});

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __addDataButtonClicked(event, args) {
        const selected = this._folders.selected;
        if(!selected) {
            return;
        }
        const folder = selected.tag;
        if(!folder) {
            return ;
        }

        if(args.errors.length > 0) {
            for(const error of args.errors) {
                App.Notices.Add(new Colibri.UI.Notice(error.error));
            }
        }
        if(args.success.length > 0) {
            Manage.UploadFiles(folder.path, args.success);
        }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __editDataButtonClicked(event, args) {

        if(!this.editable) {
            return;
        }
        
        const selection = this._folders.selected;
        let item = this._files.selected;
        if(!item) {
            item = this._files.checked[0];
        }

        App.Prompt.Show('#{manage-files-messages-editfile}', {
            name: {
                type: 'varchar',
                component: 'Text',
                default: item.value.name,
                desc: '#{manage-files-fields-name-desc}',
                note: '#{manage-files-fields-name-note}',
                params: {
                    validate: [{
                        message: '#{manage-files-fields-name-validation1}',
                        method: '(field, validator) => !!field.value'
                    }]
                }
            }
        }, '#{manage-files-messages-editfile-save}').then((data) => {
            Manage.RenameFile(selection.tag.path, item.value.name, data.name);
            item.Dispose();
        }).catch(e => console.log(e));

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __deleteDataButtonClicked(event, args) {

        const folder = this._folders.selected;
        const files = [];
        if(this._files.selected) {
            files.push(this._files.selected.value);
        }
        for(const file of this._files.checked) {
            files.push(file.value);
        }

        let paths = files.map(f => f.path);
        App.Confirm.Show('#{manage-files-messages-removefile}', '#{manage-files-messages-removefilemessage}', '#{manage-files-messages-removefilemessage-delete}').then(() => {
            Manage.RemoveFile(paths);
            if(this._files.selected) {
                this._files.selected.Dispose();
            }
            for(const file of this._files.checked) {
                file.Dispose();
            }
        }).catch(e => console.log(e));

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __filesDoubleClicked(event, args) {
        this.__editDataButtonClicked(event, args);
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __searchInputFilled(event, args) {

        const selected = this._folders.selected;
        const folder = selected?.tag;
        if(!folder) {
            this._files.ClearAllRows();
            return;
        }

        Manage.Files(folder.path, this._searchInput.value, true).then(response => {
            const files = response.result;
            Manage.Store.Set('manage.files', response.result);
            this._files.value = files;
        });

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dropContainerFileDropped(event, args) {
        const selected = this._folders.selected;
        if(!selected) {
            return;
        }
        const folder = selected.tag;
        if(!folder) {
            return ;
        }

        if(args.errors.length > 0) {
            for(const error of args.errors) {
                App.Notices.Add(new Colibri.UI.Notice(error.error));
            }
        }
        if(args.success.length > 0) {
            Manage.UploadFiles(folder.path, args.success);
        }

    }

}

