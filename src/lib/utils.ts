type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassArray = ClassValue[];
type ClassValue =
    | string
    | number
    | null
    | undefined
    | false
    | ClassDictionary
    | ClassArray;

function toClassNames(value: ClassValue): string[] {
    if (!value) {
        return [];
    }

    if (typeof value === "string" || typeof value === "number") {
        return [String(value)];
    }

    if (Array.isArray(value)) {
        return value.flatMap((item) => toClassNames(item));
    }

    return Object.entries(value)
        .filter(([, isEnabled]) => Boolean(isEnabled))
        .map(([className]) => className);
}

export function cn(...inputs: ClassValue[]): string {
    return inputs
        .flatMap((input) => toClassNames(input))
        .filter((className) => className.trim().length > 0)
        .join(" ");
}
