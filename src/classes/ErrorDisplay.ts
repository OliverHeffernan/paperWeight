export default class ErrorDisplay {
    private title: string;
    private message: string;
    private display: boolean;

    public constructor() {
        this.title = "";
        this.message = "";
        this.display = false;
    }

    public setError(title: string, message: string): void {
        this.title = title;
        this.message = message;
        this.display = true;
    }

    public clearError(): void {
        this.title = "";
        this.message = "";
        this.display = false;
    }
    
    public getTitle(): string {
        return this.title;
    }

    public getMessage(): string {
        return this.message;
    }

    public shouldDisplay(): boolean {
        return this.display;
    }
}
