import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar as CalendarIcon, Save, Users, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

interface ScheduleCardProps {
  title: string;
  subtitle?: string;
  schedule: ScheduleItem[];
  variant?: "primary" | "secondary" | "accent";
  onNameChange?: (index: number, name: string) => void;
  onDateChange?: (index: number, date: Date | undefined) => void;
  vocacionados?: Vocacionados;
  onVocacionadosDateChange?: (date: Date | undefined) => void;
  onVocacionadosNameChange?: (index: number, name: string) => void;
  onAddVocacionadosName?: () => void;
  onMinistryChange?: (index: number, responsavel: string) => void;
  memberStats?: MemberStats;
  onMemberStatsChange?: (stats: MemberStats) => void;
  onSaveVocacionados?: () => void;
  onSaveMemberStats?: () => void;
  isObservationUnlocked?: boolean;
  onObservationClick?: () => void;
}

const ScheduleCard = ({ 
  title, 
  subtitle, 
  schedule, 
  variant = "primary", 
  onNameChange, 
  onDateChange,
  vocacionados,
  onVocacionadosDateChange,
  onVocacionadosNameChange,
  onAddVocacionadosName,
  onMinistryChange,
  memberStats,
  onMemberStatsChange,
  onSaveVocacionados,
  onSaveMemberStats,
  isObservationUnlocked = true,
  onObservationClick
}: ScheduleCardProps) => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Programação salva!",
      description: "As alterações foram salvas com sucesso.",
    });
  };
  const gradientClasses = {
    primary: "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20",
    secondary: "bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20",
    accent: "bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20",
  };

  return (
    <Card className={`${gradientClasses[variant]} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-primary" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </CardTitle>
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {schedule.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors duration-200"
            >
              <div className="flex-shrink-0 w-28 text-sm font-semibold text-primary">
                {item.time}
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium text-foreground">
                  {item.activity}
                </div>
                {onNameChange && (
                  <input
                    type="text"
                    value={item.name || ""}
                    onChange={(e) => onNameChange(index, e.target.value)}
                    placeholder="Adicionar responsável..."
                    className="w-full text-xs px-2 py-1 rounded bg-background/50 border border-border/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground placeholder:text-muted-foreground/50"
                  />
                )}
                {onDateChange && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-xs h-8",
                          !item.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {item.date ? format(item.date, "dd/MM/yyyy") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={item.date}
                        onSelect={(date) => onDateChange(index, date)}
                        disabled={(date) =>
                          date < new Date() || date > new Date(2030, 11, 31)
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={handleSave}
          className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Programação
        </Button>

        {/* Vocacionados Section */}
        {vocacionados && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Vocacionados</h3>
            </div>
            <div className="space-y-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !vocacionados.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {vocacionados.date ? format(vocacionados.date, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={vocacionados.date}
                    onSelect={onVocacionadosDateChange}
                    disabled={(date) =>
                      date < new Date() || date > new Date(2030, 11, 31)
                    }
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {vocacionados.ministries ? (
                <>
                  <div className="space-y-2 text-sm font-medium text-muted-foreground mb-2">
                    Ministérios:
                  </div>
                  {vocacionados.ministries.map((ministry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm font-medium w-40 flex-shrink-0">{ministry.name}:</span>
                      <Input
                        type="text"
                        value={ministry.responsavel}
                        onChange={(e) => onMinistryChange?.(index, e.target.value)}
                        placeholder="Nome do responsável..."
                        className="flex-1"
                      />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {vocacionados.names.map((name, index) => (
                    <Input
                      key={index}
                      type="text"
                      value={name}
                      onChange={(e) => onVocacionadosNameChange?.(index, e.target.value)}
                      placeholder="Nome do vocacionado..."
                    />
                  ))}

                  <Button
                    variant="outline"
                    onClick={onAddVocacionadosName}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar nome
                  </Button>
                </>
              )}

              <Button 
                onClick={onSaveVocacionados}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Vocacionados
              </Button>
            </div>
          </div>
        )}

        {/* Controle de Membros Section */}
        {memberStats && onMemberStatsChange && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <h3 className="text-lg font-semibold mb-4">Controle de Membros</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Total de Membros</TableHead>
                  <TableHead>Visitantes</TableHead>
                  <TableHead>Crianças</TableHead>
                  <TableHead>Vocacionados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Input
                      type="number"
                      value={memberStats.totalMembros}
                      onChange={(e) => onMemberStatsChange({...memberStats, totalMembros: e.target.value})}
                      placeholder="0"
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={memberStats.visitantes}
                      onChange={(e) => onMemberStatsChange({...memberStats, visitantes: e.target.value})}
                      placeholder="0"
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={memberStats.criancas}
                      onChange={(e) => onMemberStatsChange({...memberStats, criancas: e.target.value})}
                      placeholder="0"
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={memberStats.vocacionados}
                      onChange={(e) => onMemberStatsChange({...memberStats, vocacionados: e.target.value})}
                      placeholder="0"
                      className="w-20"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="mt-4">
              <label className="text-sm font-semibold mb-2 block">Observações</label>
              <textarea
                value={memberStats.observacao}
                onChange={(e) => onMemberStatsChange({...memberStats, observacao: e.target.value})}
                onFocus={() => {
                  if (!isObservationUnlocked && onObservationClick) {
                    onObservationClick();
                  }
                }}
                placeholder={isObservationUnlocked ? "Adicione observações sobre o culto..." : "Clique para desbloquear com senha..."}
                disabled={!isObservationUnlocked}
                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-vertical focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-pointer"
              />
            </div>

            <Button 
              onClick={onSaveMemberStats}
              className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Dados
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;
