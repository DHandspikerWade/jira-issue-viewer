import { IIssue } from '../IIssue';
import { AbstractProvider } from './AbstractProvider';

export class FakeProvider extends AbstractProvider {
    public readonly id: string = '1';

    public search(text: string): Promise<IIssue[]> {
        return new Promise((resolve) => {
            const now: number = Date.now() * 1000;
            resolve([
                {
                    issue_id: '1',
                    provider_id: 'FakeProvider:' + this.id,
                    title: 'Test Issue 1',
                    description:'This is just a test issue. It doesn\'t exist',
                    last_viewed: now - 12340,
                },
                {
                    issue_id: '2',
                    provider_id: 'FakeProvider:' + this.id,
                    title: 'Test Issue 2',
                    description:'This is just a test issue. It doesn\'t exist',
                    last_viewed: now - 2399,
                },
                {
                    issue_id: '3',
                    provider_id: 'FakeProvider:' + this.id,
                    title: 'Test Issue 3',
                    description:'This is just a test issue. It doesn\'t exist',
                    last_viewed: now - 4340,
                },
            ]);
        });
    }
}
