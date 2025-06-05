import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Phantom Shield</h1>
        <p className="text-xl text-gray-400 mb-8">
          Bem-vindo à sua plataforma de configuração de cloaking.
        </p>
        <div className="space-x-4">
          <Link 
            to="/login-page" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out"
          >
            Login
          </Link>
          <Link 
            to="/cadastro-page" 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out"
          >
            Cadastro
          </Link>
          <Link 
            to="/dashboard-page" 
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          {/* Você pode adicionar um link para /route-settings-page aqui se quiser permitir acesso direto após login */}
          {/* Ou, melhor ainda, o login te redireciona para um dashboard que tem o link de configurações */}
        </div>
      </div>
    </div>
  );
};

export default App;
