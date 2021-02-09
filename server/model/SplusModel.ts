export interface ParsedBlock {
    title: string;
    durationHours: number;
    durationSlots: number;
    info: string;
    room: string;
    lecturer: string
}

export interface ParsedLecture {
    title: string;
    start: Date;
    end: Date;
    duration: number;
    info: string;
    room: string,
    lecturer: string;
}
