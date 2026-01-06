import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { create } from "zustand";

export interface GroupRequest {
  requestId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface GroupMember extends Tables<"profiles"> {
  memberId: string;
  isAdmin: boolean;
  color: string;
}

export interface InvitedMember extends Tables<"profiles"> {
  memberId: string;
}

export interface Group extends Tables<"group"> {
  appointments: Tables<"group_appointment">[];
  groupTasks: Tables<"group_task">[];
  recurringGroupTasks: Tables<"recurring_group_task">[];
  members: GroupMember[];
  invitedMembers: InvitedMember[];
}

interface GroupState {
  groups: Group[];
  groupRequests: GroupRequest[];
  activeGroupId: string | null;
  isFetching: boolean;
  lastFetch: Date | null;
  selectedDate: Date | null;
  isDateChanged: boolean;
  initialized: boolean | null;
  abortController: AbortController | null;
}

interface GroupActions {
  resetStore: () => void;
  fetchGroupData: () => Promise<void>;
  fetchIfStale: (intervalMs?: number) => Promise<void>;
  abortFetch: () => void;
  addGroup: (
    group: TablesInsert<"group">,
    color: null | string,
    memberIds?: string[]
  ) => Promise<boolean>;
  updateGroup: (
    group: TablesUpdate<"group">,
    memberIds?: string[]
  ) => Promise<boolean>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  addGroupMembers: (groupId: string, memberIds: string[]) => Promise<boolean>;
  updateGroupMember: (
    groupId: string,
    memberId: string,
    isAdmin?: boolean,
    color?: string
  ) => Promise<boolean>;
  addAppointment: (
    appointment: TablesInsert<"group_appointment">
  ) => Promise<boolean>;
  updateAppointment: (
    appointment: TablesUpdate<"group_appointment">
  ) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  setActiveGroup: (id: string) => void;
  answerGroupRequest: (
    requestId: string,
    answer: boolean,
    color: null | string
  ) => void;
  addSingleGroupTask: (task: TablesInsert<"group_task">) => Promise<boolean>;
  addRecurringGroupTask: (
    task: TablesInsert<"recurring_group_task">
  ) => Promise<boolean>;
  setSelectedDate: (date: Date) => void;
}

export const useGroupStore = create<GroupState & GroupActions>()(
  (set, get) => ({
    groups: [],
    groupRequests: [],
    activeGroupId: null,
    isFetching: false,
    lastFetch: null,
    selectedDate: null,
    isDateChanged: false,
    initialized: null,
    abortController: null,
    resetStore: () =>
      set({
        groups: [],
        groupRequests: [],
        activeGroupId: null,
        isFetching: false,
        lastFetch: null,
        selectedDate: null,
        isDateChanged: false,
        initialized: null,
        abortController: null,
      }),
    fetchIfStale: async (intervalMs = 5 * 60 * 1000) => {
      const { lastFetch, isFetching, abortController } = get();
      const now = Date.now();
      const last = lastFetch ? new Date(lastFetch).getTime() : 0;
      const stale = !lastFetch || now - last > intervalMs;
      if (!stale || isFetching) return;

      // Abort any existing fetch
      if (abortController) {
        abortController.abort();
      }

      await get().fetchGroupData();
    },
    fetchGroupData: async () => {},

    abortFetch() {
      const { abortController } = get();
      if (abortController) {
        abortController.abort();
        set({ isFetching: false, abortController: null });
      }
    },

    addGroup: async (_group, _color, _memberIds) => {
      // const { groups } = get();
      // const response = await actions.createGroup({ group, memberIds, color });

      // if (response.success) {
      //   const newGroup: Group = {
      //     ...response.data.group,
      //     groceryItems: [],
      //     appointments: [],
      //     groupTasks: [],
      //     recurringGroupTasks: [],
      //     members: [
      //       {
      //         ...response.data.admin,
      //         isAdmin: true,
      //         color: color || "#40c057",
      //         memberId: response.data.admin.memberId,
      //       },
      //     ],
      //     invitedMembers: response.data.invitedMembers,
      //   };
      //   const newGroups: Group[] = [...groups, newGroup];
      //   set({ groups: newGroups, activeGroupId: newGroup.id });
      //   return true;
      // }
      return true;
    },

    updateGroup: async (_group, _memberIds) => {
      // const { groups } = get();

      // const response = await actions.updateGroup({ group, memberIds });
      // if (response.success) {
      //   const newGroups = groups.map((g) =>
      //     g.id === group.id
      //       ? {
      //           ...g,
      //           ...response.data.group,
      //           invitedMembers: [
      //             ...g.invitedMembers,
      //             ...(response.data.invitedMembers || []),
      //           ],
      //         }
      //       : g
      //   );
      //   set({ groups: newGroups });
      //   return true;
      // }
      // return response.success;
      return false;
    },
    updateGroupMember: async (_groupId, _memberId, _isAdmin, _color) => {
      // const newMember: TablesUpdate<"group_member"> = {
      //   user_id: memberId,
      //   group_id: groupId,
      //   is_Admin: isAdmin,
      //   color: color,
      // };
      // const response = await actions.updateGroupMember(newMember);
      // const { groups } = get();
      // if (response.success) {
      //   const newGroups = groups.map((g) =>
      //     g.id === groupId
      //       ? {
      //           ...g,
      //           members: g.members.map((m) =>
      //             m.id === memberId
      //               ? {
      //                   ...m,
      //                   isAdmin: isAdmin || false,
      //                   color: color || "#40c057",
      //                 }
      //               : m
      //           ),
      //         }
      //       : g
      //   );
      //   set({ groups: newGroups });
      //   return true;
      // }
      return false;
    },
    deleteGroup: async (_groupId) => {
      // const { groups } = get();
      // const response = await actions.deleteGroup({ groupId });
      // if (response.success) {
      //   const newGroups = groups.filter((g) => g.id !== groupId);
      //   const newActiveGroupId = newGroups[0]?.id || null;
      //   set({ groups: newGroups, activeGroupId: newActiveGroupId });
      //   return true;
      // }
      return false;
    },
    addGroupMembers: async (_groupId, _memberIds) => {
      // const { groups } = get();
      // const response = await actions.insertGroupMembers(groupId, memberIds);
      // if (response.success) {
      //   const newGroups = groups.map((g) =>
      //     g.id === groupId
      //       ? {
      //           ...g,
      //           members: [
      //             ...g.members,
      //             ...response.data.map((m) => ({
      //               ...m,
      //               isAdmin: false,
      //               color: "#40c057",
      //               memberId: m.memberId,
      //             })),
      //           ],
      //         }
      //       : g
      //   );
      //   set({ groups: newGroups });
      //   return true;
      // }
      return false;
    },
    setActiveGroup: (id: string) => {
      set({ activeGroupId: id });
    },
    answerGroupRequest: async (
      _requestId: string,
      _answer: boolean,
      _color: null | string
    ) => {
        // const { groupRequests, groups } = get();
        // if (answer) {
        //   const response = await actions.acceptGroupRequest({
        //     groupRequestId: requestId,
        //     color,
        //   });
        //   if (response.success) {
        //     const groupResponse = await actions.getGroupById(
        //       response.data.groupId
        //     );
        //     if (groupResponse.success) {
        //       const newGroups = [...groups, groupResponse.data];
        //       set({ groups: newGroups, activeGroupId: groupResponse.data.id });
        //     }
        //     const newGroupRequests = groupRequests.filter(
        //       (r) => r.requestId !== requestId
        //     );
        //     set({ groupRequests: newGroupRequests });
        //   }
        // } else {
        //   const response = await actions.declineGroupRequest({
        //     groupRequestId: requestId,
        //   });
        //   if (response.success) {
        //     const newGroupRequests = groupRequests.filter(
        //       (r) => r.requestId !== requestId
        //     );
        //     set({ groupRequests: newGroupRequests });
        //   }
        // }
    },
    addSingleGroupTask: async (_task) => {
      // const { groups } = get();
      // const response = await actions.createSingleGroupTask(task);
      // if (response.success) {
      //   const newGroups = groups.map((g) =>
      //     g.id === task.group_id
      //       ? { ...g, groupTasks: [...g.groupTasks, response.data] }
      //       : g
      //   );
      //   set({ groups: newGroups });
      //   return true;
      // }
      return false;
    },
    addRecurringGroupTask: async (_task) => {
      // const { groups } = get();
      // const response = await actions.createRecurringGroupTask(task);
      // if (response.success) {
      //   const newGroups = groups.map((g) =>
      //     g.id === task.group_id
      //       ? {
      //           ...g,
      //           recurringGroupTasks: [...g.recurringGroupTasks, response.data],
      //         }
      //       : g
      //   );
      //   set({ groups: newGroups });
      //   return true;
      // }
      return false;
    },
    addAppointment: async (_appointment) => {
      // const { groups } = get();
      // const response = await actions.createGroupAppointment(appointment);
      // if (response.success) {
      //   const newGroups = groups.map((g) =>
      //     g.id === appointment.group_id
      //       ? { ...g, appointments: [...g.appointments, response.data] }
      //       : g
      //   );
      //   set({ groups: newGroups });

      //   return true;
      // }
      return false;
    },
    updateAppointment: async (_appointment) => {
      // const response = await actions.updateGroupAppointment(appointment);
      const response = false;
      if (response) {
        return true;
      }
      return false;
    },
    deleteAppointment: async (_id) => {
      // const response = await actions.deleteGroupAppointment(id);
      const response = false;
      if (response) {
        return true;
      }
      return false;
    },
    setSelectedDate: (date: Date) => {
      set({ selectedDate: date, isDateChanged: true });
    },
  })
);

export default useGroupStore;
