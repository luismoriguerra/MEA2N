export class User {
    area_name: string;
    client_name: string;
    clients: string;
    clients_count: string;
    employee_id: string;
    id: string;
    last_name: string;
    legacy_id: string;
    locate_area: string;
    locate_client: string;
    locate_office: string;
    name: string;
    office_name: string;
    role_id: string;
    status: string;
    username: string;

    constructor(data = {}) {

    }

    displayedColumns = [
        {field: "", header:""}
    ]

}