const fs = require('fs');

function getTTFInfo(buffer) {
    if (buffer.readUInt32BE(0) !== 0x00010000 && buffer.toString('ascii', 0, 4) !== 'true' && buffer.toString('ascii', 0, 4) !== 'OTTO') {
        throw new Error('Not a valid TTF/OTF file');
    }

    const numTables = buffer.readUInt16BE(4);
    let nameTableOffset = 0;

    for (let i = 0; i < numTables; i++) {
        const offset = 12 + (i * 16);
        const tag = buffer.toString('ascii', offset, offset + 4);
        if (tag === 'name') {
            nameTableOffset = buffer.readUInt32BE(offset + 8);
            break;
        }
    }

    if (!nameTableOffset) throw new Error('name table not found');

    const format = buffer.readUInt16BE(nameTableOffset);
    const count = buffer.readUInt16BE(nameTableOffset + 2);
    const stringOffset = buffer.readUInt16BE(nameTableOffset + 4);

    const strings = {};

    for (let i = 0; i < count; i++) {
        const recordOffset = nameTableOffset + 6 + (i * 12);
        const platformID = buffer.readUInt16BE(recordOffset);
        const encodingID = buffer.readUInt16BE(recordOffset + 2);
        const languageID = buffer.readUInt16BE(recordOffset + 4);
        const nameID = buffer.readUInt16BE(recordOffset + 6);
        const length = buffer.readUInt16BE(recordOffset + 8);
        const offset = buffer.readUInt16BE(recordOffset + 10);

        const strBuffer = buffer.subarray(nameTableOffset + stringOffset + offset, nameTableOffset + stringOffset + offset + length);

        let value;
        // Decode MacRoman (0) or Unicode (3)
        if (platformID === 0 || platformID === 3) {
            // Very hacky utf-16be decode
            value = '';
            for (let j = 0; j < length; j += 2) {
                value += String.fromCharCode(strBuffer.readUInt16BE(j));
            }
        } else if (platformID === 1) {
            value = strBuffer.toString('ascii');
        } else {
            continue;
        }

        if (!strings[nameID] || platformID === 3) { // Prefer windows unicode
            strings[nameID] = value;
        }
    }

    return {
        fontFamily: strings[1] || strings[16],
        fontSubfamily: strings[2] || strings[17],
        fullName: strings[4],
        postscriptName: strings[6]
    };
}

try {
    const data = fs.readFileSync('public/fonts/mortal-kombat-5.ttf');
    console.log(JSON.stringify(getTTFInfo(data), null, 2));
} catch (e) {
    console.error(e.message);
}
