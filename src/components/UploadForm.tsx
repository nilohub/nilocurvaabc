import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

interface ExcelData {
  quantitySold: number;
  valueBrl: number;
  profitBrl: number;
  quantityPercentage: number;
  valuePercentage: number;
  profitPercentage: number;
}

interface FileUpload {
  file: File;
  month: string;
}

export function UploadForm() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [year, setYear] = useState("");
  const [store, setStore] = useState("");
  const [subgroup, setSubgroup] = useState("");
  const [session, setSession] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const months = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" }
  ];

  const years = [
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
    { value: "2028", label: "2028" },
    { value: "2029", label: "2029" },
    { value: "2030", label: "2030" }
  ];

  const stores = [
    "LOJA 01", "LOJA 02", "LOJA 05", "LOJA 07", "LOJA 08", "LOJA 09"
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    const validFiles: FileUpload[] = [];
    for (const file of selectedFiles) {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        toast({
          title: "Arquivo inválido",
          description: `${file.name} não é um arquivo Excel válido (.xlsx ou .xls)`,
          variant: "destructive"
        });
        continue;
      }
      validFiles.push({ file, month: "" });
    }
    
    if (validFiles.length > 0) {
      setFiles(validFiles);
    }
  };

  const handleMonthChange = (index: number, month: string) => {
    setFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, month } : item
    ));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processExcelFile = async (file: File): Promise<ExcelData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Get the range and convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: 0 });
          
          // Skip header row (index 0) and process data
          const dataRows = jsonData.slice(1) as any[][];
          
          let quantitySold = 0;    // Column C (index 2)
          let valueBrl = 0;        // Column D (index 3)  
          let profitBrl = 0;       // Column H (index 7)
          let quantityPercentage = 0; // Column I (index 8)
          let valuePercentage = 0;    // Column J (index 9)
          let profitPercentage = 0;   // Column K (index 10)

          dataRows.forEach((row) => {
            if (row.length >= 11) { // Ensure we have at least 11 columns (A-K)
              quantitySold += Number(row[2]) || 0;
              valueBrl += Number(row[3]) || 0;
              profitBrl += Number(row[7]) || 0;
              quantityPercentage += Number(row[8]) || 0;
              valuePercentage += Number(row[9]) || 0;
              profitPercentage += Number(row[10]) || 0;
            }
          });

          resolve({
            quantitySold,
            valueBrl,
            profitBrl,
            quantityPercentage,
            valuePercentage,
            profitPercentage
          });
        } catch (error) {
          reject(new Error("Erro ao processar arquivo Excel"));
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0 || !year || !store || !subgroup || !session) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos e selecione pelo menos um arquivo",
        variant: "destructive"
      });
      return;
    }

    // Validate that all files have months assigned
    const filesWithoutMonth = files.filter(f => !f.month);
    if (filesWithoutMonth.length > 0) {
      toast({
        title: "Mês obrigatório",
        description: "Por favor, selecione o mês para todos os arquivos",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate months
    const months = files.map(f => f.month);
    const duplicateMonths = months.filter((month, index) => months.indexOf(month) !== index);
    if (duplicateMonths.length > 0) {
      toast({
        title: "Meses duplicados",
        description: "Cada arquivo deve ter um mês único",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const allData = [];
      
      // Process each file
      for (const fileUpload of files) {
        const excelData = await processExcelFile(fileUpload.file);
        allData.push({
          month: fileUpload.month,
          session,
          group: subgroup,
          subgroup,
          store,
          quantity_sold: excelData.quantitySold,
          value_brl: excelData.valueBrl,
          profit_brl: excelData.profitBrl,
          quantity_percentage: excelData.quantityPercentage,
          value_percentage: excelData.valuePercentage,
          profit_percentage: excelData.profitPercentage
        });
      }
      
      // Insert all data into Supabase
      const { error } = await supabase
        .from('sales_data')
        .insert(allData);

      if (error) {
        throw error;
      }

      toast({
        title: "Upload realizado com sucesso!",
        description: `${files.length} arquivo(s) processado(s) e salvos no banco de dados.`,
        variant: "default"
      });

      // Reset form
      setFiles([]);
      setYear("");
      setStore("");
      setSubgroup("");
      setSession("");
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error processing upload:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao processar os arquivos. Verifique se o formato está correto.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg border-0 bg-gradient-card">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <FileSpreadsheet className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Upload de Dados de Vendas</CardTitle>
          <CardDescription className="text-lg">
            Faça upload do arquivo Excel com os dados de vendas para análise
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-sm font-medium">
                Arquivos Excel (.xlsx ou .xls) - Múltiplos meses
              </Label>
              <div className="relative">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  multiple
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
              
              {/* Display selected files with month selectors */}
              {files.length > 0 && (
                <div className="mt-4 space-y-3">
                  <Label className="text-sm font-medium">Arquivos selecionados:</Label>
                  {files.map((fileUpload, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="text-sm flex-1 truncate">{fileUpload.file.name}</span>
                      <Select value={fileUpload.month} onValueChange={(value) => handleMonthChange(index, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y.value} value={y.value}>
                        {y.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store">Loja</Label>
                <Select value={store} onValueChange={setStore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session">Sessão</Label>
                <Input
                  id="session"
                  placeholder="Ex: Sessão A"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subgroup">Subgrupo</Label>
                <Input
                  id="subgroup"
                  placeholder="Ex: Smartphones"
                  value={subgroup}
                  onChange={(e) => setSubgroup(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium py-3"
              disabled={isProcessing || files.length === 0}
            >
              {isProcessing ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                  Processando {files.length} arquivo(s)...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload de {files.length > 0 ? files.length : ''} Arquivo(s)
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}