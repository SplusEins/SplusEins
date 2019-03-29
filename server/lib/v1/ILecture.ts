export interface ILecture {
    title: string;
    day: number;
    begin: number;
    end: number;
    info: string;
    room: string,
    lecturer: string;
}

export interface ILectureFilter {
    (lecture: ILecture): boolean;
}
