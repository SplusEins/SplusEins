import * as request from 'request-promise-native';
import {SplusParser} from './SplusParser';
import {ILecture} from './ILecture';

export class SplusApi {
    private static _plan_base_uri = 'http://splus.ostfalia.de/semesterplan123.php';
    private static _set_base_uri  = 'http://splus.ostfalia.de/studentensetplan123.php';

    private static splusPlanRequest(identifier: string, weekOfYear: number): PromiseLike<string> {
        return request({
            method: 'POST',
            uri: this._plan_base_uri,
            qs: {
                semester: 'ss', // TODO change this in WS19/20
                identifier,
            },
            formData: {
                weeks: weekOfYear.toString(),
            },
        });
    }

    private static splusSetRequest(identifier: string, weekOfYear: number): PromiseLike<string> {
        return request({
            method: 'POST',
            uri: this._set_base_uri,
            qs: {
                semester: 'ss', // TODO change this in WS19/20
            },
            formData: {
                'identifier[]': identifier,
                weeks: weekOfYear.toString(),
            },
        });
    }

    static async getData(identifier: string, weekOfYear: number, isSet: boolean): Promise<ILecture[]> {
        const data = isSet? await this.splusSetRequest(identifier, weekOfYear) : await this.splusPlanRequest(identifier, weekOfYear);
        const lectures = new SplusParser(data).getLectures();
        return lectures;
    }
}
