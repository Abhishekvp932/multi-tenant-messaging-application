import { API_ROUTES } from "@/constants/ApiRoutes";
import api from "./api";

export const createGroup = async (name: string, createrId: string) => {
    try {
        const response = await api.post(API_ROUTES.createGroup, { name, createrId });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getAllGroups = async (createrId: string) => {
    try {
        const response = await api.get(`${API_ROUTES.createGroup}?createrId=${createrId}`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getGroupsByMember = async (memberId: string) => {
    try {
        const response = await api.get(`${API_ROUTES.createGroup}/member-groups?memberId=${memberId}`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getUsersByRole = async (role: string) => {
    try {
        const response = await api.get(`${API_ROUTES.createGroup}/users?role=${role}`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const addMemberToGroup = async (groupId: string, userId: string) => {
    try {
        const response = await api.post(`${API_ROUTES.createGroup}/add-member`, { groupId, userId });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};