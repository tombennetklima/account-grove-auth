
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Info, FileText, HelpCircle, Lock, CreditCard, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const guideItems = [
  {
    title: 'Matched Betting verstehen',
    icon: BookOpen,
    content: 'Matched Betting ist eine Technik, mit der man Wettanbieter-Boni und -Angebote in garantierten Gewinn umwandeln kann. Es basiert auf mathematischen Gleichungen, nicht auf Glück oder Spielwissen.',
  },
  {
    title: 'Datenschutz & Sicherheit',
    icon: Lock,
    content: 'Ihre Daten werden verschlüsselt gespeichert und nur für den Matched Betting Prozess verwendet. Wir geben Ihre Daten niemals an Dritte weiter.',
  },
  {
    title: 'Kontoregistrierung',
    icon: CreditCard,
    content: 'Für den Matched Betting Prozess benötigen wir Zugang zu Ihrem Bankkonto. Dieser Zugang wird nur für die Dauer des Prozesses gewährt und danach wieder aufgehoben.',
  },
  {
    title: 'Wichtige Hinweise',
    icon: AlertTriangle,
    content: 'Laden Sie Ihre Dokumente erst hoch, nachdem Sie Ihr Bankkonto eröffnet haben. Stellen Sie sicher, dass alle Dokumente gut lesbar sind, um Verzögerungen zu vermeiden.',
  },
  {
    title: 'Häufig gestellte Fragen',
    icon: HelpCircle,
    content: 'Finden Sie Antworten auf die häufigsten Fragen zu unserem Matched Betting Service.',
  },
];

const Guide: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">Leitfaden</h2>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Download als PDF
        </Button>
      </div>
      
      <Card className="glass-morphism overflow-hidden">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-medium">Wichtige Informationen zu Matched Betting</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Willkommen beim Betclever Matched Betting Service. Dieser Leitfaden enthält wichtige Informationen zum Prozess und alles, was Sie wissen müssen, um erfolgreich mit Matched Betting zu starten.
          </p>
          
          {guideItems.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Separator className="my-4" />}
              <div className="hover-scale transition-all duration-200 ease-in-out">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
          
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Haben Sie weitere Fragen?</h4>
            <p className="text-sm text-muted-foreground">
              Wir sind hier, um zu helfen. Kontaktieren Sie uns jederzeit unter <span className="text-primary">support@betclever.de</span>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Guide;
