import { ProjectTreeItem } from "@/types/work.types";
import { Tables } from "@/types/db.types";

interface SortResult {
  sortedTree: ProjectTreeItem[];
  changedNodes: ProjectTreeItem[];
}

interface TreeOperationResult {
  tree: ProjectTreeItem[];
  changedNodes: ProjectTreeItem[];
}

// Shared helper function for inserting nodes at specific positions
function insertNodeAtPosition(
  nodes: ProjectTreeItem[],
  nodeToInsert: ProjectTreeItem,
  targetIndex: number
): { updatedNodes: ProjectTreeItem[]; changedNodes: ProjectTreeItem[] } {
  const changedNodes: ProjectTreeItem[] = [];

  // Füge den Knoten an der spezifischen Position ein
  const newNodes = [...nodes];
  newNodes.splice(targetIndex, 0, nodeToInsert);

  // Aktualisiere die Indizes der nachfolgenden Knoten
  const updatedNodes = newNodes.map((node, idx) => {
    if (idx > targetIndex) {
      const updatedNode = { ...node, index: idx };

      changedNodes.push(updatedNode);
      return updatedNode;
    }
    return node;
  });

  return { updatedNodes, changedNodes };
}

// Shared helper function for inserting nodes into specific folders
function insertNodeIntoFolder(
  nodes: ProjectTreeItem[],
  targetFolderId: string,
  nodeToInsert: ProjectTreeItem,
  targetIndex: number
): { updatedNodes: ProjectTreeItem[]; changedNodes: ProjectTreeItem[] } {
  const changedNodes: ProjectTreeItem[] = [];

  const updatedNodes = nodes.map((node) => {
    if (node.id === targetFolderId && node.type === "folder") {
      // Füge den neuen Knoten an der spezifischen Position ein
      const children = [...(node.children || [])];
      const nodeToAdd = {
        ...nodeToInsert,
        index: targetIndex,
      };

      // Füge den neuen Knoten zur changedNodes Liste hinzu
      changedNodes.push(nodeToAdd);

      // Verwende die shared helper function
      const { updatedNodes: updatedChildren, changedNodes: childChanges } =
        insertNodeAtPosition(children, nodeToAdd, targetIndex);

      changedNodes.push(...childChanges);

      return {
        ...node,
        children: updatedChildren,
      };
    } else if (node.children) {
      const { updatedNodes: updatedChildren, changedNodes: childChanges } =
        insertNodeIntoFolder(
          node.children,
          targetFolderId,
          nodeToInsert,
          targetIndex
        );

      changedNodes.push(...childChanges);

      return {
        ...node,
        children: updatedChildren,
      };
    }
    return node;
  });

  return { updatedNodes, changedNodes };
}

export function createTree( 
  projects: Tables<"timer_project">[],
  folders: Tables<"timer_project_folder">[]
): TreeOperationResult {
  const folderMap = new Map();

  // 1. Füge alle Ordner als leere Knoten ein
  folders.forEach((folder) => {
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.title,
      index: folder.order_index,
      type: "folder",
      children: [],
    });
  });

  // 2. Ordne die Ordner ihrer Eltern zu (für verschachtelte Struktur)
  folders.forEach((folder) => {
    if (folder.parent_folder && folderMap.has(folder.parent_folder)) {
      folderMap
        .get(folder.parent_folder)
        .children.push(folderMap.get(folder.id));
    }
  });

  // 3. Füge Projekte in ihre jeweiligen Ordner
  projects.forEach((project) => {
    const folderId = project.folder_id;
    if (folderId && folderMap.has(folderId)) {
      folderMap.get(folderId).children.push({
        id: project.id,
        name: project.title,
        index: project.order_index,
        type: "project",
      });
    }
  });

  // 4. Gib nur die Root-Ordner (ohne parent_folder) zurück
  const root: ProjectTreeItem[] = [];

  projects.forEach((project) => {
    if (!project.folder_id) {
      root.push({
        id: project.id,
        name: project.title,
        type: "project",
        index: project.order_index,
      });
    }
  });

  folders.forEach((folder) => {
    if (!folder.parent_folder) {
      root.push(folderMap.get(folder.id));
    }
  });

  const result = sortAndIndex(root);
  return {
    tree: result.sortedTree,
    changedNodes: result.changedNodes,
  };
}

function sortAndIndex(nodes: ProjectTreeItem[]): SortResult {
  // Sort by index, then by name alphabetically
  const sorted = [...nodes].sort((a, b) => {
    if (a.index !== b.index) {
      return a.index - b.index;
    }
    // fallback: sort by name
    return (a.name || "").localeCompare(b.name || "");
  });

  const changedNodes: ProjectTreeItem[] = [];

  // Assign new index and recursively sort children
  const sortedTree = sorted.map((node, idx) => {
    const newNode: ProjectTreeItem = {
      ...node,
      index: idx,
    };

    // Check if index changed
    if (node.index !== idx) {
      changedNodes.push(newNode);
    }

    if (node.children && node.children.length > 0) {
      const childResult = sortAndIndex(node.children);
      newNode.children = childResult.sortedTree;
      changedNodes.push(...childResult.changedNodes);
    }

    return newNode;
  });

  return {
    sortedTree,
    changedNodes,
  };
}

export function deleteNode(
  tree: ProjectTreeItem[],
  id: string
): TreeOperationResult {
  const filteredTree = tree
    .filter((node) => node.id !== id)
    .map((node) =>
      node.children
        ? { ...node, children: deleteNode(node.children, id).tree }
        : node
    );

  // Sort and collect changes after deletion
  const sortResult = sortAndIndex(filteredTree);
  return {
    tree: sortResult.sortedTree,
    changedNodes: sortResult.changedNodes,
  };
}

export function renameNode(
  tree: ProjectTreeItem[],
  id: string,
  newName: string
): ProjectTreeItem[] {
  return tree.map((node) => {
    if (node.id === id) {
      return { ...node, name: newName };
    }
    if (node.children) {
      return { ...node, children: renameNode(node.children, id, newName) };
    }
    return node;
  });
}

// Hilfsfunktion um zu prüfen, ob ein Ordner ein Kind des zu verschiebenden Ordners ist
function isChildOf(
  tree: ProjectTreeItem[],
  parentId: string,
  childId: string
): boolean {
  for (const node of tree) {
    if (node.id === parentId && node.children) {
      // Prüfe direkt die Kinder
      for (const child of node.children) {
        if (child.id === childId) {
          return true;
        }
        // Rekursiv in den Unterordnern suchen
        if (child.children && isChildOf(child.children, child.id, childId)) {
          return true;
        }
      }
    }
    // Rekursiv in den Kindern suchen
    if (node.children && isChildOf(node.children, parentId, childId)) {
      return true;
    }
  }
  return false;
}

export function findNodeById(
  tree: ProjectTreeItem[],
  id: string
): ProjectTreeItem | null {
  for (const item of tree) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findNodeById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function moveNode(
  tree: ProjectTreeItem[],
  nodeId: string,
  targetFolderId: string | null,
  index: number
): TreeOperationResult {
  let nodeToMove: ProjectTreeItem | null = null;
  const changedNodes: ProjectTreeItem[] = [];

  const nodeToMoveFound = findNodeById(tree, nodeId);

  // Validierung: Prüfe, ob der Zielordner ein Kind des zu verschiebenden Ordners ist
  if (nodeToMoveFound?.type === "folder" && targetFolderId !== null) {
    if (isChildOf(tree, nodeId, targetFolderId)) {
      // Wirf einen Fehler oder gib ein spezielles Ergebnis zurück
      return {
        tree: tree,
        changedNodes: [],
      };
    }
  }

  function removeNode(nodes: ProjectTreeItem[]): ProjectTreeItem[] {
    return nodes
      .filter((node) => {
        if (node.id === nodeId) {
          nodeToMove = node;
          return false;
        }
        return true;
      })
      .map((node) =>
        node.children ? { ...node, children: removeNode(node.children) } : node
      );
  }

  let treeWithoutNode = removeNode(tree);

  if (targetFolderId === null) {
    // Wenn der Knoten auf Root-Ebene verschoben wird
    const movedNode = {
      ...nodeToMove!,
      index: index,
    };

    // Verwende die shared helper function
    const { updatedNodes, changedNodes: insertChanges } = insertNodeAtPosition(
      treeWithoutNode,
      movedNode,
      index
    );

    changedNodes.push(movedNode);
    changedNodes.push(...insertChanges);

    return {
      tree: updatedNodes,
      changedNodes: changedNodes,
    };
  }

  // Wenn der Knoten in einen Ordner verschoben wird
  const { updatedNodes, changedNodes: insertChanges } = insertNodeIntoFolder(
    treeWithoutNode,
    targetFolderId,
    nodeToMove!,
    index
  );

  changedNodes.push(...insertChanges);

  return {
    tree: updatedNodes,
    changedNodes: changedNodes,
  };
}

export function addNode(
  tree: ProjectTreeItem[],
  parentId: string | null, // null = auf Root-Ebene einfügen
  newNode: ProjectTreeItem,
  index: number // Neue Position für den Knoten
): TreeOperationResult {
  const changedNodes: ProjectTreeItem[] = [];

  if (parentId === null) {
    // Füge den neuen Knoten an der spezifischen Position ein
    const nodeToAdd = {
      ...newNode,
      index: index,
    };

    // Verwende die shared helper function
    const { updatedNodes, changedNodes: insertChanges } = insertNodeAtPosition(
      tree,
      nodeToAdd,
      index
    );

    changedNodes.push(nodeToAdd);
    changedNodes.push(...insertChanges);

    return {
      tree: updatedNodes,
      changedNodes: changedNodes,
    };
  } else {
    // Verwende die shared helper function für Ordner
    const { updatedNodes, changedNodes: insertChanges } = insertNodeIntoFolder(
      tree,
      parentId,
      newNode,
      index
    );

    changedNodes.push(...insertChanges);

    return {
      tree: updatedNodes,
      changedNodes: changedNodes,
    };
  }
}
