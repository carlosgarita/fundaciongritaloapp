import { ActivityService } from "@/lib/services/activity.service";
import { ActivityList } from "./activity-list";

export default async function ActividadesPage() {
  const activities = await ActivityService.findAll();

  // Serialize for client component (Date objects → ISO strings)
  const serialized = JSON.parse(JSON.stringify(activities));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Actividades</h1>
        <p className="text-text-secondary mt-1">
          Crea y administra las actividades de voluntariado.
        </p>
      </div>
      <ActivityList activities={serialized} />
    </div>
  );
}
