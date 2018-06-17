import { AbstractBrowser, ISearchSuggestion } from './browser/AbstractBrowser';
import { AbstractProvider } from './provider/AbstractProvider';

export default class IssueViewer {
    private readonly browser: AbstractBrowser;
    private readonly providers: AbstractProvider[];

    constructor(browser: AbstractBrowser) {
        this.browser = browser;
        this.providers = new Array<AbstractProvider>();
    }

    public addProvider(provider: AbstractProvider): number {
        return this.providers.push(provider);
    }

    public removeAllProviders(): void {
        this.providers.length = 0;
    }

    public search(text: string, sugguestCallback?: (sugguestions: ISearchSuggestion[]) => void): void {
        const results = new Array<ISearchSuggestion>();
        const searchPromises = new Array<Promise<ISearchSuggestion[]>>();

        this.providers.forEach((provider: AbstractProvider) => {
            // searchPromises.push(provider.search(text));
        });

        Promise.all(searchPromises).then((values: ISearchSuggestion[][]) => {
            // temp
        }) ;

    }
}
