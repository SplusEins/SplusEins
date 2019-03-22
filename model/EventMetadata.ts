export class EventMetadata {
    organiserId: string;
    orgraniserName: string;
    description: string;

    constructor(orgianiserId, orgraniserName, description){
        this.organiserId = orgianiserId;
        this.orgraniserName = orgraniserName;
        this.description = description;
    }
}