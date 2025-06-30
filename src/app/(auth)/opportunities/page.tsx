import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
        <div className="space-y-8">
            {(Object.keys(pipeline) as Stage[]).map(stage => (
                <Card key={stage}>
                    <CardHeader>
                        <CardTitle className="text-xl flex justify-between items-center">
                            <span>{stage}</span>
                            <span className="text-lg font-semibold text-muted-foreground bg-secondary rounded-full px-4 py-1">
                                ${pipeline[stage].reduce((sum, opp) => sum + opp.value, 0).toLocaleString()}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pipeline[stage].length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {pipeline[stage].map(opp => (
                                    <Card key={opp.id} className="hover:shadow-md transition-shadow flex flex-col">
                                        <CardHeader className="p-4">
                                            <CardTitle className="text-base font-medium">{opp.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 flex-grow">
                                            <div className="text-2xl font-bold text-primary">${opp.value.toLocaleString()}</div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{opp.contact.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-muted-foreground">{opp.contact}</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0">
                                            <Button variant="outline" size="sm" className="w-full">View Details</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-sm text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                                No opportunities in this stage.
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  )
}
