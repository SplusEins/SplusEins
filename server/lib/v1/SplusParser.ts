import {load} from 'cheerio';
import {ILecture} from './ILecture';

interface IBlock {
    title: string;
    durationHours: number;
    durationSlots: number;
    info: string;
    room: string;
    lecturer: string
}

export class SplusParser {
    private readonly startHour = 7;

    private readonly $: CheerioStatic;
    private readonly $table: Cheerio;
    private readonly $rows: Cheerio;

    private colWidths: number[] = [];
    private colBlocked: number[] = [];

    private blocks: IBlock[][][] = [];

    constructor(data: string) {
        this.$ = load(data);

        this.$table = this.$(this.$('table.grid-border-args')[0]);
        this.$rows = this.$table.find('> tbody > tr');

        this.parseColWidths();
        this.parseTable();
    }

    getLectures(): ILecture[] {
        let lectures: ILecture[] = [];

        for (let i = 0; i < this.blocks.length; i++) {
            const begin = this.startHour + i * 0.25;

            const slot = this.blocks[i];
            for (let j = 0; j < slot.length; j++) {
                const day = slot[j];
                for (let k = 0; k < day.length; k++) {
                    const block = day[k];

                    const lecture = {
                        title: block.title,
                        day: j,
                        begin: begin,
                        end: begin + block.durationHours,
                        info: block.info,
                        room: block.room,
                        lecturer: block.lecturer
                    };

                    lectures.push(lecture);
                }
            }
        }

        return lectures;
    }

    private getDay(col: number) {
        return this.colWidths.findIndex(width => (col -= width) < 0);
    }

    private parseColWidths() {
        const $cols = this.$(this.$rows[0]).find('td:not(:first-child)');

        for (let i = 0; i < $cols.length; i++) {
            const $col = this.$($cols[i]);
            this.colWidths[i] = parseInt($col.attr('colspan'));
        }

        let index = 0;
        for (let i = 0; i < this.colWidths.length; i++) {
            for (let j = 0; j < this.colWidths[i]; i++) {
                this.colBlocked[index++] = 0;
            }
        }
    }

    private parseTable() {
        for (let i = 0; i < this.$rows.length - 1; i++) {
            // i + 1 to skip the columns row
            const $row = this.$(this.$rows[i + 1]);

            this.colBlocked = this.colBlocked.map(v => v > 0 ? v - 1 : 0);

            this.blocks.push(this.parseRow($row));
        }
    }

    private parseRow($row: Cheerio) {
        const $cols = $row.find('> td:not(:first-child)');
        const blocks: IBlock[][] = [];

        let offset = 0;
        for (let i = 0; i < $cols.length; i++) {
            while (this.colBlocked[i + offset] > 0) {
                const day = this.getDay(i + offset);
                if (blocks[day] === undefined) {
                    blocks[day] = [];
                }

                offset++;
            }

            const day = this.getDay(i + offset);
            if (blocks[day] === undefined) {
                blocks[day] = [];
            }

            const $c = this.$($cols[i]);
            if ($c.hasClass('object-cell-border')) {
                const block = this.parseBlock($c);
                blocks[day].push(block);

                this.colBlocked[i + offset] = block.durationSlots;
            }
        }

        return blocks;
    }

    private parseBlock($block: Cheerio): IBlock {
        const $tblTitle = $block.find('table:nth-child(1)');
        const $tblInfo = $block.find('table:nth-child(2)');
        const $tblLocation = $block.find('table:nth-child(3)');

        const $tdRoom = $tblLocation.find('td:nth-child(1)');
        const $tdLecturer = $tblLocation.find('td:nth-child(2)');

        // Remove the Modulhandbuch "mhb" link
        $tblTitle.find('br + strong').remove();

        const slots = parseInt($block.attr('rowspan'));
        return {
            title: $tblTitle.text().trim(),
            durationHours: slots / 4,
            durationSlots: slots,
            info: $tblInfo.text().trim(),
            room: $tdRoom.text().trim(),
            lecturer: $tdLecturer.text().trim()
        };
    }
}
