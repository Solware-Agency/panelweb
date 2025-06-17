import { MedicalForm } from "@/components/MedicalForm";

const Index = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <main>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Registrar Nuevo Cliente</h2>
          <div className="w-24 h-1 bg-primary mt-3 rounded-full" />
          <p className="text-muted-foreground mt-4">
            Completa el formulario para registrar un nuevo cliente médico
          </p>
        </div>
        <MedicalForm />
      </main>
    </div>
  );
};

export default Index;