import Browser from './browser/Browser';

export default class IssueViewer {
    private readonly browser: Browser;

    constructor(browser: Browser) {
        this.browser = Browser;
    }
}
