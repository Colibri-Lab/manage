App.Modules.Manage.UI.FoldersTree = class extends Colibri.UI.Tree {
    
    constructor(name, container) {
        super(name, container);
        this._foldersList = [];
        this._startPath = App.Store.Query('app.settings.res');
    }

    _findLevel(parent) {
        let ret = [];
        this._foldersList.forEach((folder) => {
            if(folder?.parent == parent) {
                folder.isLeaf = this._findLevel(folder.path).length === 0;
                ret.push(folder);
            }
        });
        return ret;
    }

    _renderLevel(node, parent) {

        const folders = this._findLevel(parent);
        folders.forEach((folder) => {
            let newNode = this.FindNode(folder.path.replaceAll('/', '_'));
            if(!newNode) {
                newNode = node.nodes.Add(folder.path.replaceAll('/', '_'));
            }
            newNode.text = folder.name;
            newNode.isLeaf = folder.isLeaf;
            newNode.icon = App.Modules.Tools.Icons.FolderIcon;
            newNode.tag = folder;
            newNode.editable = true;
            

            if(folder.parent == this._startPath) {
                newNode.parentNode = this.FindNode('root');
            }
            else if(folder.parent != newNode.parentNode?.tag?.path) {
                const parentNode = this.FindNode(folder.parent.replaceAll('/', '_'));
                newNode.parentNode = parentNode;
                parentNode.Expand();
            }

            this._renderLevel(newNode, folder.path);

        });

    }

    _removeUnexistent() {
        this.allNodes.forEach((node) => {
            if(node.tag?.path === this._startPath) {
                return true;
            }
            if(this._foldersList.indexOf(node.tag) === -1) {
                node.Dispose();
            }
        });
    }

    __renderBoundedValues(data) {

        if(!data) {
            return;
        }

        if(!Array.isArray(data) && data instanceof Object) {
            data = Object.values(data);
        }

        const selected = this.selected;
        this._foldersList = data;

        let newNode = this.FindNode('root');
        if(!newNode) {
            newNode = this.nodes.Add('root');
        }
        newNode.text = 'Ресурсы';
        newNode.isLeaf = false;
        newNode.icon = App.Modules.Tools.Icons.FolderIcon;
        newNode.tag = {path: this._startPath, name: ''};

        this._renderLevel(newNode, this._startPath);
        newNode.Expand();

        this._removeUnexistent();
        if(!selected) {
            this.selected = newNode;
        }

    }

    
    AddNew(parent, title, tag) {
        const node = parent.nodes.Add('new');
        node.text = title;
        node.isLeaf = true;
        node.icon = App.Modules.Tools.Icons.FolderIcon;
        node.tag = tag;
        return node;
    }
    
}