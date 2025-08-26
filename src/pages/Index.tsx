import { Header } from "@/components/Header";
import { UploadForm } from "@/components/UploadForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Header />
      <main className="py-8">
        <UploadForm />
      </main>
    </div>
  );
};

export default Index;
