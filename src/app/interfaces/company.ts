import { CompanyRelation } from "./company-relation";

export interface Company {
    [x: string]: any;
    id: number;
    name: string;
    Relations: CompanyRelation[];
}
