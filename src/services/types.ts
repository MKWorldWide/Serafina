export interface RelayMessage {
  from: string;
  message: string;
  discordUser: string;
  timestamp?: string;
}

export interface StatusResponse {
  status: string;
  service: string;
  timestamp: string;
}
