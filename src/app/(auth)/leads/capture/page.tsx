import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function LeadCapturePage() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Lead Capture</CardTitle>
        <CardDescription>
          Enter details for a new sales lead. Scaffolding leads are routed to Admin, Formwork leads to Proposal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scaffolding" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scaffolding">Scaffolding Lead</TabsTrigger>
            <TabsTrigger value="formwork">Formwork Lead</TabsTrigger>
          </TabsList>
          <TabsContent value="scaffolding">
            <LeadForm type="Scaffolding" />
          </TabsContent>
          <TabsContent value="formwork">
            <LeadForm type="Formwork" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function LeadForm({ type }: { type: "Scaffolding" | "Formwork" }) {
  return (
    <form className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor={`name-${type}`}>Contact Name</Label>
          <Input id={`name-${type}`} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`email-${type}`}>Contact Email</Label>
          <Input id={`email-${type}`} type="email" placeholder="john.doe@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`company-${type}`}>Company</Label>
          <Input id={`company-${type}`} placeholder="Innovate Corp." />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`phone-${type}`}>Phone Number</Label>
          <Input id={`phone-${type}`} type="tel" placeholder="(123) 456-7890" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`source-${type}`}>Lead Source</Label>
          <Select>
            <SelectTrigger id={`source-${type}`}>
              <SelectValue placeholder="Select a source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="cold-call">Cold Call</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor={`type-display-${type}`}>Lead Type</Label>
            <Input id={`type-display-${type}`} value={type} disabled />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`notes-${type}`}>Notes</Label>
        <Textarea id={`notes-${type}`} placeholder="Enter any relevant notes about the lead..." />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button type="submit">Submit Lead</Button>
      </div>
    </form>
  )
}
