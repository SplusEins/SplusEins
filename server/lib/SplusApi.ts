import request from 'axios';
import { SplusParser } from './SplusParser';
import { ILecture } from './ILecture';

export class SplusApi {
    private static _base_uri = 'http://splus.ostfalia.de/semesterplan123.php';

    private static async splusRequest(course: string, weekOfYear: number): Promise<string> {
        const response = await request({
            url: this._base_uri,
            method: 'post',
            params: { identifier: course },
            data: { weeks: weekOfYear.toString() },
        });
        return response.data;
    }

    static async getData(course: string, weekOfYear: number): Promise<ILecture[]> {
        const data = await this.splusRequest(course, weekOfYear);
        const lectures = new SplusParser(data).getLectures();
        return lectures;
    }
}
