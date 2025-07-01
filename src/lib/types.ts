import type { Timestamp } from "firebase/firestore";

export interface Lead {
  id: string;
  contactName: string;
  email: string;
  company: string;
  phone?: string;
  source: string;
  notes?: string;
  type: 'Scaffolding' | 'Formwork';
  status:
    | 'New Lead'
    | 'Qualified'
    | 'Proposal Sent'
    | 'Negotiation'
    | 'Won'
    | 'Lost';
  createdAt: Timestamp;
  proposalContent?: string;
  closingNotes?: string;
  value?: number;
  closedAt?: Timestamp;
}

export type Pipeline = {
  'New Lead': Lead[];
  Qualified: Lead[];
  'Proposal Sent': Lead[];
  Negotiation: Lead[];
  Won: Lead[];
  Lost: Lead[];
};

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Timestamp;
  userId: string;
  userName: string;
}
