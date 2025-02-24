export interface TicketData {
    user: string;
    title: string;
    team: string;
    assignedUser: string;
    channel: string;
    category: string;
    tag: string;
  }
  
export interface UserData {
    searchText: string;
    ticketData: TicketData;
  }