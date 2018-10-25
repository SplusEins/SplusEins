import * as request from 'request-promise-native';
import {SplusParser} from './SplusParser';
import {ILecture} from './ILecture';

export class SplusApi {
    private static _base_uri = 'http://splus.ostfalia.de/semesterplan123.php';

    private static splusRequest(identifier: string, weekOfYear: number): PromiseLike<string> {
        return request({
            method: 'POST',
            uri: this._base_uri,
            qs: { identifier, },
            formData: {
                weeks: weekOfYear.toString(),
            },
        });
    }

    static async getData(identifier: string, weekOfYear: number): Promise<ILecture[]> {
        const data = await this.splusRequest(identifier, weekOfYear);
        const lectures = new SplusParser(data).getLectures();
        return lectures;
    }
}
