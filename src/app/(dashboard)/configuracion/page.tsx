import { VolunteerService } from "@/lib/services/volunteer.service";
import { AdminManager } from "./admin-manager";

export default async function ConfiguracionPage() {
  const allUsers = await VolunteerService.findAllUsers();
  const serialized = JSON.parse(JSON.stringify(allUsers));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Configuración</h1>
        <p className="text-text-secondary mt-1">
          Gestión de roles y ajustes del sistema.
        </p>
      </div>
      <AdminManager users={serialized} />
    </div>
  );
}
