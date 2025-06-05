import React, { useState, useEffect } from "react";
import { LoginRequiredPage } from "components/LoginRequiredPage";
import { useCurrentUser } from "app";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import brain from "brain"; // Added brain import
import { AddCloudflareAccountRequestData, ListCloudflareAccountsResponseDataAccountListItem, ConfigureDomainRequestData, ConfigureDomainResponseData } from "types";

const CloudflareConfigContent: React.FC = () => {
  const { user, loading: userLoading } = useCurrentUser();
  // State for the new form fields
  const [accountIdentifier, setAccountIdentifier] = useState("");
  const [apiTokenValue, setApiTokenValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  // State for listing Cloudflare accounts
  const [cloudflareAccountsList, setCloudflareAccountsList] = useState<ListCloudflareAccountsResponseDataAccountListItem[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  // State for configuring domain
  const [selectedAccountIdForDomainConfig, setSelectedAccountIdForDomainConfig] = useState<string>("");
  const [domainNameToConfigure, setDomainNameToConfigure] = useState<string>("");
  const [domainConfigFeedback, setDomainConfigFeedback] = useState<string | null>(null); // Adjusted to allow null
  const [domainConfigFeedbackType, setDomainConfigFeedbackType] = useState<"success" | "error" | null>(null); //Type adjusted
  const [isDomainConfiguring, setIsDomainConfiguring] = useState(false);

  const handleAddCloudflareAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast.error("Você precisa estar logado para adicionar uma conta.");
      return;
    }
    if (!accountIdentifier.trim() || !apiTokenValue.trim()) {
      toast.error("Por favor, preencha o Identificador da Conta e o Token da API Cloudflare.");
      return;
    }
    setIsProcessing(true);
    try {
      const payload: AddCloudflareAccountRequestData = {
        account_identifier: accountIdentifier.trim(),
        api_token_value: apiTokenValue.trim(),
      };
      
      // Assuming the brain client method is named after the endpoint function
      const response = await brain.add_cloudflare_account(payload);
      // The brain client typically returns a Response-like object from which we extract JSON
      const result = await response.json(); 

      if (response.ok) { // Check if the HTTP status code is 2xx
        toast.success(result.message || "Conta Cloudflare adicionada e verificada com sucesso!");
        setAccountIdentifier("");
        setApiTokenValue("");
        // TODO: Refresh list of accounts if displayed on this page (MYA-26-1)
      } else {
        // result.detail should contain the error message from HTTPException in backend
        toast.error(result.detail || result.message || "Falha ao adicionar conta Cloudflare. Verifique os detalhes e tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro ao adicionar conta Cloudflare:", error);
      // Attempt to parse error response if it's a failed API call that threw
      let errorMessage = "Ocorreu um erro inesperado. Verifique o console para detalhes.";
      if (error.response && typeof error.response.json === 'function') {
        try {
          const errorResult = await error.response.json();
          errorMessage = errorResult.detail || errorResult.message || errorMessage;
        } catch (parseError) {
          console.error("Erro ao parsear resposta de erro:", parseError);
        }
      }
      toast.error(errorMessage);
      // Refresh list of accounts
      fetchCloudflareAccounts(); 
    } finally {
      setIsProcessing(false);
    }
  };


  const fetchCloudflareAccounts = async () => {
    if (!user) return;
    setIsLoadingAccounts(true);
    try {
      const response = await brain.list_cloudflare_accounts();
      if (response.ok) {
        const data = await response.json();
        setCloudflareAccountsList(data.accounts || []);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Falha ao buscar contas Cloudflare.");
        setCloudflareAccountsList([]);
      }
    } catch (error) {
      console.error("Erro ao buscar contas Cloudflare:", error);
      toast.error("Erro de rede ao buscar contas Cloudflare.");
      setCloudflareAccountsList([]);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCloudflareAccounts();
    }
  }, [user]);

  const handleConfigureDomain = async () => {
    if (!selectedAccountIdForDomainConfig || !domainNameToConfigure.trim()) {
      setDomainConfigFeedback("Por favor, selecione uma conta Cloudflare e insira um nome de domínio válido.");
      setDomainConfigFeedbackType("error");
      return;
    }

    setIsDomainConfiguring(true);
    setDomainConfigFeedback(null);
    setDomainConfigFeedbackType(null);

    try {
      console.log("Configuring domain:", domainNameToConfigure, "with account:", selectedAccountIdForDomainConfig);
      
      // Using the specific types for request and response
      const payload: ConfigureDomainRequestData = {
        cloudflare_account_db_id: selectedAccountIdForDomainConfig,
        domain_name: domainNameToConfigure.trim(),
      };

      const response = await brain.configure_domain_endpoint(payload);
      const result: ConfigureDomainResponseData = await response.json();

      if (response.ok && result.message) { // Assuming success is indicated by ok status and presence of message
        let feedbackMessage = result.message;
        // The backend response model has a 'status' field that provides more detailed info.
        // e.g. 'active', 'pending_nameserver_update', 'error', 'already_configured'
        // We can use this for more specific feedback if needed.
        // For example: `feedbackMessage += `\nStatus: ${result.status}`

        if (result.nameservers && result.nameservers.length > 0) {
          feedbackMessage += `\n\nNameservers para configurar no seu registrador de domínio: ${result.nameservers.join(", " )}`;
        }
        if (result.status === "pending_nameserver_update"){
            feedbackMessage += "\nO domínio foi adicionado à sua conta Cloudflare. Aguarde a atualização dos nameservers.";
        } else if (result.status === "active"){
            feedbackMessage += "\nO domínio está ativo e configurado.";
        } else if (result.status === "already_configured" || result.status === "zone_created_cname_worker_route_setup_pending") {
            //This status implies it's already there and further steps are being taken or are pending
            feedbackMessage += "\nO domínio já estava configurado ou está em processo final de configuração (CNAME, Worker, Rota).";
        }

        setDomainConfigFeedback(feedbackMessage);
        setDomainConfigFeedbackType("success");
        // Optionally clear form or refresh relevant data
        // setDomainNameToConfigure("");
        // setSelectedAccountIdForDomainConfig("");
      } else {
        // If response.ok is false, result.detail often contains the error from FastAPI's HTTPException
        const errorMessage = result.detail || result.message || "Ocorreu um erro desconhecido ao configurar o domínio.";
        setDomainConfigFeedback(errorMessage);
        setDomainConfigFeedbackType("error");
      }
    } catch (error) {
      console.error("Error configuring domain:", error);
      let errorMessage = "Falha ao configurar o domínio. Verifique o console para mais detalhes.";
      // Basic error handling, can be expanded if brain throws specific error types
      if (error instanceof Error) {
        errorMessage = `Falha ao configurar o domínio: ${error.message}`;
      }
      // TODO: Add more specific error handling if brain client provides structured errors
      // e.g., if (error && typeof error === 'object' && 'json' in error) { ... }
      setDomainConfigFeedback(errorMessage);
      setDomainConfigFeedbackType("error");
    } finally {
      setIsDomainConfiguring(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <p>Carregando dados do usuário...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-center md:text-left text-purple-400 tracking-wider">
          Configurações Cloudflare
        </h1>
        <p className="text-lg text-gray-400 text-center md:text-left mt-2 font-light">
          Adicione suas contas Cloudflare para integração com a plataforma Phantom Shield.
        </p>
      </header>

      <div className="space-y-12">
        <section id="add-cloudflare-account">
          <Card className="w-full max-w-2xl mx-auto bg-gray-800 border border-purple-500/30 shadow-[0_0_15px_rgba(128,0,128,0.2)]">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-purple-300 tracking-wide">
                Adicionar Nova Conta Cloudflare
              </CardTitle>
              <CardDescription className="text-gray-400">
                Forneça um identificador para esta conta e cole diretamente o seu token da API Cloudflare (com permissões de Zona:Leitura, Worker:Edição e KV Storage:Leitura/Escrita).
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddCloudflareAccount}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="accountIdentifier" className="text-gray-300">
                    Identificador da Conta (Apelido)
                  </Label>
                  <Input
                    id="accountIdentifier"
                    name="accountIdentifier"
                    type="text"
                    placeholder="ex: minha-conta-cf-principal"
                    value={accountIdentifier}
                    onChange={(e) => setAccountIdentifier(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                    disabled={isProcessing}
                  />
                   <p className="text-xs text-gray-500">Um nome único que você escolher para identificar esta configuração de conta Cloudflare.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiTokenValue" className="text-gray-300">
                    Seu Token da API Cloudflare
                  </Label>
                  <Input
                    id="apiTokenValue"
                    name="apiTokenValue"
                    type="password" // Changed to password for sensitive data
                    placeholder="Cole seu token da API Cloudflare aqui"
                    value={apiTokenValue}
                    onChange={(e) => setApiTokenValue(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-gray-500">Cole diretamente o token da API Cloudflare. Ele será enviado de forma segura e armazenado criptografado.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-700 pt-6 flex justify-end">
                <Button
                  type="submit"
                  disabled={isProcessing || userLoading}
                  className="bg-purple-500 hover:bg-purple-400 text-gray-900 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-purple-500/40 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adicionando e Verificando...
                    </>
                  ) : (
                    "Adicionar e Validar Conta"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </section>

        {/* Section to Configure Domain */}
        <section id="configure-domain" className="mt-12">
          <Card className="w-full max-w-2xl mx-auto bg-gray-800 border border-purple-500/30 shadow-[0_0_15px_rgba(128,0,128,0.2)]">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-purple-300 tracking-wide">
                Configurar Domínio Principal
              </CardTitle>
              <CardDescription className="text-gray-400">
                Associe um domínio à sua conta Cloudflare e configure-o para uso com a Phantom Shield.
                Isso irá automaticamente tentar adicionar a zona ao Cloudflare (se não existir), criar um CNAME wildcard e instalar um worker genérico.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cloudflareAccountSelect" className="text-gray-300">
                  Selecionar Conta Cloudflare
                </Label>
                <Select
                  value={selectedAccountIdForDomainConfig}
                  onValueChange={setSelectedAccountIdForDomainConfig}
                  disabled={isLoadingAccounts || cloudflareAccountsList.length === 0 || isDomainConfiguring}
                >
                  <SelectTrigger id="cloudflareAccountSelect" className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500">
                    <SelectValue placeholder="Selecione uma conta Cloudflare" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600 text-white">
                    {isLoadingAccounts ? (
                      <SelectItem value="loading" disabled className="text-gray-400">Carregando contas...</SelectItem>
                    ) : cloudflareAccountsList.length === 0 ? (
                      <SelectItem value="no-accounts" disabled className="text-gray-400">Nenhuma conta Cloudflare disponível</SelectItem>
                    ) : (
                      cloudflareAccountsList.filter(acc => acc.status === 'verified').map((account) => (
                        <SelectItem
                          key={account.account_storage_key}
                          value={account.account_storage_key}
                          className="hover:bg-purple-600/30 focus:bg-purple-600/50"
                        >
                          {account.identifier} (ID: ...{account.account_storage_key.slice(-6)})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {cloudflareAccountsList.filter(acc => acc.status === 'verified').length === 0 && !isLoadingAccounts && (
                   <p className="text-xs text-red-400">Nenhuma conta Cloudflare verificada encontrada. Adicione e valide uma conta acima para configurar um domínio.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="domainNameToConfigure" className="text-gray-300">
                  Nome do Domínio
                </Label>
                <Input
                  id="domainNameToConfigure"
                  type="text"
                  placeholder="ex: meudominio.com"
                  value={domainNameToConfigure}
                  onChange={(e) => setDomainNameToConfigure(e.target.value)}
                  disabled={isDomainConfiguring}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500">O domínio principal que você deseja configurar (sem http:// ou https://).</p>
              </div>
              
              {domainConfigFeedback && (
                <Alert variant={domainConfigFeedbackType === "success" ? "default" : "destructive"} className={`${domainConfigFeedbackType === "success" ? "bg-green-900/30 border-green-500/50" : "bg-red-900/30 border-red-500/50"}`}>
                    <AlertTitle className={domainConfigFeedbackType === "success" ? "text-green-300" : "text-red-300" }>
                        {domainConfigFeedbackType === "success" ? "Configuração do Domínio" : "Erro na Configuração"}
                    </AlertTitle>
                    <AlertDescription className="text-gray-300 whitespace-pre-wrap">
                    {domainConfigFeedback}
                    </AlertDescription>
                </Alert>
              )}

            </CardContent>
            <CardFooter className="border-t border-gray-700 pt-6 flex justify-end">
                <Button
                    onClick={handleConfigureDomain}
                    type="button"
                    disabled={isDomainConfiguring || isLoadingAccounts || !selectedAccountIdForDomainConfig || !domainNameToConfigure.trim() || cloudflareAccountsList.filter(acc => acc.status === 'verified').length === 0}
                    className="bg-green-500 hover:bg-green-400 text-gray-900 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-green-500/40 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    {isDomainConfiguring ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Configurando Domínio...
                        </>
                    ) : (
                        "Configurar Domínio"
                    )}
                </Button>
            </CardFooter>
          </Card>
        </section>

        {/* Section to list existing Cloudflare accounts */}
        <section id="list-cloudflare-accounts" className="mt-12">
           <Card className="w-full max-w-2xl mx-auto bg-gray-800 border border-purple-500/30 shadow-[0_0_15px_rgba(128,0,128,0.2)]">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-purple-300 tracking-wide">
                Contas Cloudflare Configuradas
              </CardTitle>
              <CardDescription className="text-gray-400">
                Lista de contas Cloudflare já adicionadas e verificadas na plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAccounts ? (
                <p className="text-center text-gray-500">Carregando contas Cloudflare...</p>
              ) : cloudflareAccountsList.length === 0 ? (
                <p className="text-center text-gray-500">Nenhuma conta Cloudflare configurada ainda. Adicione uma conta acima.</p>
              ) : (
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-purple-300">Identificador (Apelido)</TableHead>
                      <TableHead className="text-purple-300">Status</TableHead>
                      <TableHead className="text-purple-300">ID de Armazenamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cloudflareAccountsList.map((account) => (
                      <TableRow key={account.account_storage_key} className="border-gray-700 hover:bg-gray-700/30">
                        <TableCell className="text-gray-300">{account.identifier}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              account.status === "verified"
                                ? "bg-green-600/30 text-green-300"
                                : account.status === "verification_failed"
                                ? "bg-red-600/30 text-red-300"
                                : "bg-yellow-600/30 text-yellow-300" // Default/pending status
                            }`}
                          >
                            {account.status === "verified" ? "Verificada" 
                             : account.status === "verification_failed" ? "Falha na Verificação" 
                             : account.status === "pending_verification" ? "Pendente"
                             : account.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">{account.account_storage_key}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
};

const CloudflareConfigPage = () => {
  return (
    <LoginRequiredPage>
      <CloudflareConfigContent />
    </LoginRequiredPage>
  );
};

export default CloudflareConfigPage;
