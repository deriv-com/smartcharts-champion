declare var t: {
    translate(x?: string, params?: Record<string, string | number | boolean>): string;
    setLanguage(x: string, callback: () => void): void;
    lang: string;
};

declare var __webpack_public_path__: string;

declare module '*.scss';
declare module '*.svg' {
    const content: React.SVGAttributes<SVGElement>;
    export default content;
}
declare module '*.webp' {
    /** Emitted as a separate file by webpack; the import is its resolved URL. */
    const url: string;
    export default url;
}

interface Window {
    isProductionWebsite?: boolean;
    _trackJs: {
        token: string;
        application: string;
    };
}

interface Navigator {
    msSaveBlob: (blob: Blob, name: string) => void;
    onLine: boolean;
}

interface Document {
    documentMode?: number;
}
