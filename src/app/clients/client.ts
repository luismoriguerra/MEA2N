export interface IClient {
    id?: number;
    description?: string;
    legacy_id?: string;
    status?: number;
    created_at?: string

}

export class Client  implements IClient {
   id: number;
   description: string;
   legacy_id: string;
   status: number;
   created_at: string;



}