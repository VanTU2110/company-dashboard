export interface CV {
    studentUuid: string;
    cloudinaryPublicId: string;
    url: string;
    uploadAt: string;
    uuid: string;
}
export interface listCVResponse{
    data: CV[];
    error:{
        code: string;
        message: string;   
    }
}