import { ISearchSuggestion } from '../browser/AbstractBrowser';
import { IIssue } from '../IIssue';

export abstract class AbstractProvider {
    public abstract readonly id: string;
    public abstract search(text: string): Promise<IIssue[]>;
}
