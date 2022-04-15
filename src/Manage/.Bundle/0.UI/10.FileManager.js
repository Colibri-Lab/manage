
App.Modules.Manage.UI.FileManager = class extends Colibri.UI.Component {

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

        this._folders.AddHandler('SelectionChanged', (event, args) => this.__foldersSelectionChanged(event, args));      
        this._folders.AddHandler('NodeEditCompleted', (event, args) => this.__foldersNodeEditCompleted(event, args));
        this._folders.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderFoldersContextMenu(event, args))
        this._folders.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnFoldersContextMenu(event, args));        

        this._files.AddHandler('SelectionChanged', (event, args) => this.__filesSelectionChanged(event, args));      
        this._files.AddHandler('CheckChanged', (event, args) => this.__checkChangedOnFiles(event, args));
        this._files.AddHandler('ContextMenuIconClicked', (event, args) => this.__renderFilesContextMenu(event, args));
        this._files.AddHandler('ContextMenuItemClicked', (event, args) => this.__clickOnFilesContextMenu(event, args));        
        this._files.AddHandler('DoubleClicked', (event, args) => this.__filesDoubleClicked(event, args));

        this._uploadFile.AddHandler('FileChoosen', (event, args) => this.__addDataButtonClicked(event, args));
        this._editFile.AddHandler('Clicked', (event, args) => this.__editDataButtonClicked(event, args));
        this._deleteFile.AddHandler('Clicked', (event, args) => this.__deleteDataButtonClicked(event, args));

        this._searchInput.AddHandler(['Filled', 'Cleared'], (event, args) => this.__searchInputFilled(event, args));

        this._drop.AddHandler('FileDropped', (event, args) => this.__dropContainerFileDropped(event, args));

    }
    
    _registerEvents() {
        this.RegisterEvent('SelectionChanged', false, 'Когда выбор файлов изменился');
    }

    __renderFoldersContextMenu(event, args) {
        let contextmenu = [];
        
        const itemData = args.item?.tag;
        if(!itemData) {
            return;
        }
        else {
            contextmenu.push({name: 'new-folder', title: 'Новый раздел', icon: Colibri.UI.ContextMenuAddIcon});
            contextmenu.push({name: 'edit-folder', title: 'Редактировать раздел', icon: Colibri.UI.ContextMenuEditIcon});
            contextmenu.push({name: 'remove-folder', title: 'Удалить раздел', icon: Colibri.UI.ContextMenuRemoveIcon});

            args.item.contextmenu = contextmenu;
            args.item.ShowContextMenu(args.isContextMenuEvent ? 'right bottom' : 'left bottom', '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
        }
    }

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
            App.Confirm.Show('Удаление папки', 'Вы уверены, что хотите удалить папку? Внимание! Вместе с папкой будет удалено все ее содержание!', 'Удалить!').then(() => {
                Manage.RemoveFolder(item.tag.path);
                this._folders.selected = item.parentNode;
            });
        }

    }

    __renderFilesContextMenu(event, args) {
        
        const itemData = args.item?.value;
        if(!itemData) {
            return;
        }

        let contextmenu = [];
        contextmenu.push({name: 'edit-file', title: 'Редактировать файл', icon: Colibri.UI.ContextMenuEditIcon});
        contextmenu.push({name: 'remove-file', title: 'Удалить файл', icon: Colibri.UI.ContextMenuRemoveIcon});
        args.item.contextmenu = contextmenu;
        args.item.ShowContextMenu(args.isContextMenuEvent ? 'right bottom' : 'left bottom', '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
    }

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
        
            App.Prompt.Show('Редактирование названия файла', {
                name: {
                    type: 'varchar',
                    component: 'Text',
                    default: item.value.name,
                    desc: 'Название файла',
                    note: 'Введите название файла',
                    params: {
                        validate: [{
                            message: 'Пожалуйста, введите название файла!',
                            method: '(field, validator) => !!field.value'
                        }]
                    }
                }
            }, 'Сохранить').then((data) => {
                Manage.RenameFile(selection.tag.path, item.value.name, data.name);
                item.Dispose();
            });

        }
        else if(menuData.name == 'remove-file') {
            App.Confirm.Show('Удаление файла', 'Вы уверены, что хотите удалить файл?', 'Удалить!').then(() => {
                Manage.RemoveFile(item.value.path);
                item.Dispose();
            });
        }

    }

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
        this._folders.selected = null;
        // this._files.UncheckAllRows();
        // this._files.UncheckAllRows();
    }


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

    __checkChangedOnFiles(event, args) {
        this._enableFilesPane();
        this.Dispatch('SelectionChanged', {});
    }

    __filesSelectionChanged(event, args) {
        this._enableFilesPane();
        this.Dispatch('SelectionChanged', {});
    }
    
    __foldersSelectionChanged(event, args) {

        this._enableFilesPane();

        const selection = this._folders.selected;
        const folder = selection?.tag;
        if(!folder) {
            this._files.ClearAllRows();
            return false;
        }

        this._files.UnselectAllRows();
        this._files.UncheckAllRows();
        Manage.Files(folder.path, this._searchInput.value);
        this.Dispatch('SelectionChanged', {});

    }

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

    __editDataButtonClicked(event, args) {

        if(!this.editable) {
            return;
        }
        
        const selection = this._folders.selected;
        let item = this._files.selected;
        if(!item) {
            item = this._files.checked[0];
        }

        App.Prompt.Show('Редактирование названия файла', {
            name: {
                type: 'varchar',
                component: 'Text',
                default: item.value.name,
                desc: 'Название файла',
                note: 'Введите название файла',
                params: {
                    validate: [{
                        message: 'Пожалуйста, введите название файла!',
                        method: '(field, validator) => !!field.value'
                    }]
                }
            }
        }, 'Сохранить').then((data) => {
            Manage.RenameFile(selection.tag.path, item.value.name, data.name);
            item.Dispose();
        }).catch(e => console.log(e));

    }

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
        App.Confirm.Show('Удаление файла', 'Вы уверены, что хотите удалить файл?', 'Удалить!').then(() => {
            Manage.RemoveFile(paths);
            if(this._files.selected) {
                this._files.selected.Dispose();
            }
            for(const file of this._files.checked) {
                file.Dispose();
            }
        }).catch(e => console.log(e));

    }

    __filesDoubleClicked(event, args) {
        this.__editDataButtonClicked(event, args);
    }

    __searchInputFilled(event, args) {

        const selected = this._folders.selected;
        const folder = selected?.tag;
        if(!folder) {
            return;
        }

        Manage.Files(folder.path, this._searchInput.value);

    }

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