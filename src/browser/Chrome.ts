import {AbstractBrowser, IBrowserEvents, ISearchSuggestion, ITab} from './AbstractBrowser';

/* tslint:disable:max-classes-per-file */

export class Chrome extends AbstractBrowser {
    public readonly events: IBrowserEvents;

    constructor() {
        super();
        this.events = new ChromeEvents();

        this.events.onSearchStart(this.setDefaultText);
    }
    public createTab(url: string): void {
        chrome.tabs.create({url});
    }

    protected setDefaultText(): void {
        chrome.omnibox.setDefaultSuggestion({description : this.getSearchPlaceholder()});
    }
}

class ChromeEvents implements IBrowserEvents {
    public onTabCreate(callback: (tab: ITab) => void): void {
        chrome.tabs.onCreated.addListener(callback);
    }
    public onTabUpdate(callback: (tab: ITab) => void): void {
        // tslint:disable-next-line:max-line-length
        chrome.tabs.onUpdated.addListener((tabId: number, changeinfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
            callback(tab);
        });
    }
    public onSearchStart(callback: () => void): void {
        chrome.omnibox.onInputStarted.addListener(callback);
    }
    // tslint:disable-next-line:max-line-length
    public onSearchUpdate(callback: (text: string, sugguestCallback?: (sugguestions: ISearchSuggestion[]) => void) => void): void {
        chrome.omnibox.onInputChanged.addListener(callback);
    }
}
