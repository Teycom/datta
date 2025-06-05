import React from "react";
import { LoginRequiredPage } from "components/LoginRequiredPage"; // Will be removed if AppLayout handles this

const CampaignManagementContent: React.FC = () => {
  return (
    <AppLayout>

    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-center md:text-left text-green-400 tracking-wider">
          Gerenciamento de Campanhas
        </h1>
        <p className="text-lg text-gray-400 text-center md:text-left mt-2 font-light">
          Crie, visualize e gerencie suas campanhas de cloaking.
        </p>
      </header>

      <div className="space-y-12">
        {/* Placeholder for campaign creation form */}
        <section id="create-campaign-form">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-green-500/30">
            <h2 className="text-2xl font-semibold text-green-300 mb-4">Criar Nova Campanha</h2>
            <p className="text-gray-400">O formulário para criação de campanhas será implementado aqui.</p>
            {/* TODO: Move campaign creation form from DashboardPage here */}
          </div>
        </section>

        {/* Placeholder for campaign list */}
        <section id="campaign-list">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-green-500/30">
            <h2 className="text-2xl font-semibold text-green-300 mb-4">Lista de Campanhas</h2>
            <p className="text-gray-400">A lista de campanhas existentes será exibida aqui.</p>
            {/* TODO: Move campaign listing from DashboardPage here */}
          </div>
        </section>
      </div>
    </div>
    </AppLayout>
  );
};

// If AppLayout is used, LoginRequiredPage might not be needed here, 
// as AppLayout would be wrapped by UserGuard in the router.
import AppLayout from "components/AppLayout";

const CampaignManagementPage = () => {
  return (
    <LoginRequiredPage> 
      <CampaignManagementContent />
    </LoginRequiredPage>
  );
};

export default CampaignManagementPage;
