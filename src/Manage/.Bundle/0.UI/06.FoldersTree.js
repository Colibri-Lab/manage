/**
 * Folders tree component
 * @class
 * @memberof App.Modules.Manage.UI
 * @extends Colibri.UI.Tree
 */
App.Modules.Manage.UI.FoldersTree = class extends Colibri.UI.Tree {
    
    /**
     * Constructor
     * @constructor
     * @param {string} name component name
     * @param {Colibri.UI.IContainer} container component container
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-manage-folders-tree-component');

        this._foldersList = [];
        this._startPath = App.Store.Query('app.settings.res');
    }

    /**
     * @ignore
     * @private
     * @param {string} parent 
     * @returns {Array}
     */
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

    /**
     * @ignore
     * @private
     * @param {Colibri.UI.TreeNode} node 
     * @param {string} parent 
     */
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
            newNode.AddClass('app-manage-folders-tree-folder-node');
            

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

    /**
     * @ignore
     * @private
     */
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

    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path 
     */
    __renderBoundedValues(data, path) {

        if(!data) {
            return;
        }

        if(Object.isObject(data)) {
            data = Object.values(data);
        }

        const selected = this.selected;
        this._foldersList = data;

        let newNode = this.FindNode('root');
        if(!newNode) {
            newNode = this.nodes.Add('root');
        }
        newNode.text = '#{manage-folderstree-resources}';
        newNode.isLeaf = false;
        newNode.icon = App.Modules.Tools.Icons.FolderIcon;
        newNode.tag = {path: this._startPath, name: ''};
        newNode.AddClass('app-manage-folders-tree-folder-node');

        this._renderLevel(newNode, this._startPath);
        newNode.Expand();

        this._removeUnexistent();
        if(selected) {
            this.selected = selected;
        } else {
            this.selected = null;
        }

    }

    /**
     * Adds a new node to the tree
     * @param {Colibri.UI.TreeNode} parent 
     * @param {string} title 
     * @param {string} tag
     * @returns {Colibri.UI.TreeNode}
     */
    AddNew(parent, title, tag) {
        const node = parent.nodes.Add('new');
        node.text = title;
        node.isLeaf = true;
        node.icon = App.Modules.Tools.Icons.FolderIcon;
        node.tag = tag;
        return node;
    }
    
}