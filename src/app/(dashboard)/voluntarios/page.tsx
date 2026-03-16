import { VolunteerService } from "@/lib/services/volunteer.service";
import { VolunteerList } from "./volunteer-list";

export default async function VoluntariosPage() {
  const volunteers = await VolunteerService.findAll();
  const serialized = JSON.parse(JSON.stringify(volunteers));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Voluntarios</h1>
        <p className="text-text-secondary mt-1">
          Administra y supervisa el equipo de voluntarios de la fundación.
        </p>
      </div>
      <VolunteerList volunteers={serialized} />
    </div>
  );
}
