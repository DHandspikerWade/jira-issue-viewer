export abstract class AbstractBrowser {
    public abstract readonly events: IBrowserEvents;
    public abstract createTab(url: string): void;

    public getSearchPlaceholder(): string {
        return 'Search';
    }
}

export interface IBrowserEvents {
    onTabCreate(callback: (tab: ITab) => void): void;
    onTabUpdate(callback: (tab: ITab) => void): void;
    onSearchStart(callback: () => void): void;
    // tslint:disable-next-line:max-line-length
    onSearchUpdate(callback: (text: string, sugguestCallback?: (sugguestions: ISearchSuggestion[]) => void) => void): void;
}

export interface ITab {
    status?: string;
    index: number;
    title?: string;
    url?: string;
    windowId: number;
    active: boolean;
    favIconUrl?: string;
}

export interface ISearchSuggestion {
    content: string;
    description: string;
}
