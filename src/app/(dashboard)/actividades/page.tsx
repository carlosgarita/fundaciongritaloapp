import { ActivityService } from "@/lib/services/activity.service";
import { VolunteerService } from "@/lib/services/volunteer.service";
import { ActivityList } from "./activity-list";

export default async function ActividadesPage() {
  const [activities, volunteers] = await Promise.all([
    ActivityService.findAll(),
    VolunteerService.findAll(),
  ]);

  const serializedActivities = JSON.parse(JSON.stringify(activities));
  const serializedVolunteers = JSON.parse(JSON.stringify(volunteers));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Actividades</h1>
        <p className="text-text-secondary mt-1">
          En cada fila usa <strong className="font-medium text-text-primary">Inscripciones</strong>{" "}
          para asociar voluntarios a la actividad (necesario para registrar horas).
        </p>
      </div>
      <ActivityList
        activities={serializedActivities}
        volunteers={serializedVolunteers}
      />
    </div>
  );
}
