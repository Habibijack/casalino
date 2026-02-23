import { Building2, Users, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@casalino/ui';

const stats = [
  { label: 'Aktive Inserate', value: 0, icon: Building2 },
  { label: 'Offene Bewerbungen', value: 0, icon: Users },
  { label: 'Anstehende Besichtigungen', value: 0, icon: Calendar },
  { label: 'Laufende Vertraege', value: 0, icon: FileText },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-xl">Neueste Aktivitaeten</h2>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Noch keine Aktivitaeten vorhanden.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
