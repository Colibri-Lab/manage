
App.Modules.Manage.UI.RemoteFileManager = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Manage.UI.RemoteFileManager']);

        this.AddClass('app-remote-files-admin-page-component');

        this._drop = new Colibri.UI.FileDropManager(this.container);

        this._buckets = this.Children('split/buckets-pane/buckets');
        this._files = this.Children('split/data-pane/files');
        this._searchInput = this.Children('split/data-pane/search-pane/search-input');

        this._uploadFiles = this.Children('split/data-pane/buttons-pane/upload-file');
        this._deleteFile = this.Children('split/data-pane/buttons-pane/delete-file');

        this._buckets.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderBucketsContextMenu(event, args))
        this._buckets.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnBucketsContextMenu(event, args));        

        this._buckets.AddHandler('SelectionChanged', (event, args) => this.__bucketsSelectionChanged(event, args));

        this._files.AddHandler('ScrolledToBottom', (event, args) => this.__dataScrolledToBottom(event, args));
        this._files.AddHandler('SelectionChanged', (event, args) => this.__dataSelectionChanged(event, args));
        this._files.AddHandler('CheckChanged', (event, args) => this.__checkChangedOnData(event, args));
        this._files.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderDataContextMenu(event, args));
        this._files.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnDataContextMenu(event, args));        

        this._deleteFile.AddHandler('Clicked', (event, args) => this.__deleteDataButtonClicked(event, args));
        this._uploadFiles.AddHandler('Changed', (event, args) => this.__addDataButtonClicked(event, args));

        this._searchInput.AddHandler(['Filled', 'Cleared'], (event, args) => this.__searchInputFilled(event, args));
        this._drop.AddHandler('FileDropped', (event, args) => this.__dropContainerFileDropped(event, args));

    }

    /** @protected */
    _registerEvents() {
        this.RegisterEvent('SelectionChanged', false, 'Когда выбор файлов изменился');
    }
    
    _loadDataPage(bucket, searchTerm, page) {
        this._filesCurrentPage = page;
        Manage.RemoteFiles(bucket, searchTerm, page, 20);
    }

    
    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __searchInputFilled(event, args) {
        const selected = this._buckets.selected;
        if(!selected) {
            this._files.ClearAllRows(); 
            return;           
        }
        this._files.bucket = selected.tag;
        this._loadDataPage(selected?.tag, this._searchInput.value, 1);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __bucketsSelectionChanged(event, args) {
        const selection = this._buckets.selected;
        
        this._searchInput.enabled = selection != null;
        this._files.enabled = selection != null;
        this._files.UnselectAllRows();
        this._files.UncheckAllRows();
        this._uploadFiles.enabled = selection != null;
        this._deleteFile.enabled = false;

        this.__searchInputFilled(event, args);
        
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dataScrolledToBottom(event, args) {
        const selected = this._buckets.selected;
        this._loadDataPage(selected?.tag, this._searchInput.value, this._filesCurrentPage + 1);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dataSelectionChanged(event, args) {
        const checked = this._files.checked;
        const selected = this._files.selected;
        this._deleteFile.enabled = checked.length > 0 || !!selected;
        this.Dispatch('SelectionChanged', {});
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __checkChangedOnData(event, args) { 
        const checked = this._files.checked;
        const selected = this._files.selected;
        this._deleteFile.enabled = checked.length > 0 || !!selected;
        this.Dispatch('SelectionChanged', {});
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __deleteDataButtonClicked(event, args) {
        const selection = this._buckets.selected;
        const bucket = selection?.tag;
        if(!bucket) {
            return;
        }
        if(this._files.checked.length == 0) {
            App.Confirm.Show(
                '#{manage-remotefiles-messages-removefile}', 
                '#{manage-remotefiles-messages-removefile-message}', 
                '#{manage-remotefiles-messages-removefile-message-delete}'
            ).then(() => {
                Manage.DeleteFilesFromRemote(bucket, [this._files.selected.value.guid]);
            });
        }
        else {
            App.Confirm.Show(
                '#{manage-remotefiles-messages-removefiles}', 
                '#{manage-remotefiles-messages-removefiles-message}', 
                '#{manage-remotefiles-messages-removefiles-message-delete}'
            ).then(() => {
                let ids = [];
                this._files.checked.forEach((row) => {
                    ids.push(row.value.guid);
                });
                Manage.DeleteFilesFromRemote(bucket, ids);
            });
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __addDataButtonClicked(event, args) {

        const selected = this._buckets.selected;
        if(!selected) {
            return;
        }
        const bucket = selected.tag;
        if(!bucket) {
            return ;
        }

        if(args.errors.length > 0) {
            for(const error of args.errors) {
                App.Notices.Add(new Colibri.UI.Notice(error.error));
            }
        }
        if(args.success.length > 0) {
            Manage.UploadFilesToRemote(bucket, args.success);
        }
            

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dropContainerFileDropped(event, args) {
        const selected = this._buckets.selected;
        if(!selected) {
            return;
        }
        const bucket = selected.tag;
        if(!bucket) {
            return ;
        }

        if(args.errors.length > 0) {
            for(const error of args.errors) {
                App.Notices.Add(new Colibri.UI.Notice(error.error));
            }
        }
        if(args.success.length > 0) {
            Manage.UploadFilesToRemote(bucket, args.success);
        }

    }


    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __renderDataContextMenu(event, args) {
        let contextmenu = [];
        
        contextmenu.push({name: 'remove-file', title: '#{manage-contextmenu-deletefile}', icon: Colibri.UI.ContextMenuRemoveIcon});
        contextmenu.push({name: 'separator'});
        contextmenu.push({name: 'download-file', title: '#{manage-contextmenu-downloadfile}', icon: Colibri.UI.ContextMenuDownloadIcon});

        args.item.contextmenu = contextmenu;
        args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RB] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.LB], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __clickOnDataContextMenu(event, args) {

        const item = args?.item;
        const menuData = args.menuData;
        if(!menuData) {
            return false;
        }
        
        if(menuData.name == 'remove-file') {
            this._deleteFile.Dispatch('Clicked');
        }
        else if(menuData.name == 'download-file') {
            Manage.OpenFileByGuid(item.value.guid, item.value.bucket, item.value.ext);  
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __renderBucketsContextMenu(event, args) {
        
        let contextmenu = [];
        
        const itemData = args.item?.value;
        if(!itemData) {
            contextmenu.push({name: 'new-bucket', title: '#{manage-contextmenu-createbucket}', icon: Colibri.UI.ContextMenuAddIcon});

            this._buckets.contextmenu = contextmenu;
            this._buckets.ShowContextMenu(args.isContextMenuEvent ? 'right bottom' : 'left top', '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);

        }
        else {
            contextmenu.push({name: 'remove-bucket', title: '#{manage-contextmenu-deletebucket}', icon: Colibri.UI.ContextMenuRemoveIcon});

            args.item.contextmenu = contextmenu;
            args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RB] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.LB], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __clickOnBucketsContextMenu(event, args) {

        const item = args?.item;
        const menuData = args.menuData;
        if(!menuData) {
            return false;
        }
        
        if(menuData.name == 'new-bucket') {
            App.Prompt.Show('#{manage-remotefiles-messages-createbucket}', {
                name: {
                    type: 'varchar',
                    component: 'Text',
                    default: item?.value?.name ?? '',
                    desc: '#{manage-remotefiles-messages-createbucket-desc}',
                    note: 'Введите название корзины',
                    params: {
                        validate: [{
                            message: '#{manage-remotefiles-messages-createbucket-validate1}',
                            method: '(field, validator) => !!field.value'
                        }]
                    }
                }
            }, '#{manage-remotefiles-messages-createbucket-button}').then((data) => {
                Manage.CreateBucket(data.name);
            }).catch(e => console.log(e));
        }
        else if(menuData.name == 'remove-bucket') {
            App.Confirm.Show(
                '#{manage-remotefiles-messages-deletebucket}', 
                '#{manage-remotefiles-messages-deletebucket-message}', 
                '#{manage-remotefiles-messages-deletebucket-delete}'
            ).then(() => {
                Manage.RemoveBucket(item.tag);
                this._buckets.selected = null;
            });
        }

    }

    
    set multiple(value) {
        this._files.showCheckboxes = value === true || value === 'true';
    } 

    get multiple() {
        return this._files.showCheckboxes;
    }

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

    get editable() {
        const buttonsPane = this.Children('split/files-pane/buttons-pane');
        return buttonsPane.shown;
    }

    get selected() {
        return this._files.selected;
    }

    get checked() {
        return this._files.checked;
    }

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

    ClearSelection() {
        this._buckets.selected = null;
        // this._files.UncheckAllRows();
        // this._files.UncheckAllRows();
    }

}