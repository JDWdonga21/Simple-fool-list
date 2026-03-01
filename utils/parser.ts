export type Contact = {
  name: string;
  phone: string;
  note: string;
};

const decodeQP = (str: string): string => {
  if (!str || !str.includes('=')) return str;
  try {
    const matches = str.match(/=[0-9A-F]{2}/gi);
    if (matches) {
      const bytes = matches.map(m => parseInt(m.substring(1), 16));
      return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
    }
    return str;
  } catch (e) { return str; }
};

const splitCSV = (line: string): string[] => {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else cur += char;
  }
  result.push(cur.trim());
  return result;
};

export const parseVCF = (text: string): Contact[] => {
  const cards = text.split(/BEGIN:VCARD/i).filter(c => c.trim().length > 0);
  return cards.map(card => {
    const lines = card.split(/\r?\n/);
    let name = "", phone = "", org = "";
    lines.forEach(line => {
      const isQP = line.includes('ENCODING=QUOTED-PRINTABLE');
      if (line.match(/^FN[;:]/i)) {
        const val = line.split(':').slice(1).join(':');
        name = isQP ? decodeQP(val) : val;
      } else if (line.match(/^TEL[;:]/i)) {
        const val = line.split(':').slice(1).join(':').replace(/[- \(\)]/g, '');
        if (!phone || line.toLowerCase().includes('cell')) phone = val;
      } else if (line.match(/^ORG[;:]/i)) {
        const val = line.split(':').slice(1).join(':');
        org = isQP ? decodeQP(val) : val;
      }
    });
    return { name: name || phone || "이름 없음", phone, note: org.replace(/;/g, ' ').trim() };
  }).filter(c => c.name !== "이름 없음" || c.phone);
};

export const parseCSV = (text: string): Contact[] => {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 1) return [];
  const headers = splitCSV(lines[0]).map(h => h.toLowerCase().trim());
  const findIdx = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));

  const fNameIdx = findIdx(['first name', '이름']);
  const lNameIdx = findIdx(['last name', '성']);
  const phoneIdx = findIdx(['phone 1 - value', '전화번호', 'mobile', 'tel']);
  const orgIdx = findIdx(['organization name', '회사', 'org']);

  return lines.slice(1).map((line, idx) => {
    const cols = splitCSV(line);
    const first = cols[fNameIdx] || '';
    const last = cols[lNameIdx] || '';
    const phone = cols[phoneIdx] || '';
    const org = cols[orgIdx] || '';
    const name = (last + first).trim() || cols[0] || org || phone || `연락처 ${idx + 1}`;
    return { name, phone, note: org };
  }).filter(c => c.phone || c.name);
};