#!/usr/bin/node
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

function extractSemester(text, faculty) {
    if (text.includes(' Sem. ')) {
        return text.substring(
            text.indexOf(' Sem. ') - 2,
            text.indexOf(' Sem. ')
        );
    }

    return 0;
}

function extractSlug(text, faculty) {
    if (text.endsWith(')')) {
        return text.substring(
            text.lastIndexOf('(') + 1,
            text.length - 1
        );
    }

    return text;
}

function extractLabel(text, faculty) {
    if (text.includes(' Sem. ') && text.includes('(')) {
        return text.substring(
            text.indexOf(' Sem. ') + ' Sem. '.length,
            text.lastIndexOf('(') - 1
        );
    }

    if (text.startsWith('Alle ') && text.includes('(')) {
        return text.substring(
            'Alle '.length,
            text.lastIndexOf('(') - 1
        );
    }

    if (text.includes('I-M-I') && text.includes('(')) {
        return text.substring(
            'M.Sc. - x. '.length,
            text.lastIndexOf('(') - 1
        )
    }

    if (faculty == 'Soziale Arbeit') {
        return faculty;
    }

    if (faculty == 'Elektrotechnik') {
        if (text.startsWith('BA') || text.startsWith('MA')) {
            if (text.includes('(')) {
                return text.substring(
                    text.indexOf('BA') + 'Ba'.length,
                    text.lastIndexOf('('),
                );
            }
        }
    }

    return text;
}

function extractDegree(text, faculty) {
    if (text.includes('B.Sc.')) {
        return 'Bachelor of Science';
    }
    if (text.includes('M.Sc.') || text.includes('Ma.Sc.')) {
        return 'Master of Science';
    }
    if (text.includes('B.A.')) {
        return 'Bachelor of Arts';
    }
    if (text.includes('M.A.')) {
        return 'Master of Arts';
    }
    if (text.includes('I-Wahlpflicht')) {
        if (text.includes('Bachelor')) {
            return 'Bachelor of Science';
        }
        if (text.includes('Master')) {
            return 'Master of Science';
        }
    }
    if (text.includes('I_Infos')) {
        return 'Info';
    }
    if (text.includes('I-VFH')) {
        if (text.includes('Bachelor')) {
            return 'Bachelor of Science';
        }
        if (text.includes('Master')) {
            return 'Master of Science';
        }
    }

    if (faculty == 'Soziale Arbeit' || faculty == 'Elektrotechnik') {
        if (text.includes('BA') || text.includes('BP')) {
            return 'Bachelor of Arts';
        }
        if (text.includes('MA')) {
            return 'Master of Arts';
        }
    }

    return text;
}

function extractSemester(text, faculty) {
    if (text.includes('. Sem.')) {
        return +text.substring(
            text.indexOf('. Sem.') - 1,
            text.indexOf('. Sem.')
        );
    }
    if (text.includes('WPF') || text.includes('WPf')) {
        return 0;
    }


    if (faculty == 'Soziale Arbeit') {
        const semester = +text.slice(-1);
        if (semester > 0) {
            return semester;
        }
    }

    return text;
}

async function parsePlan(url, faculty, setplan) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    return $('form[name=form3] option').map(function(i, option) {
        const id = $(this).attr('value').substring(1);
        const text = $(this).text().trim();

        return {
            id,
            slug: extractSlug(text, faculty),
            label: extractLabel(text, faculty),
            faculty,
            degree: extractDegree(text, faculty),
            semester: extractSemester(text, faculty),
            setplan,
        };
    }).get();
}

async function main() {
    const urls = [
        ['http://splus.ostfalia.de/semesterplan123.php?id=F2FE9DDD9A027E6A903EE0647F5ACA38&semester=ss', 'Elektrotechnik'],
        ['http://splus.ostfalia.de/semesterplan123.php?id=F2FE9DDD9A027E6A903EE0647F5ACA39&semester=ss', 'Soziale Arbeit'],
        ['http://splus.ostfalia.de/semesterplan123.php?id=1362F014835FFFD0F67159E302EC1A3C&semester=ss', 'Informatik'],
    ];
    const parsePlan1 = ([url, faculty]) => parsePlan(url, faculty, false);
    const timetables = [].concat(...await Promise.all(urls.map(parsePlan1)));
    fs.writeFile('assets/timetables.json', JSON.stringify(timetables, null, 2), console.error);
}
main().catch(console.error);