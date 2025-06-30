export interface Lead {
  id: string;
  contactName: string;
  email: string;
  company: string;
  phone?: string;
  source: string;
  notes?: string;
  type: 'Scaffolding' | 'Formwork';
  status: 'New Lead' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Won';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  proposalContent?: string;
}

export type Pipeline = {
  'New Lead': Lead[];
  'Qualified': Lead[];
  'Proposal Sent': Lead[];
  'Negotiation': Lead[];
  'Won': Lead[];
};
