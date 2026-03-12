export const API_ROUTES = {
    sigup:'/api/auth/signup',
    login:'/api/auth/login',
    createProperty:"/api/property/add",
    getUserProperties:(userId:string,page:number,limit:number)=> `/api/property/user-properties/${userId}?page=${page}&limit=${limit}`,
    getAllProperties:(page:number,limit:number,search:string,minPrice:number,maxPrice:number)=>`/api/property/all?page=${page}&limit=${limit}&search=${search}&minPrice=${minPrice}&maxPrice=${maxPrice}`,
    getSingleProperty:(propertyId:string)=>`/api/property/${propertyId}`,
    deleteProperty:(propertyId:string)=>`/api/property/${propertyId}`,
    logout:'/api/user',
    updateProperty:(propertyId:string)=>`/api/property/${propertyId}`,
    createGroup:'/api/group',
}