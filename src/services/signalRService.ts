import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private static instance: SignalRService | null = null;

  private constructor() {
    // Initialize connection in start method
  }

  public static getInstance(): SignalRService {
    if (!SignalRService.instance) {
      SignalRService.instance = new SignalRService();
    }
    return SignalRService.instance;
  }

  public async start(hubUrl: string): Promise<void> {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .build();

      await this.connection.start();
      console.log('SignalR connected successfully');
    } catch (error) {
      console.error('Error establishing SignalR connection:', error);
      throw error;
    }
  }

  public stop(): Promise<void> {
    return this.connection ? this.connection.stop() : Promise.resolve();
  }

  public on<T>(methodName: string, callback: (data: T) => void): void {
    if (this.connection) {
      this.connection.on(methodName, callback);
    } else {
      console.error('Cannot register event handler: SignalR connection not established');
    }
  }

  public off(methodName: string): void {
    if (this.connection) {
      this.connection.off(methodName);
    }
  }

  public async invoke(methodName: string, ...args: any[]): Promise<any> {
    if (this.connection) {
      return await this.connection.invoke(methodName, ...args);
    } else {
      throw new Error('Cannot invoke method: SignalR connection not established');
    }
  }

  public async joinConversation(conversationUuid: string): Promise<void> {
    if (this.connection) {
      await this.connection.invoke('JoinConversation', conversationUuid);
      console.log(`Joined conversation: ${conversationUuid}`);
    } else {
      throw new Error('Cannot join conversation: SignalR connection not established');
    }
  }

  public async leaveConversation(conversationUuid: string): Promise<void> {
    if (this.connection) {
      await this.connection.invoke('LeaveConversation', conversationUuid);
      console.log(`Left conversation: ${conversationUuid}`);
    } else {
      throw new Error('Cannot leave conversation: SignalR connection not established');
    }
  }

  public isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export default SignalRService.getInstance();