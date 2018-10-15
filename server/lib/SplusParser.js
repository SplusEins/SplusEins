"use strict";
exports.__esModule = true;
var cheerio_1 = require("cheerio");
var SplusParser = /** @class */ (function () {
    function SplusParser(data) {
        this.startHour = 7;
        this.colWidths = [];
        this.colBlocked = [];
        this.blocks = [];
        this.$ = cheerio_1.load(data);
        this.$table = this.$(this.$('table.grid-border-args')[0]);
        this.$rows = this.$table.find('> tbody > tr');
        this.parseColWidths();
        this.parseTable();
    }
    SplusParser.prototype.getLectures = function () {
        var lectures = [];
        for (var i = 0; i < this.blocks.length; i++) {
            var begin = this.startHour + i * 0.25;
            var slot = this.blocks[i];
            for (var j = 0; j < slot.length; j++) {
                var day = slot[j];
                for (var k = 0; k < day.length; k++) {
                    var block = day[k];
                    var lecture = {
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
    };
    SplusParser.prototype.getDay = function (col) {
        return this.colWidths.findIndex(function (width) { return (col -= width) < 0; });
    };
    SplusParser.prototype.parseColWidths = function () {
        var $cols = this.$(this.$rows[0]).find('td:not(:first-child)');
        for (var i = 0; i < $cols.length; i++) {
            var $col = this.$($cols[i]);
            this.colWidths[i] = parseInt($col.attr('colspan'));
        }
        var index = 0;
        for (var i = 0; i < this.colWidths.length; i++) {
            for (var j = 0; j < this.colWidths[i]; i++) {
                this.colBlocked[index++] = 0;
            }
        }
    };
    SplusParser.prototype.parseTable = function () {
        for (var i = 0; i < this.$rows.length - 1; i++) {
            // i + 1 to skip the columns row
            var $row = this.$(this.$rows[i + 1]);
            this.colBlocked = this.colBlocked.map(function (v) { return v > 0 ? v - 1 : 0; });
            this.blocks.push(this.parseRow($row));
        }
    };
    SplusParser.prototype.parseRow = function ($row) {
        var $cols = $row.find('> td:not(:first-child)');
        var blocks = [];
        var offset = 0;
        for (var i = 0; i < $cols.length; i++) {
            while (this.colBlocked[i + offset] > 0) {
                var day_1 = this.getDay(i + offset);
                if (blocks[day_1] === undefined) {
                    blocks[day_1] = [];
                }
                offset++;
            }
            var day = this.getDay(i + offset);
            if (blocks[day] === undefined) {
                blocks[day] = [];
            }
            var $c = this.$($cols[i]);
            if ($c.hasClass('object-cell-border')) {
                var block = this.parseBlock($c);
                blocks[day].push(block);
                this.colBlocked[i + offset] = block.durationSlots;
            }
        }
        return blocks;
    };
    SplusParser.prototype.parseBlock = function ($block) {
        var $tblTitle = $block.find('table:nth-child(1)');
        var $tblInfo = $block.find('table:nth-child(2)');
        var $tblLocation = $block.find('table:nth-child(3)');
        var $tdRoom = $tblLocation.find('td:nth-child(1)');
        var $tdLecturer = $tblLocation.find('td:nth-child(2)');
        // Remove the Modulhandbuch "mhb" link
        $tblTitle.find('br + strong').remove();
        var slots = parseInt($block.attr('rowspan'));
        return {
            title: $tblTitle.text().trim(),
            durationHours: slots / 4,
            durationSlots: slots,
            info: $tblInfo.text().trim(),
            room: $tdRoom.text().trim(),
            lecturer: $tdLecturer.text().trim()
        };
    };
    return SplusParser;
}());
exports.SplusParser = SplusParser;
