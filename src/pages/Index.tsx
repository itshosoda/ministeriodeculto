import { useState, useEffect } from "react";
import ScheduleCard from "@/components/ScheduleCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Church, Users, Plus, Save, FileDown } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ScheduleItem {
  activity: string;
  time: string;
  name?: string;
  date?: Date;
}

interface Ministry {
  name: string;
  responsavel: string;
}

interface Vocacionados {
  names: string[];
  date?: Date;
  ministries?: Ministry[];
}

interface MemberStats {
  totalMembros: string;
  visitantes: string;
  criancas: string;
  vocacionados: string;
  observacao: string;
}

const Index = () => {
  const initialThursdaySchedule = [
    { activity: "Louvor", time: "19:30-19:45", name: "", date: undefined },
    { activity: "Oferta", time: "19:45-19:50", name: "", date: undefined },
    { activity: "Conexão", time: "19:50-19:55", name: "", date: undefined },
    { activity: "Testemunho", time: "19:55-20:05", name: "", date: undefined },
    { activity: "Pregação", time: "20:05-20:30", name: "", date: undefined },
    { activity: "Apelo+Ministração final", time: "20:30-20:40", name: "", date: undefined },
    { activity: "Benção Apostólica", time: "20:40", name: "", date: undefined },
  ];

  const initialSundayMorningSchedule = [
    { activity: "Abertura", time: "09:15-09:20", name: "", date: undefined },
    { activity: "Louvor", time: "09:20-09:45", name: "", date: undefined },
    { activity: "Oferta", time: "09:45-09:50", name: "", date: undefined },
    { activity: "Conexão", time: "09:50-09:55", name: "", date: undefined },
    { activity: "Pregação", time: "09:55-10:30", name: "", date: undefined },
    { activity: "Apelo+Ministração final", time: "10:30-10:45", name: "", date: undefined },
    { activity: "Benção Apostólica", time: "10:45", name: "", date: undefined },
  ];

  const initialSundayEveningSchedule = [
    { activity: "Abertura", time: "18:30-18:35", name: "", date: undefined },
    { activity: "Louvor", time: "18:35-19:05", name: "", date: undefined },
    { activity: "Oferta", time: "19:05-19:10", name: "", date: undefined },
    { activity: "Conexão", time: "19:10-19:15", name: "", date: undefined },
    { activity: "Pregação", time: "19:15-20:10", name: "", date: undefined },
    { activity: "Apelo+Ministração final", time: "20:10-20:30", name: "", date: undefined },
    { activity: "Benção Apostólica", time: "20:30", name: "", date: undefined },
  ];

  const initialConexaoPreSchedule = [
    { activity: "Abertura", time: "18:30-18:35", name: "", date: undefined },
    { activity: "Louvor", time: "18:35-19:05", name: "", date: undefined },
    { activity: "Oferta", time: "19:05-19:10", name: "", date: undefined },
    { activity: "Conexão", time: "19:10-19:15", name: "", date: undefined },
    { activity: "Pregação", time: "19:15-20:10", name: "", date: undefined },
    { activity: "Apelo+Ministração final", time: "20:10-20:30", name: "", date: undefined },
    { activity: "Benção Apostólica", time: "20:30", name: "", date: undefined },
  ];

  const initialSaturdaySchedule = [
    { activity: "Abertura", time: "19:30-19:35", name: "", date: undefined },
    { activity: "Louvor", time: "19:35-20:05", name: "", date: undefined },
    { activity: "Oferta", time: "20:05-20:10", name: "", date: undefined },
    { activity: "Conexão", time: "20:10-20:15", name: "", date: undefined },
    { activity: "Pregação", time: "20:15-21:10", name: "", date: undefined },
    { activity: "Apelo+Ministração final", time: "21:10-21:30", name: "", date: undefined },
    { activity: "Benção Apostólica", time: "21:30", name: "", date: undefined },
  ];

  const fixedMinistries: Ministry[] = [
    { name: "Intercessão", responsavel: "" },
    { name: "Junta Diaconal", responsavel: "" },
    { name: "Mídia Social", responsavel: "" },
    { name: "Mídia de Transmissão", responsavel: "" },
    { name: "Dança", responsavel: "" },
    { name: "Libras", responsavel: "" },
    { name: "Ministério de Culto", responsavel: "" },
  ];

  const [thursdaySchedule, setThursdaySchedule] = useState<ScheduleItem[]>(() => {
    return initialThursdaySchedule;
  });

  const [sundayMorningSchedule, setSundayMorningSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem("sundayMorningSchedule");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((item: any) => ({
        ...item,
        date: item.date ? new Date(item.date) : undefined
      }));
    }
    return initialSundayMorningSchedule;
  });

  const [sundayEveningSchedule, setSundayEveningSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem("sundayEveningSchedule");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((item: any) => ({
        ...item,
        date: item.date ? new Date(item.date) : undefined
      }));
    }
    return initialSundayEveningSchedule;
  });

  const [conexaoPreSchedule, setConexaoPreSchedule] = useState<ScheduleItem[]>(() => {
    return initialConexaoPreSchedule;
  });

  const [saturdaySchedule, setSaturdaySchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem("saturdaySchedule");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((item: any) => ({
        ...item,
        date: item.date ? new Date(item.date) : undefined
      }));
    }
    return initialSaturdaySchedule;
  });

  const [thursdayVocacionados, setThursdayVocacionados] = useState<Vocacionados>(() => {
    const saved = localStorage.getItem("thursdayVocacionados");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        names: parsed.names || [],
        date: parsed.date ? new Date(parsed.date) : undefined,
        ministries: parsed.ministries || fixedMinistries
      };
    }
    return { names: [], date: undefined, ministries: fixedMinistries };
  });

  const [sundayMorningVocacionados, setSundayMorningVocacionados] = useState<Vocacionados>(() => {
    const saved = localStorage.getItem("sundayMorningVocacionados");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        names: parsed.names || [],
        date: parsed.date ? new Date(parsed.date) : undefined,
        ministries: parsed.ministries || fixedMinistries
      };
    }
    return { names: [], date: undefined, ministries: fixedMinistries };
  });

  const [sundayEveningVocacionados, setSundayEveningVocacionados] = useState<Vocacionados>(() => {
    const saved = localStorage.getItem("sundayEveningVocacionados");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        names: parsed.names || [],
        date: parsed.date ? new Date(parsed.date) : undefined,
        ministries: parsed.ministries || fixedMinistries
      };
    }
    return { names: [], date: undefined, ministries: fixedMinistries };
  });

  const [conexaoPreVocacionados, setConexaoPreVocacionados] = useState<Vocacionados>(() => {
    const saved = localStorage.getItem("conexaoPreVocacionados");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        names: parsed.names || [],
        date: parsed.date ? new Date(parsed.date) : undefined,
        ministries: parsed.ministries || fixedMinistries
      };
    }
    return { names: [], date: undefined, ministries: fixedMinistries };
  });

  const [saturdayVocacionados, setSaturdayVocacionados] = useState<Vocacionados>(() => {
    const saved = localStorage.getItem("saturdayVocacionados");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        names: parsed.names || [],
        date: parsed.date ? new Date(parsed.date) : undefined,
        ministries: parsed.ministries || fixedMinistries
      };
    }
    return { names: [], date: undefined, ministries: fixedMinistries };
  });

  const [thursdayMemberStats, setThursdayMemberStats] = useState<MemberStats>(() => {
    const saved = localStorage.getItem("thursdayMemberStats");
    return saved ? JSON.parse(saved) : { totalMembros: "", visitantes: "", criancas: "", vocacionados: "", observacao: "" };
  });

  const [sundayMorningMemberStats, setSundayMorningMemberStats] = useState<MemberStats>(() => {
    const saved = localStorage.getItem("sundayMorningMemberStats");
    return saved ? JSON.parse(saved) : { totalMembros: "", visitantes: "", criancas: "", vocacionados: "", observacao: "" };
  });

  const [sundayEveningMemberStats, setSundayEveningMemberStats] = useState<MemberStats>(() => {
    const saved = localStorage.getItem("sundayEveningMemberStats");
    return saved ? JSON.parse(saved) : { totalMembros: "", visitantes: "", criancas: "", vocacionados: "", observacao: "" };
  });

  const [conexaoPreMemberStats, setConexaoPreMemberStats] = useState<MemberStats>(() => {
    const saved = localStorage.getItem("conexaoPreMemberStats");
    return saved ? JSON.parse(saved) : { totalMembros: "", visitantes: "", criancas: "", vocacionados: "", observacao: "" };
  });

  const [saturdayMemberStats, setSaturdayMemberStats] = useState<MemberStats>(() => {
    const saved = localStorage.getItem("saturdayMemberStats");
    return saved ? JSON.parse(saved) : { totalMembros: "", visitantes: "", criancas: "", vocacionados: "", observacao: "" };
  });

  const [isObservationUnlocked, setIsObservationUnlocked] = useState(false);
  const [observationPassword, setObservationPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const OBSERVATION_PASSWORD = "admin123";

  const { toast } = useToast();

  // Limpa localStorage de quinta-feira para aplicar novos horários
  useEffect(() => {
    localStorage.removeItem("thursdaySchedule");
  }, []);

  useEffect(() => {
    localStorage.setItem("thursdaySchedule", JSON.stringify(thursdaySchedule));
  }, [thursdaySchedule]);

  useEffect(() => {
    localStorage.setItem("sundayMorningSchedule", JSON.stringify(sundayMorningSchedule));
  }, [sundayMorningSchedule]);

  useEffect(() => {
    localStorage.setItem("sundayEveningSchedule", JSON.stringify(sundayEveningSchedule));
  }, [sundayEveningSchedule]);

  useEffect(() => {
    localStorage.setItem("thursdayVocacionados", JSON.stringify(thursdayVocacionados));
  }, [thursdayVocacionados]);

  useEffect(() => {
    localStorage.setItem("sundayMorningVocacionados", JSON.stringify(sundayMorningVocacionados));
  }, [sundayMorningVocacionados]);

  useEffect(() => {
    localStorage.setItem("sundayEveningVocacionados", JSON.stringify(sundayEveningVocacionados));
  }, [sundayEveningVocacionados]);

  useEffect(() => {
    localStorage.setItem("thursdayMemberStats", JSON.stringify(thursdayMemberStats));
  }, [thursdayMemberStats]);

  useEffect(() => {
    localStorage.setItem("sundayMorningMemberStats", JSON.stringify(sundayMorningMemberStats));
  }, [sundayMorningMemberStats]);

  useEffect(() => {
    localStorage.setItem("sundayEveningMemberStats", JSON.stringify(sundayEveningMemberStats));
  }, [sundayEveningMemberStats]);

  // Limpa localStorage de conexão pré para aplicar novos horários
  useEffect(() => {
    localStorage.removeItem("conexaoPreSchedule");
  }, []);

  useEffect(() => {
    localStorage.setItem("conexaoPreSchedule", JSON.stringify(conexaoPreSchedule));
  }, [conexaoPreSchedule]);

  useEffect(() => {
    localStorage.setItem("conexaoPreVocacionados", JSON.stringify(conexaoPreVocacionados));
  }, [conexaoPreVocacionados]);

  useEffect(() => {
    localStorage.setItem("conexaoPreMemberStats", JSON.stringify(conexaoPreMemberStats));
  }, [conexaoPreMemberStats]);

  useEffect(() => {
    localStorage.setItem("saturdaySchedule", JSON.stringify(saturdaySchedule));
  }, [saturdaySchedule]);

  useEffect(() => {
    localStorage.setItem("saturdayVocacionados", JSON.stringify(saturdayVocacionados));
  }, [saturdayVocacionados]);

  useEffect(() => {
    localStorage.setItem("saturdayMemberStats", JSON.stringify(saturdayMemberStats));
  }, [saturdayMemberStats]);

  useEffect(() => {
    localStorage.removeItem("thursdaySchedule");
  }, []);

  useEffect(() => {
    localStorage.removeItem("conexaoPreSchedule");
  }, []);

  useEffect(() => {
    localStorage.removeItem("saturdaySchedule");
  }, []);

  const handleThursdayNameChange = (index: number, name: string) => {
    const updated = [...thursdaySchedule];
    updated[index] = { ...updated[index], name };
    setThursdaySchedule(updated);
  };

  const handleSundayMorningNameChange = (index: number, name: string) => {
    const updated = [...sundayMorningSchedule];
    updated[index] = { ...updated[index], name };
    setSundayMorningSchedule(updated);
  };

  const handleSundayEveningNameChange = (index: number, name: string) => {
    const updated = [...sundayEveningSchedule];
    updated[index] = { ...updated[index], name };
    setSundayEveningSchedule(updated);
  };

  const handleThursdayDateChange = (index: number, date: Date | undefined) => {
    const updated = [...thursdaySchedule];
    updated[index] = { ...updated[index], date };
    setThursdaySchedule(updated);
  };

  const handleSundayMorningDateChange = (index: number, date: Date | undefined) => {
    const updated = [...sundayMorningSchedule];
    updated[index] = { ...updated[index], date };
    setSundayMorningSchedule(updated);
  };

  const handleSundayEveningDateChange = (index: number, date: Date | undefined) => {
    const updated = [...sundayEveningSchedule];
    updated[index] = { ...updated[index], date };
    setSundayEveningSchedule(updated);
  };

  const handleThursdayVocacionadosDateChange = (date: Date | undefined) => {
    setThursdayVocacionados({ ...thursdayVocacionados, date });
  };

  const handleThursdayMinistryChange = (index: number, responsavel: string) => {
    const updatedMinistries = [...(thursdayVocacionados.ministries || fixedMinistries)];
    updatedMinistries[index] = { ...updatedMinistries[index], responsavel };
    setThursdayVocacionados({ ...thursdayVocacionados, ministries: updatedMinistries });
  };

  const handleSundayMorningVocacionadosDateChange = (date: Date | undefined) => {
    setSundayMorningVocacionados({ ...sundayMorningVocacionados, date });
  };

  const handleSundayMorningMinistryChange = (index: number, responsavel: string) => {
    const updatedMinistries = [...(sundayMorningVocacionados.ministries || fixedMinistries)];
    updatedMinistries[index] = { ...updatedMinistries[index], responsavel };
    setSundayMorningVocacionados({ ...sundayMorningVocacionados, ministries: updatedMinistries });
  };

  const handleSundayEveningVocacionadosDateChange = (date: Date | undefined) => {
    setSundayEveningVocacionados({ ...sundayEveningVocacionados, date });
  };

  const handleSundayEveningMinistryChange = (index: number, responsavel: string) => {
    const updatedMinistries = [...(sundayEveningVocacionados.ministries || fixedMinistries)];
    updatedMinistries[index] = { ...updatedMinistries[index], responsavel };
    setSundayEveningVocacionados({ ...sundayEveningVocacionados, ministries: updatedMinistries });
  };

  const handleConexaoPreNameChange = (index: number, name: string) => {
    const updated = [...conexaoPreSchedule];
    updated[index] = { ...updated[index], name };
    setConexaoPreSchedule(updated);
  };

  const handleConexaoPreDateChange = (index: number, date: Date | undefined) => {
    const updated = [...conexaoPreSchedule];
    updated[index] = { ...updated[index], date };
    setConexaoPreSchedule(updated);
  };

  const handleConexaoPreVocacionadosDateChange = (date: Date | undefined) => {
    setConexaoPreVocacionados({ ...conexaoPreVocacionados, date });
  };

  const handleConexaoPreMinistryChange = (index: number, responsavel: string) => {
    const updatedMinistries = [...(conexaoPreVocacionados.ministries || fixedMinistries)];
    updatedMinistries[index] = { ...updatedMinistries[index], responsavel };
    setConexaoPreVocacionados({ ...conexaoPreVocacionados, ministries: updatedMinistries });
  };

  const handleSaturdayNameChange = (index: number, name: string) => {
    const updated = [...saturdaySchedule];
    updated[index] = { ...updated[index], name };
    setSaturdaySchedule(updated);
  };

  const handleSaturdayDateChange = (index: number, date: Date | undefined) => {
    const updated = [...saturdaySchedule];
    updated[index] = { ...updated[index], date };
    setSaturdaySchedule(updated);
  };

  const handleSaturdayVocacionadosDateChange = (date: Date | undefined) => {
    setSaturdayVocacionados({ ...saturdayVocacionados, date });
  };

  const handleSaturdayMinistryChange = (index: number, responsavel: string) => {
    const updatedMinistries = [...(saturdayVocacionados.ministries || fixedMinistries)];
    updatedMinistries[index] = { ...updatedMinistries[index], responsavel };
    setSaturdayVocacionados({ ...saturdayVocacionados, ministries: updatedMinistries });
  };

  const handlePasswordSubmit = () => {
    if (observationPassword === OBSERVATION_PASSWORD) {
      setIsObservationUnlocked(true);
      setShowPasswordDialog(false);
      setObservationPassword("");
      toast({
        title: "Acesso liberado!",
        description: "Você pode editar as observações agora.",
      });
    } else {
      toast({
        title: "Senha incorreta",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const [selectedFilterDate, setSelectedFilterDate] = useState<Date | undefined>();
  const [selectedCulto, setSelectedCulto] = useState<string>("all");

  const getActivitiesByDateAndCulto = (date: Date | undefined, culto: string) => {
    if (!date) return [];
    
    const activities: Array<ScheduleItem & { 
      source: string; 
      vocacionados?: string;
      memberStats?: MemberStats;
    }> = [];
    
    if (culto === "all" || culto === "thursday") {
      thursdaySchedule.forEach(item => {
        if (item.date && isSameDay(item.date, date)) {
          const ministriesText = thursdayVocacionados.ministries
            ?.map(m => `${m.name}: ${m.responsavel || "-"}`)
            .join(", ");
          activities.push({ 
            ...item, 
            source: "Quinta-feira",
            vocacionados: ministriesText || "-",
            memberStats: thursdayMemberStats
          });
        }
      });
    }
    
    if (culto === "all" || culto === "sunday-morning") {
      sundayMorningSchedule.forEach(item => {
        if (item.date && isSameDay(item.date, date)) {
          const ministriesText = sundayMorningVocacionados.ministries
            ?.map(m => `${m.name}: ${m.responsavel || "-"}`)
            .join(", ");
          activities.push({ 
            ...item, 
            source: "Domingo (Manhã)",
            vocacionados: ministriesText || "-",
            memberStats: sundayMorningMemberStats
          });
        }
      });
    }
    
    if (culto === "all" || culto === "sunday-evening") {
      sundayEveningSchedule.forEach(item => {
        if (item.date && isSameDay(item.date, date)) {
          const ministriesText = sundayEveningVocacionados.ministries
            ?.map(m => `${m.name}: ${m.responsavel || "-"}`)
            .join(", ");
          activities.push({ 
            ...item, 
            source: "Domingo (Noite)",
            vocacionados: ministriesText || "-",
            memberStats: sundayEveningMemberStats
          });
        }
      });
    }

    if (culto === "all" || culto === "conexao-pre") {
      conexaoPreSchedule.forEach(item => {
        if (item.date && isSameDay(item.date, date)) {
          const ministriesText = conexaoPreVocacionados.ministries
            ?.map(m => `${m.name}: ${m.responsavel || "-"}`)
            .join(", ");
          activities.push({ 
            ...item, 
            source: "Conexão Pré",
            vocacionados: ministriesText || "-",
            memberStats: conexaoPreMemberStats
          });
        }
      });
    }

    if (culto === "all" || culto === "saturday") {
      saturdaySchedule.forEach(item => {
        if (item.date && isSameDay(item.date, date)) {
          const ministriesText = saturdayVocacionados.ministries
            ?.map(m => `${m.name}: ${m.responsavel || "-"}`)
            .join(", ");
          activities.push({ 
            ...item, 
            source: "Sábado",
            vocacionados: ministriesText || "-",
            memberStats: saturdayMemberStats
          });
        }
      });
    }
    
    return activities;
  };

  const filteredActivities = getActivitiesByDateAndCulto(selectedFilterDate, selectedCulto);

  const handleSaveVocacionados = (type: string) => {
    toast({
      title: "Vocacionados salvos!",
      description: `Os vocacionados de ${type} foram salvos com sucesso.`,
    });
  };

  const handleSaveMemberStats = (type: string) => {
    toast({
      title: "Dados salvos!",
      description: `Os dados de controle de membros de ${type} foram salvos com sucesso.`,
    });
  };

  const exportToPDF = () => {
    if (!selectedFilterDate || filteredActivities.length === 0) {
      toast({
        title: "Nenhuma programação para exportar",
        description: "Selecione uma data com programações para exportar.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Programação dos Cultos", 14, 20);
    
    // Subtítulo com data
    doc.setFontSize(12);
    doc.text(format(selectedFilterDate, "PPP", { locale: ptBR }), 14, 30);
    
    // Tabela de programação
    const scheduleData = filteredActivities.map(activity => [
      activity.source,
      activity.time,
      activity.activity,
      activity.name || "-"
    ]);
    
    autoTable(doc, {
      head: [["Culto", "Horário", "Programação", "Responsável"]],
      body: scheduleData,
      startY: 40,
      theme: "grid",
      headStyles: { fillColor: [139, 92, 246] },
    });
    
    // Vocacionados
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(14);
    doc.text("Vocacionados", 14, finalY + 15);
    doc.setFontSize(10);
    doc.text(filteredActivities[0].vocacionados || "Nenhum vocacionado registrado", 14, finalY + 22);
    
    // Controle de Membros
    if (filteredActivities[0].memberStats) {
      const stats = filteredActivities[0].memberStats;
      doc.setFontSize(14);
      doc.text("Controle de Membros", 14, finalY + 35);
      
      const memberData = [[
        stats.totalMembros || "-",
        stats.visitantes || "-",
        stats.criancas || "-",
        stats.vocacionados || "-"
      ]];
      
      autoTable(doc, {
        head: [["Total de Membros", "Visitantes", "Crianças", "Vocacionados Presentes"]],
        body: memberData,
        startY: finalY + 40,
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246] },
      });
    }
    
    // Salvar PDF
    doc.save(`programacao-${format(selectedFilterDate, "yyyy-MM-dd")}.pdf`);
    
    toast({
      title: "PDF exportado!",
      description: "A programação foi exportada com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-12">
        <header className="relative text-center mb-12 animate-fade-in">
          <img 
            src={logo} 
            alt="Igreja Metodista Wesleyana" 
            className="absolute right-0 top-0 h-20 object-contain"
          />
          <div className="flex items-center justify-center gap-3 mb-4">
            <Church className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Programação dos Cultos
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Organize e visualize os horários dos cultos da sua igreja
          </p>
        </header>

        <Tabs defaultValue="thursday" className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-auto p-1 bg-card/50 backdrop-blur-sm">
            <TabsTrigger 
              value="thursday" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground py-3 text-base font-semibold"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Quinta-feira
            </TabsTrigger>
            <TabsTrigger 
              value="saturday" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground py-3 text-base font-semibold"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Sábado
            </TabsTrigger>
            <TabsTrigger 
              value="sunday" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground py-3 text-base font-semibold"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Domingo
            </TabsTrigger>
            <TabsTrigger 
              value="conexao-pre" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground py-3 text-base font-semibold"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Conexão Pré
            </TabsTrigger>
          </TabsList>

          <TabsContent value="thursday" className="animate-fade-in">
            <div className="max-w-2xl mx-auto space-y-6">
              <ScheduleCard
                title="Culto de Quinta-feira"
                subtitle="Programação da noite"
                schedule={thursdaySchedule}
                variant="primary"
                onNameChange={handleThursdayNameChange}
                onDateChange={handleThursdayDateChange}
                vocacionados={thursdayVocacionados}
                onVocacionadosDateChange={handleThursdayVocacionadosDateChange}
                onMinistryChange={handleThursdayMinistryChange}
                memberStats={thursdayMemberStats}
                onMemberStatsChange={setThursdayMemberStats}
                onSaveVocacionados={() => handleSaveVocacionados("Quinta-feira")}
                onSaveMemberStats={() => handleSaveMemberStats("Quinta-feira")}
                isObservationUnlocked={isObservationUnlocked}
                onObservationClick={() => setShowPasswordDialog(true)}
              />
            </div>
          </TabsContent>

          <TabsContent value="sunday" className="animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Domingo Manhã */}
              <div className="space-y-6">
                <ScheduleCard
                  title="Culto de Domingo"
                  subtitle="Manhã"
                  schedule={sundayMorningSchedule}
                  variant="secondary"
                  onNameChange={handleSundayMorningNameChange}
                  onDateChange={handleSundayMorningDateChange}
                  vocacionados={sundayMorningVocacionados}
                  onVocacionadosDateChange={handleSundayMorningVocacionadosDateChange}
                  onMinistryChange={handleSundayMorningMinistryChange}
                  memberStats={sundayMorningMemberStats}
                  onMemberStatsChange={setSundayMorningMemberStats}
                  onSaveVocacionados={() => handleSaveVocacionados("Domingo Manhã")}
                  onSaveMemberStats={() => handleSaveMemberStats("Domingo Manhã")}
                  isObservationUnlocked={isObservationUnlocked}
                  onObservationClick={() => setShowPasswordDialog(true)}
                />
              </div>

              {/* Domingo Noite */}
              <div className="space-y-6">
                <ScheduleCard
                  title="Culto de Domingo"
                  subtitle="Noite"
                  schedule={sundayEveningSchedule}
                  variant="accent"
                  onNameChange={handleSundayEveningNameChange}
                  onDateChange={handleSundayEveningDateChange}
                  vocacionados={sundayEveningVocacionados}
                  onVocacionadosDateChange={handleSundayEveningVocacionadosDateChange}
                  onMinistryChange={handleSundayEveningMinistryChange}
                  memberStats={sundayEveningMemberStats}
                  onMemberStatsChange={setSundayEveningMemberStats}
                  onSaveVocacionados={() => handleSaveVocacionados("Domingo Noite")}
                  onSaveMemberStats={() => handleSaveMemberStats("Domingo Noite")}
                  isObservationUnlocked={isObservationUnlocked}
                  onObservationClick={() => setShowPasswordDialog(true)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conexao-pre" className="animate-fade-in">
            <div className="max-w-2xl mx-auto space-y-6">
              <ScheduleCard
                title="Conexão Pré"
                subtitle="Culto de Conexão"
                schedule={conexaoPreSchedule}
                variant="accent"
                onNameChange={handleConexaoPreNameChange}
                onDateChange={handleConexaoPreDateChange}
                vocacionados={conexaoPreVocacionados}
                onVocacionadosDateChange={handleConexaoPreVocacionadosDateChange}
                onMinistryChange={handleConexaoPreMinistryChange}
                memberStats={conexaoPreMemberStats}
                onMemberStatsChange={setConexaoPreMemberStats}
                onSaveVocacionados={() => handleSaveVocacionados("Conexão Pré")}
                onSaveMemberStats={() => handleSaveMemberStats("Conexão Pré")}
                isObservationUnlocked={isObservationUnlocked}
                onObservationClick={() => setShowPasswordDialog(true)}
              />
            </div>
          </TabsContent>

          <TabsContent value="saturday" className="animate-fade-in">
            <div className="max-w-2xl mx-auto space-y-6">
              <ScheduleCard
                title="Culto de Sábado"
                subtitle="Programação da noite"
                schedule={saturdaySchedule}
                variant="primary"
                onNameChange={handleSaturdayNameChange}
                onDateChange={handleSaturdayDateChange}
                vocacionados={saturdayVocacionados}
                onVocacionadosDateChange={handleSaturdayVocacionadosDateChange}
                onMinistryChange={handleSaturdayMinistryChange}
                memberStats={saturdayMemberStats}
                onMemberStatsChange={setSaturdayMemberStats}
                onSaveVocacionados={() => handleSaveVocacionados("Sábado")}
                onSaveMemberStats={() => handleSaveMemberStats("Sábado")}
                isObservationUnlocked={isObservationUnlocked}
                onObservationClick={() => setShowPasswordDialog(true)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Card className="w-full max-w-6xl mx-auto mt-12 bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarIcon className="w-6 h-6 text-primary" />
                Ver Programação por Data e Culto
              </CardTitle>
              <Button
                onClick={exportToPDF}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={!selectedFilterDate || filteredActivities.length === 0}
              >
                <FileDown className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-[300px_1fr] gap-6">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedFilterDate}
                    onSelect={setSelectedFilterDate}
                    locale={ptBR}
                    disabled={(date) => date > new Date("2030-12-31")}
                    className="rounded-md border border-primary/20 pointer-events-auto"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Filtrar por Culto:</Label>
                  <RadioGroup value={selectedCulto} onValueChange={setSelectedCulto}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="cursor-pointer">Todos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="thursday" id="thursday" />
                      <Label htmlFor="thursday" className="cursor-pointer">Quinta-feira</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sunday-morning" id="sunday-morning" />
                      <Label htmlFor="sunday-morning" className="cursor-pointer">Domingo (Manhã)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sunday-evening" id="sunday-evening" />
                      <Label htmlFor="sunday-evening" className="cursor-pointer">Domingo (Noite)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="conexao-pre" id="conexao-pre" />
                      <Label htmlFor="conexao-pre" className="cursor-pointer">Conexão Pré</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="saturday" id="saturday" />
                      <Label htmlFor="saturday" className="cursor-pointer">Sábado</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div>
                {!selectedFilterDate ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Selecione uma data para ver as programações
                  </div>
                ) : filteredActivities.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhuma programação encontrada para {format(selectedFilterDate, "PPP", { locale: ptBR })}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-primary">
                        Programações para {format(selectedFilterDate, "PPP", { locale: ptBR })}
                      </h3>
                      <div className="rounded-lg border border-primary/20 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-primary/5">
                              <TableHead className="font-bold">Culto</TableHead>
                              <TableHead className="font-bold">Horário</TableHead>
                              <TableHead className="font-bold">Programação</TableHead>
                              <TableHead className="font-bold">Responsável</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredActivities.map((activity, index) => (
                              <TableRow key={index} className="hover:bg-muted/30">
                                <TableCell className="font-medium">
                                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded whitespace-nowrap">
                                    {activity.source}
                                  </span>
                                </TableCell>
                                <TableCell className="font-medium">{activity.time}</TableCell>
                                <TableCell>{activity.activity}</TableCell>
                                <TableCell>{activity.name || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Vocacionados Section */}
                    <div className="rounded-lg border border-primary/20 bg-card/50 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-primary" />
                        <h4 className="text-lg font-semibold">Vocacionados</h4>
                      </div>
                      <div className="space-y-2">
                        {filteredActivities.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">Nomes: </span>
                            <span className="text-muted-foreground">
                              {filteredActivities[0].vocacionados || "Nenhum vocacionado registrado"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Controle de Membros Section */}
                    <div className="rounded-lg border border-primary/20 bg-card/50 p-4">
                      <h4 className="text-lg font-semibold mb-4">Controle de Membros</h4>
                      {filteredActivities.length > 0 && filteredActivities[0].memberStats && (
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-primary/5">
                              <TableHead className="font-bold">Total de Membros</TableHead>
                              <TableHead className="font-bold">Visitantes</TableHead>
                              <TableHead className="font-bold">Crianças</TableHead>
                              <TableHead className="font-bold">Vocacionados Presentes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="text-center font-medium">
                                {filteredActivities[0].memberStats.totalMembros || "-"}
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {filteredActivities[0].memberStats.visitantes || "-"}
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {filteredActivities[0].memberStats.criancas || "-"}
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {filteredActivities[0].memberStats.vocacionados || "-"}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      )}
                      {filteredActivities.length > 0 && !filteredActivities[0].memberStats && (
                        <p className="text-sm text-muted-foreground">Nenhum dado de controle registrado</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Acesso às Observações</DialogTitle>
              <DialogDescription>
                Para acessar e editar as observações de todos os cultos, insira a senha abaixo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Senha de Acesso</label>
                <Input
                  type="password"
                  value={observationPassword}
                  onChange={(e) => setObservationPassword(e.target.value)}
                  placeholder="Digite a senha..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setObservationPassword("");
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handlePasswordSubmit}>
                  Confirmar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
