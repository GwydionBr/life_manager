import { useMemo } from "react";

import {
  useWorkProjects,
  workProjectsCollection,
} from "@/db/collections/work/work-project/work-project-collection";
import {
  useWorkFolders,
  workFoldersCollection,
} from "@/db/collections/work/work-foler/work-folder-collection";
import { createTree, moveNode } from "@/lib/treeHelperFunctions";
import {
  ProjectTreeItem,
  UpdateWorkProject,
  UpdateWorkFolder,
} from "@/types/work.types";

export const useWorkTree = () => {
  const projects = useWorkProjects();
  const { data: folders } = useWorkFolders();

  const cleanedProjects = useMemo(() => {
    return projects?.map((project) => {
      const { categories, ...rest } = project;
      return rest;
    });
  }, [projects]);

  const projectTree = useMemo(() => {
    const { tree } = createTree(cleanedProjects, folders);
    return tree;
  }, [projects, folders]);

  const handleChangedNodes = (
    changedNodes: ProjectTreeItem[],
    folder_id?: string,
    project_id?: string
  ) => {
    const updatedFolders: UpdateWorkFolder[] = changedNodes
      .filter((node) => node.type === "folder" && node.id !== folder_id)
      .map((node) => ({
        id: node.id,
        order_index: node.index,
      }));
    const updatedProjects: UpdateWorkProject[] = changedNodes
      .filter((node) => node.type === "project" && node.id !== project_id)
      .map((node) => ({
        id: node.id,
        order_index: node.index,
        categories: null,
      }));
    for (const folder of updatedFolders) {
      workFoldersCollection.update(folder.id, (draft) => {
        draft.order_index = folder.order_index || 0;
        draft.parent_folder = folder.parent_folder || null;
      });
    }
    for (const project of updatedProjects) {
      workProjectsCollection.update(project.id, (draft) => {
        draft.order_index = project.order_index || 0;
        draft.folder_id = project.folder_id || null;
      });
    }
  };

  const moveFolder = async (
    folderId: string,
    newParentFolderId: string | null,
    index: number
  ) => {
    const { tree, changedNodes } = moveNode(
      projectTree,
      folderId,
      newParentFolderId,
      index
    );
    handleChangedNodes(changedNodes);

    workFoldersCollection.update(folderId, (draft) => {
      draft.parent_folder = newParentFolderId;
      draft.order_index = index;
    });
  };

  const moveProject = (
    projectId: string,
    newFolderId: string | null,
    index: number
  ) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return false;

    const { tree, changedNodes } = moveNode(
      projectTree,
      projectId,
      newFolderId,
      index
    );
    handleChangedNodes(changedNodes);

    workProjectsCollection.update(projectId, (draft) => {
      draft.folder_id = newFolderId;
      draft.order_index = index;
    });
  };

  return {
    projectTree,
    moveFolder,
    moveProject,
  };
};
