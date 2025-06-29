import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const leads = [
  { id: "LEAD-001", customer: "Innovate Corp", type: "Formwork", assigned: "2 days ago", status: "In Progress" },
  { id: "LEAD-003", customer: "Future Systems", type: "Formwork", assigned: "4 days ago", status: "New" },
  { id: "LEAD-005", customer: "Quantum Solutions", type: "Formwork", assigned: "1 week ago", status: "New" },
];

export default function ProposalDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proposal Team Dashboard</CardTitle>
          <CardDescription>Leads assigned for proposal creation.</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Assigned Formwork Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.id}</TableCell>
                  <TableCell>{lead.customer}</TableCell>
                  <TableCell>{lead.assigned}</TableCell>
                  <TableCell>
                    <Badge variant={lead.status === 'New' ? 'destructive' : 'default'}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Create Proposal</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
