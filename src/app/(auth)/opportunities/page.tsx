import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const pipeline = {
  "New Lead": [
    { id: 1, title: "Formwork for Innovate Corp", value: 50000, contact: "John Doe" },
  ],
  "Qualified": [
    { id: 2, title: "Scaffolding for Data Systems", value: 120000, contact: "Jane Smith" },
    { id: 3, title: "High-rise Formwork", value: 75000, contact: "Peter Jones" },
  ],
  "Proposal Sent": [
    { id: 4, title: "Quantum Tech Scaffolding", value: 250000, contact: "Mary Brown" },
  ],
  "Negotiation": [
    { id: 5, title: "Future Gadgets Formwork", value: 95000, contact: "Chris Green" },
  ],
  "Won": [],
};

type Stage = keyof typeof pipeline;

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Sales Pipeline</CardTitle>
                <CardDescription>Visualize and manage your sales opportunities.</CardDescription>
            </CardHeader>
        </Card>
        <div className="flex gap-4 overflow-x-auto pb-4">
            {(Object.keys(pipeline) as Stage[]).map(stage => (
                <div key={stage} className="flex-shrink-0 w-80">
                    <Card className="bg-secondary/50 h-full">
                        <CardHeader>
                            <CardTitle className="text-base flex justify-between items-center">
                                <span>{stage}</span>
                                <span className="text-sm font-normal text-muted-foreground bg-background rounded-full px-2 py-0.5">
                                    ${pipeline[stage].reduce((sum, opp) => sum + opp.value, 0) / 1000}k
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {pipeline[stage].map(opp => (
                                <Card key={opp.id} className="hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-sm font-medium">{opp.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="text-lg font-bold text-primary">${opp.value.toLocaleString()}</div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback>{opp.contact.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-muted-foreground">{opp.contact}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {pipeline[stage].length === 0 && (
                                <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                                    Drag opportunities here
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
    </div>
  )
}
