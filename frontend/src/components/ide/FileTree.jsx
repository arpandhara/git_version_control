import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FilePlus, FolderPlus, Trash2, RefreshCw } from 'lucide-react';

const FileTreeNode = ({ node, onFileClick, onDeleteClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isFolder = node.type === 'folder';

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      if (onFileClick) onFileClick(node.path);
    }
  };

  return (
    <div className="select-none">
      <div
        className="group flex cursor-pointer items-center gap-1 hover:bg-gray-200 px-2 py-1 text-sm text-gray-700"
        onClick={handleClick}
      >
        {isFolder ? (
          isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />
        ) : (
          <span className="w-3.5 inline-block" /> /* spacer for files */
        )}
        
        {isFolder ? (
          <Folder size={14} className="text-blue-500 fill-blue-100" />
        ) : (
          <File size={14} className="text-gray-500" />
        )}
        
        <span className="flex-1 truncate">{node.name}</span>

        {/* Delete action (visible on hover) */}
        <div 
            className="hidden group-hover:flex items-center"
            onClick={(e) => {
                e.stopPropagation();
                if (onDeleteClick) onDeleteClick(node.path);
            }}
        >
            <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
        </div>
      </div>
      
      {isFolder && isOpen && node.children && (
        <div className="ml-3 border-l border-gray-200">
          {node.children.map((childNode) => (
            <FileTreeNode 
              key={childNode.path} 
              node={childNode} 
              onFileClick={onFileClick} 
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileTree({ tree, onFileClick, onCreateFile, onCreateFolder, onDeleteClick, onRefresh }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('file'); // 'file' or 'folder'

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    if (newItemType === 'file' && onCreateFile) {
        onCreateFile(newItemName);
    } else if (newItemType === 'folder' && onCreateFolder) {
        onCreateFolder(newItemName);
    }
    
    setIsCreating(false);
    setNewItemName('');
  };

  return (
    <div className="flex h-full flex-col bg-[#f8f9fa] border-r border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Explorer</h2>
        <div className="flex items-center gap-2">
          <button 
            title="Refresh" 
            className="text-gray-400 hover:text-gray-700"
            onClick={onRefresh}
          >
            <RefreshCw size={14} />
          </button>
          <button 
            title="New File" 
            className="text-gray-400 hover:text-gray-700"
            onClick={() => { setIsCreating(true); setNewItemType('file'); }}
          >
            <FilePlus size={14} />
          </button>
          <button 
            title="New Folder" 
            className="text-gray-400 hover:text-gray-700"
            onClick={() => { setIsCreating(true); setNewItemType('folder'); }}
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-2">
        {isCreating && (
          <div className="px-4 py-1 flex items-center gap-2">
             {newItemType === 'folder' ? <Folder size={14} className="text-blue-500" /> : <File size={14} className="text-gray-500" />}
             <form onSubmit={handleCreateSubmit} className="flex-1">
                <input 
                    autoFocus
                    type="text" 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onBlur={() => setIsCreating(false)}
                    className="w-full text-sm outline-none border border-blue-400 px-1 py-0.5 rounded-sm"
                    placeholder={`new ${newItemType}...`}
                />
             </form>
          </div>
        )}
        
        {tree && tree.length > 0 ? (
          tree.map((node) => (
            <FileTreeNode 
              key={node.path} 
              node={node} 
              onFileClick={onFileClick} 
              onDeleteClick={onDeleteClick}
            />
          ))
        ) : (
          !isCreating && (
            <div className="px-4 py-2 text-sm text-gray-400 italic">No files in workspace.</div>
          )
        )}
      </div>
    </div>
  );
}
