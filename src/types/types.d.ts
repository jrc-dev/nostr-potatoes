type UrlParams = Record<string, string> & {
    path: string,
};

type LoadableError = string | {
    type: string,
    content: {
        code: number,
        message: string,
    }
};

type Loadable<T> = {
    type: 'Ready' | 'Loading' | 'Err',
    content: T | LoadableError,
};

type ResourceRequestPath = {
    id: string,
    type: string,
    resource: string,
    extra: [string, string][]
};

type ResourceRequest = {
    base: string,
    path: ResourceRequestPath,
};

type ExternalPlayerLinks = {
    androidTv: string | null,
    download: string | null,
    fileName: string | null,
    href: string | null,
    tizen: string | null,
    webos: string | null,
};

type TrailerStream = {
    ytId: string,
    description: string,
    deepLinks: {
        player: string,
        externalPlayer: ExternalPlayerLinks,
    },
};

type BehaviorHints = {
    defaultVideoId: string | null,
    featuredVideoId: string | null,
    hasScheduledVideos: boolean,
};

type PosterShape = 'square' | 'landscape' | 'poster' | null; 

type Catalog<T, D = any> = {
    title?: string,
    content: T,
    installed?: boolean,
    deepLinks?: D,
};