import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@casalino/ui';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-2xl">
          Bei Casalino anmelden
        </CardTitle>
        <CardDescription>
          Verwaltungsplattform fuer Immobilienprofis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
