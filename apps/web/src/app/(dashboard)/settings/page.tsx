import { Card, CardContent } from '@casalino/ui';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Einstellungen</h1>

      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Organisationseinstellungen werden in Phase 2 implementiert.
        </CardContent>
      </Card>
    </div>
  );
}
