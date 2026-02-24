import { Card, CardContent } from '@casalino/ui';
import { ReferenceForm } from './client';

interface ReferencePublicData {
  id: string;
  status: string;
  applicantName: string;
  landlordName: string;
  expiresAt: string | null;
}

export default async function ReferenceFormPage(
  props: { params: Promise<{ token: string }> },
) {
  const { token } = await props.params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  let data: ReferencePublicData | null = null;
  let errorMessage: string | null = null;

  try {
    const res = await fetch(
      `${API_BASE}/api/v1/public/reference/${token}`,
      { cache: 'no-store' },
    );
    const json = await res.json();

    if (json.success) {
      data = json.data;
    } else {
      errorMessage = json.error?.message ?? 'Referenz nicht gefunden';
    }
  } catch {
    errorMessage = 'Verbindungsfehler';
  }

  if (errorMessage || !data) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="py-12 text-center">
          <p className="text-destructive">
            {errorMessage ?? 'Referenz nicht gefunden'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (data.status === 'completed') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="py-12 text-center">
          <h2 className="mb-2 text-xl font-bold">
            Bereits ausgefuellt
          </h2>
          <p className="text-muted-foreground">
            Diese Referenz wurde bereits eingereicht. Vielen Dank.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (data.status === 'expired') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="py-12 text-center">
          <h2 className="mb-2 text-xl font-bold">
            Link abgelaufen
          </h2>
          <p className="text-muted-foreground">
            Dieser Referenzlink ist leider abgelaufen.
            Bitte kontaktieren Sie die Verwaltung fuer einen neuen Link.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-3xl">Vermieter-Referenz</h1>
        <p className="mt-2 text-muted-foreground">
          Referenz fuer {data.applicantName}
        </p>
      </div>

      <ReferenceForm token={token} applicantName={data.applicantName} />
    </div>
  );
}
