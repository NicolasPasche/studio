import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Search } from "lucide-react"

const customers = [
  { id: 1, name: 'Innovate Corp.', contact: 'John Doe', email: 'john.d@innovate.com', status: 'Active', segment: 'Tier 1' },
  { id: 2, name: 'Data Systems', contact: 'Jane Smith', email: 'jane.s@datasys.com', status: 'Active', segment: 'Tier 2' },
  { id: 3, name: 'Solutions Inc.', contact: 'Peter Jones', email: 'peter.j@solutions.com', status: 'New', segment: 'Tier 3' },
  { id: 4, name: 'Quantum Tech', contact: 'Mary Brown', email: 'mary.b@quantum.com', status: 'Churned', segment: 'Tier 1' },
  { id: 5, name: 'Future Gadgets', contact: 'Chris Green', email: 'chris.g@fg.io', status: 'Active', segment: 'Tier 2' },
];

export default function CustomersPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>View, manage, and segment your customers.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search customers..." className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]" />
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Customer
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map(customer => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.contact}</TableCell>
                <TableCell>
                  <Badge variant={
                    customer.status === 'Active' ? 'default' : 
                    customer.status === 'New' ? 'secondary' : 'destructive'
                  } className={customer.status === 'Active' ? 'bg-accent' : ''}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>{customer.segment}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
