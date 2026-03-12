import { API_ROUTES } from "@/constants/ApiRoutes";
import api from "./api";


export const Logout = async ()=>{
    try {
        const response = await api.get(API_ROUTES.logout);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error
    }
}