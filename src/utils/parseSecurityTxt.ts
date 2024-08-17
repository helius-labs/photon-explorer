// import { SecurityTxt } from "@/types/securityTxt";

// const HEADER = '=======BEGIN SECURITY.TXT V1=======\0';
// const FOOTER = '=======END SECURITY.TXT V1=======\0';
// const REQUIRED_KEYS: (keyof SecurityTxt)[] = ['name', 'project_url', 'contacts', 'policy'];
// const VALID_KEYS: (keyof SecurityTxt)[] = [
//   'name', 'project_url', 'contacts', 'policy', 'preferred_languages',
//   'encryption', 'source_code', 'source_release', 'source_revision',
//   'auditors', 'acknowledgements', 'expiry'
// ];

// export const parseSecurityTxt = (programData: Buffer): { securityTxt?: SecurityTxt; error?: string } => {
//     const headerIdx = programData.indexOf(HEADER);
//     const footerIdx = programData.indexOf(FOOTER);

//     if (headerIdx < 0 || footerIdx < 0) {
//         return { error: "Program does not have a security.txt" };
//     }

//     const content = programData.subarray(headerIdx + HEADER.length, footerIdx);
//     const pairs = content.toString().split("\0");
//     const map: Partial<SecurityTxt> = {};

//     for (let i = 0; i < pairs.length - 1; i += 2) {
//         const key = pairs[i];
//         const value = pairs[i + 1];

//         if (VALID_KEYS.includes(key as keyof SecurityTxt)) {
//             map[key as keyof SecurityTxt] = value;
//         }
//     }

//     if (!REQUIRED_KEYS.every(k => k in map)) {
//         return {
//             error: `Some required fields (${REQUIRED_KEYS.join(", ")}) are missing`,
//         };
//     }

//     return { securityTxt: map as SecurityTxt };
// }
import { SecurityTxt } from '@/types/securityTxt';

const REQUIRED_KEYS: (keyof SecurityTxt)[] = ['name', 'project_url', 'contacts', 'policy'];
const VALID_KEYS: (keyof SecurityTxt)[] = [
    'name', 'project_url', 'contacts', 'policy', 'preferred_languages',
    'encryption', 'source_code', 'source_release', 'source_revision',
    'auditors', 'acknowledgements', 'expiry'
];
const HEADER = '=======BEGIN SECURITY.TXT V1=======\0';
const FOOTER = '=======END SECURITY.TXT V1=======\0';

export const parseSecurityTxt = (programData: { data: [string, 'base64'] }): { securityTxt?: SecurityTxt; error?: string } => {
    const [data, encoding] = programData.data;
    if (!(data && encoding === 'base64')) return { error: 'Failed to decode program data' };
    
    const decoded = Buffer.from(data, encoding);
    const headerIdx = decoded.indexOf(HEADER);
    const footerIdx = decoded.indexOf(FOOTER);
    
    if (headerIdx < 0 || footerIdx < 0) {
        return { error: 'Program has no security.txt' };
    }

    const content = decoded.subarray(headerIdx + HEADER.length, footerIdx);
    const map = content
        .reduce<number[][]>(
            (prev, current) => {
                if (current === 0) {
                    prev.push([]);
                } else {
                    prev[prev.length - 1].push(current);
                }
                return prev;
            },
            [[]]
        )
        .map(c => String.fromCharCode(...c))
        .reduce<{ map: { [key: string]: string }; key: string | undefined }>(
            (prev, current) => {
                const key = prev.key;
                if (!key) {
                    return {
                        key: current,
                        map: prev.map,
                    };
                } else {
                    return {
                        key: undefined,
                        map: {
                            ...(VALID_KEYS.includes(key as keyof SecurityTxt) ? { [key]: current } : {}),
                            ...prev.map,
                        },
                    };
                }
            },
            { key: undefined, map: {} }
        ).map;

    if (!REQUIRED_KEYS.every(k => k in map)) {
        return {
            error: `Some required fields (${REQUIRED_KEYS.join(', ')}) are missing`,
        };
    }

    return { securityTxt: map as SecurityTxt };
};
